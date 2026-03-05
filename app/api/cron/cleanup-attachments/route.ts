/**
 * GET /api/cron/cleanup-attachments
 *
 * Cron job: runs daily (2 AM UTC) via Vercel crons.
 * Deletes support_attachments older than 30 days from storage and the DB.
 * Processes up to 100 records per run to avoid timeouts.
 *
 * Protected by CRON_SECRET.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service-client'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const svc = createServiceClient()
  const cutoff = new Date(Date.now() - THIRTY_DAYS_MS).toISOString()

  const { data: old, error: fetchError } = await svc
    .from('support_attachments')
    .select('id, storage_path')
    .lt('created_at', cutoff)
    .limit(100)

  if (fetchError) {
    console.error('cleanup-attachments: fetch error', fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!old?.length) {
    return NextResponse.json({ deleted: 0, message: 'No old attachments found.' })
  }

  // Delete from storage
  const paths = old.map((a) => a.storage_path)
  const { error: storageError } = await svc.storage
    .from('support-attachments')
    .remove(paths)

  if (storageError) {
    console.error('cleanup-attachments: storage delete error', storageError)
    // Continue anyway — remove DB rows so they don't block future cleanup
  }

  // Delete DB rows
  const ids = old.map((a) => a.id)
  const { error: dbError } = await svc
    .from('support_attachments')
    .delete()
    .in('id', ids)

  if (dbError) {
    console.error('cleanup-attachments: DB delete error', dbError)
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  console.log(`cleanup-attachments: deleted ${ids.length} attachment(s)`)
  return NextResponse.json({ deleted: ids.length, ids })
}
