/**
 * GET /api/admin/failure-status
 *
 * One-click magic link handler. Sent via email to dave@goodbreeze.ai when a report fails.
 * Verifies HMAC signature, updates admin_failure_status, redirects to /admin/errors.
 * No login required — secured by signed token (7-day TTL).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service-client'
import { verifyFailureToken } from '@/lib/admin/hmac'

const VALID_STATUSES = ['unresolved', 'in_progress', 'resolved', 'wont_fix']

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const id     = searchParams.get('id')
  const status = searchParams.get('status')
  const ts     = searchParams.get('ts')
  const sig    = searchParams.get('sig')

  const errRedirect = NextResponse.redirect(new URL('/admin/errors', origin))

  if (!id || !status || !ts || !sig) return errRedirect
  if (!VALID_STATUSES.includes(status)) return errRedirect

  const tsNum = parseInt(ts, 10)
  if (isNaN(tsNum) || !verifyFailureToken(id, status, tsNum, sig)) {
    return new NextResponse('This link is invalid or has expired.', { status: 400 })
  }

  const svc = createServiceClient()
  await svc
    .from('reports')
    .update({ admin_failure_status: status })
    .eq('id', id)
    .in('status', ['failed', 'failed_site_blocked'])

  return NextResponse.redirect(new URL(`/admin/errors?highlight=${id}`, origin))
}
