/**
 * GET /api/cron/expire-reports
 *
 * Cron job: runs every hour via Vercel crons.
 * Finds reports stuck in 'pending' or 'processing' for 3+ hours and marks
 * them as 'failed'. The DB triggers (refund + notification) fire automatically
 * on the status change — no manual credit refund logic needed here.
 *
 * Protected by CRON_SECRET (set in Vercel env vars).
 * Vercel sends: Authorization: Bearer {CRON_SECRET}
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service-client'

const THREE_HOURS_MS = 3 * 60 * 60 * 1000

export async function GET(request: NextRequest) {
  // Verify Vercel cron authorization
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const cutoff = new Date(Date.now() - THREE_HOURS_MS).toISOString()

  // Find all reports stuck in pending/processing for 3+ hours
  const { data: stuckReports, error: fetchError } = await supabase
    .from('reports')
    .select('id, user_id, report_type, status, created_at')
    .in('status', ['pending', 'processing'])
    .lt('created_at', cutoff)

  if (fetchError) {
    console.error('expire-reports cron: fetch error', fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!stuckReports || stuckReports.length === 0) {
    return NextResponse.json({ expired: 0, message: 'No stuck reports found.' })
  }

  const ids = stuckReports.map(r => r.id)

  // Mark all stuck reports as failed.
  // The DB triggers fire automatically:
  //   trg_refund_on_report_failure  → refunds credits or credits_remaining
  //   trg_notify_report_status_change → inserts bell notification for each user
  const { error: updateError } = await supabase
    .from('reports')
    .update({ status: 'failed' })
    .in('id', ids)

  if (updateError) {
    console.error('expire-reports cron: update error', updateError)
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  console.log(`expire-reports cron: expired ${ids.length} stuck report(s)`, ids)

  return NextResponse.json({
    expired: ids.length,
    ids,
  })
}
