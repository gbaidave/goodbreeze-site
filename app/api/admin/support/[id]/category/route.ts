/**
 * PATCH /api/admin/support/[id]/category
 *
 * Change the category of a support ticket.
 * Body: { category: string }
 *
 * Access: support, admin, superadmin (change_ticket_category permission)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'
import { canDo } from '@/lib/permissions'

const VALID_CATEGORIES = [
  'help', 'report_issue', 'billing', 'refund', 'dispute', 'account_access', 'feedback', 'bug_report',
]

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: ticketId } = await params

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          ),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const svc = createServiceClient()
  const { data: actorProfile } = await svc
    .from('profiles').select('role').eq('id', user.id).single()
  const actorRole = actorProfile?.role

  if (!canDo(actorRole, 'change_ticket_category')) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const body = await request.json()
  const { category } = body as { category: string }

  if (!category || !VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: 'Invalid category.' }, { status: 400 })
  }

  const { data: ticket } = await svc
    .from('support_requests')
    .select('id')
    .eq('id', ticketId)
    .single()
  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 })
  }

  const { error: updateError } = await svc
    .from('support_requests')
    .update({ category })
    .eq('id', ticketId)

  if (updateError) {
    console.error('[category] Update error:', updateError)
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
