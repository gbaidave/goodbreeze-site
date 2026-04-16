/**
 * PATCH /api/reports/[id]
 *
 * Marks a stuck pending/processing report as failed.
 * Called by the dashboard polling loop when a report exceeds the 10-minute
 * timeout threshold. Setting status to 'failed' fires the DB triggers that
 * refund the credit and create a bell notification automatically.
 *
 * DELETE /api/reports/[id]
 *
 * Deletes a single report owned by the authenticated user.
 * Works for any report status.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'

const TIMEOUT_MS = 10 * 60 * 1000 // 10 minutes

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const svc = createServiceClient()

    const { data: existing } = await svc
      .from('reports')
      .select('id, status, created_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    if (existing.status !== 'pending' && existing.status !== 'processing') {
      // Already in a terminal state — idempotent, return success
      return NextResponse.json({ success: true, status: existing.status })
    }

    const ageMs = Date.now() - new Date(existing.created_at).getTime()
    if (ageMs < TIMEOUT_MS) {
      return NextResponse.json({ error: 'Report has not yet exceeded the timeout threshold' }, { status: 400 })
    }

    const { error } = await svc
      .from('reports')
      .update({ status: 'failed' })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // DB triggers on reports table handle:
    //   refund_on_report_failure()         → credit refunded
    //   notify_on_report_status_change()   → bell notification created

    return NextResponse.json({ success: true, status: 'failed' })

  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Use service client for delete to bypass potential RLS SELECT policy gaps.
    // Ownership check is done explicitly via user_id filter before deleting.
    const svc = createServiceClient()

    const { data: existing } = await svc
      .from('reports')
      .select('id, status, usage_type, credit_row_id, credit_amount, free_system, report_type, created_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Refund credit when user cancels an in-flight report.
    // Done directly (not via failure trigger) to avoid a spurious "report failed" notification.
    if (
      (existing.status === 'pending' || existing.status === 'processing') &&
      existing.usage_type &&
      existing.usage_type !== 'admin'
    ) {
      const refundAmount = existing.credit_amount ?? 1

      if (existing.usage_type === 'credits' && existing.credit_row_id) {
        const { data: creditRow } = await svc
          .from('credits')
          .select('balance')
          .eq('id', existing.credit_row_id)
          .single()
        if (creditRow) {
          await svc.from('credits').update({ balance: creditRow.balance + refundAmount }).eq('id', existing.credit_row_id)
        }
      } else if (existing.usage_type === 'subscription') {
        const { data: sub } = await svc
          .from('subscriptions')
          .select('id, credits_remaining')
          .eq('user_id', user.id)
          .in('status', ['active', 'trialing'])
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        if (sub) {
          await svc.from('subscriptions').update({ credits_remaining: sub.credits_remaining + refundAmount }).eq('id', sub.id)
        }
      }
      // Free slot: intentionally NOT restored on delete.
      // Plan allowance (report_type_usage): intentionally NOT decremented on delete.
      // Both are permanent consumption — only failure trigger can decrement plan usage.
    }

    const { error } = await svc
      .from('reports')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
