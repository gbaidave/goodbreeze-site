/**
 * DELETE /api/reports/bulk-delete
 *
 * Deletes multiple or all reports owned by the authenticated user.
 * Body: { all: true } to delete everything, or { ids: string[] } for specific reports.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function DELETE(request: NextRequest) {
  try {
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

    const body = await request.json()

    if (body.all === true) {
      // Delete all reports for this user
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else if (Array.isArray(body.ids) && body.ids.length > 0) {
      // Delete specific reports — ownership enforced via user_id filter
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('user_id', user.id)
        .in('id', body.ids)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else {
      return NextResponse.json({ error: 'Provide all: true or ids: string[]' }, { status: 400 })
    }

    return NextResponse.json({ success: true })

  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
