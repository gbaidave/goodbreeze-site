/**
 * POST /api/support/[id]/user-reply
 *
 * Authenticated user adds a follow-up message to their own support ticket.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params

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
    const message = (body.message ?? '').trim()
    if (message.length < 1) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
    }
    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message too long (max 2000 characters).' }, { status: 400 })
    }

    const svc = createServiceClient()

    // Ownership check — user can only reply to their own tickets
    const { data: ticket } = await svc
      .from('support_requests')
      .select('id, user_id, status')
      .eq('id', requestId)
      .eq('user_id', user.id)
      .single()

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 })
    }

    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      return NextResponse.json({ error: 'This ticket is already closed.' }, { status: 400 })
    }

    const { error: msgError } = await svc.from('support_messages').insert({
      request_id: requestId,
      sender_id: user.id,
      sender_role: 'user',
      message,
    })

    if (msgError) {
      return NextResponse.json({ error: 'Failed to send reply.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
