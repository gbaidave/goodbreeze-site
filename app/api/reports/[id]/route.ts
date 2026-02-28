/**
 * DELETE /api/reports/[id]
 *
 * Deletes a single report owned by the authenticated user.
 * Works for any report status.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

    // Ownership check — users can only delete their own reports
    const { data: deleted, error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If no rows returned, report didn't exist or RLS blocked the delete
    if (!deleted || deleted.length === 0) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })

  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
