/**
 * GET /api/cron/close-idle-tickets
 *
 * Nightly cron: closes support tickets with no activity in 7+ days.
 * "No activity" = no new messages since the ticket was last updated.
 * Only affects tickets with status 'open' or 'in_progress'.
 *
 * Protected by CRON_SECRET (set in Vercel env vars).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service-client'

const IDLE_DAYS = 7
const IDLE_MS = IDLE_DAYS * 24 * 60 * 60 * 1000

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const svc = createServiceClient()
  const cutoff = new Date(Date.now() - IDLE_MS).toISOString()

  // Find tickets with no messages after the cutoff, or no messages at all
  const { data: idleTickets, error: fetchError } = await svc
    .from('support_requests')
    .select('id, updated_at')
    .in('status', ['open', 'in_progress'])
    .lt('updated_at', cutoff)

  if (fetchError) {
    console.error('close-idle-tickets cron: fetch error', fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!idleTickets || idleTickets.length === 0) {
    return NextResponse.json({ closed: 0, message: 'No idle tickets found.' })
  }

  const ids = idleTickets.map((t) => t.id)

  const { error: updateError } = await svc
    .from('support_requests')
    .update({ status: 'closed' })
    .in('id', ids)

  if (updateError) {
    console.error('close-idle-tickets cron: update error', updateError)
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  console.log(`close-idle-tickets cron: closed ${ids.length} idle ticket(s)`, ids)

  return NextResponse.json({ closed: ids.length, ids })
}
