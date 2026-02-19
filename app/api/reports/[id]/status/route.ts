/**
 * GET /api/reports/[id]/status
 *
 * Polls the status of a specific report.
 * Only the report's owner can query it.
 *
 * Returns: { status, pdf_url, expires_at, report_type, created_at }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 })
    }

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

    const { data: report, error } = await supabase
      .from('reports')
      .select('id, status, pdf_url, expires_at, report_type, created_at')
      .eq('id', id)
      .eq('user_id', user.id) // ownership check — users can only query their own reports
      .single()

    if (error || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    return NextResponse.json({
      status: report.status,
      pdf_url: report.pdf_url,
      expires_at: report.expires_at,
      report_type: report.report_type,
      created_at: report.created_at,
    })

  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
