/**
 * GET /api/account/export
 *
 * GDPR Art. 20 / CCPA data portability — returns a ZIP containing the
 * authenticated user's data as JSON files plus a human-readable HTML index.
 *
 * Rate limit: 3 lifetime downloads. On the 3rd, data_export_locked is set to
 * true and an admin bell notification fires. Locked users must contact support.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'
import { zipSync, strToU8 } from 'fflate'

const EXPORT_LIMIT = 3

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const svc = createServiceClient()

  // ── Check lock ──────────────────────────────────────────────────────────────
  const { data: profile } = await svc
    .from('profiles')
    .select('name, email, phone, role, email_preferences, data_export_locked')
    .eq('id', user.id)
    .single()

  if (profile?.data_export_locked) {
    return NextResponse.json(
      { error: 'DATA_EXPORT_LOCKED', message: 'Data export is locked. Contact support to request access.' },
      { status: 423 }
    )
  }

  // ── Log this attempt ────────────────────────────────────────────────────────
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
  const ua = req.headers.get('user-agent') ?? null

  await svc.from('data_export_logs').insert({
    user_id: user.id,
    ip_address: ip,
    user_agent: ua,
    success: true,
  })

  // ── Count total exports — enforce 3-strike limit ────────────────────────────
  const { count } = await svc
    .from('data_export_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if ((count ?? 0) >= EXPORT_LIMIT) {
    await svc
      .from('profiles')
      .update({ data_export_locked: true })
      .eq('id', user.id)

    // Fire admin bell notification (non-fatal)
    try {
      await svc.from('notifications').insert({
        user_id: null,
        type: 'export_abuse',
        title: 'Data export locked',
        message: `User ${profile?.email ?? user.email} has been locked from data export after ${EXPORT_LIMIT} downloads. Review for potential abuse.`,
        link: `/admin/users/${user.id}`,
        for_admin: true,
      })
    } catch { /* non-fatal */ }

    return NextResponse.json(
      { error: 'DATA_EXPORT_LOCKED', message: 'Data export limit reached. Contact support to request access.' },
      { status: 423 }
    )
  }

  // ── Gather all user data ────────────────────────────────────────────────────
  const [
    subRes,
    creditsRes,
    reportsRes,
    supportRes,
    referralRes,
    refundRes,
  ] = await Promise.all([
    svc.from('subscriptions').select('plan, status, current_period_end, cancel_at_period_end, credits_remaining, created_at').eq('user_id', user.id),
    svc.from('credits').select('amount, balance, purchased_at, stripe_payment_intent_id').eq('user_id', user.id).order('purchased_at', { ascending: false }),
    svc.from('reports').select('id, report_type, status, created_at, expires_at, input_url, keyword, target_company').eq('user_id', user.id).order('created_at', { ascending: false }),
    svc.from('support_tickets').select('id, category, subject, status, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
    svc.from('referral_codes').select('code, credits_earned, created_at').eq('user_id', user.id),
    svc.from('refund_requests').select('id, product_type, status, created_at, amount_cents').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  const exportDate = new Date().toISOString()

  const profileData = {
    exported_at: exportDate,
    id: user.id,
    email: profile?.email ?? user.email,
    name: profile?.name,
    phone: profile?.phone,
    role: profile?.role,
    email_preferences: profile?.email_preferences,
    auth_provider: user.app_metadata?.provider ?? 'email',
    created_at: user.created_at,
  }

  const creditsData = {
    subscriptions: subRes.data ?? [],
    credit_packs: creditsRes.data ?? [],
    refund_requests: refundRes.data ?? [],
  }

  const reportsData = {
    reports: (reportsRes.data ?? []).map(r => ({
      ...r,
      note: 'PDF files are not included in this export. Use the PDF download links in your dashboard while your account is active.',
    })),
  }

  const supportData = {
    tickets: supportRes.data ?? [],
    note: 'Message content is not included for privacy reasons. Contact support@goodbreeze.ai if you need full ticket history.',
  }

  const referralsData = {
    referral_codes: referralRes.data ?? [],
  }

  // ── Build HTML index ────────────────────────────────────────────────────────
  const html = buildHtmlIndex({ profileData, creditsData, reportsData, supportData, referralsData, exportDate })

  // ── Build ZIP ───────────────────────────────────────────────────────────────
  const enc = (obj: unknown) => strToU8(JSON.stringify(obj, null, 2))
  const zipData = zipSync({
    'profile.json':   enc(profileData),
    'credits.json':   enc(creditsData),
    'reports.json':   enc(reportsData),
    'support.json':   enc(supportData),
    'referrals.json': enc(referralsData),
    'index.html':     strToU8(html),
  })

  const dateStr = new Date().toISOString().split('T')[0]
  return new NextResponse(Buffer.from(zipData), {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="goodbreeze-data-export-${dateStr}.zip"`,
      'Content-Length': zipData.byteLength.toString(),
    },
  })
}

// ── HTML builder ──────────────────────────────────────────────────────────────
function buildHtmlIndex({ profileData, creditsData, reportsData, supportData, referralsData, exportDate }: {
  profileData: Record<string, unknown>
  creditsData: Record<string, unknown>
  reportsData: Record<string, unknown>
  supportData: Record<string, unknown>
  referralsData: Record<string, unknown>
  exportDate: string
}) {
  const esc = (v: unknown) => String(v ?? '—').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const row = (k: string, v: unknown) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`
  const reports = (reportsData.reports as Record<string, unknown>[]) ?? []
  const subs = (creditsData.subscriptions as Record<string, unknown>[]) ?? []
  const packs = (creditsData.credit_packs as Record<string, unknown>[]) ?? []
  const tickets = (supportData.tickets as Record<string, unknown>[]) ?? []

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Good Breeze AI — Your Data Export</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 860px; margin: 40px auto; padding: 0 20px; color: #111; }
  h1 { color: #1a1a2e; } h2 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 8px; margin-top: 40px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { text-align: left; width: 200px; padding: 8px 12px; background: #f5f5f5; font-weight: 600; }
  td { padding: 8px 12px; border-top: 1px solid #eee; }
  tr:first-child td, tr:first-child th { border-top: none; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
  .badge-pass { background: #d1fae5; color: #065f46; }
  .badge-fail { background: #fee2e2; color: #991b1b; }
  .meta { color: #666; font-size: 14px; }
  .section-note { color: #666; font-size: 13px; font-style: italic; margin-bottom: 12px; }
</style>
</head>
<body>
<h1>Good Breeze AI — Data Export</h1>
<p class="meta">Exported on ${esc(exportDate)} &bull; This file is for your records. JSON files in this ZIP contain the complete machine-readable data.</p>

<h2>Profile</h2>
<table>
  ${row('Email', profileData.email)}
  ${row('Name', profileData.name)}
  ${row('Phone', profileData.phone)}
  ${row('Account created', profileData.created_at)}
  ${row('Auth provider', profileData.auth_provider)}
</table>

<h2>Subscriptions</h2>
${subs.length === 0 ? '<p class="section-note">No subscription history.</p>' : `<table><tr><th>Plan</th><th>Status</th><th>Period end</th><th>Credits</th></tr>${subs.map(s => `<tr><td>${esc(s.plan)}</td><td>${esc(s.status)}</td><td>${esc(s.current_period_end)}</td><td>${esc(s.credits_remaining)}</td></tr>`).join('')}</table>`}

<h2>Credit Packs</h2>
${packs.length === 0 ? '<p class="section-note">No credit pack purchases.</p>' : `<table><tr><th>Amount</th><th>Balance</th><th>Purchased</th></tr>${packs.map(p => `<tr><td>${esc(p.amount)}</td><td>${esc(p.balance)}</td><td>${esc(p.purchased_at)}</td></tr>`).join('')}</table>`}

<h2>Reports (${reports.length})</h2>
${reports.length === 0 ? '<p class="section-note">No reports.</p>' : `<table><tr><th>Type</th><th>Status</th><th>Created</th><th>Input</th></tr>${reports.map(r => `<tr><td>${esc(r.report_type)}</td><td>${esc(r.status)}</td><td>${esc(r.created_at)}</td><td>${esc((r.input_url as string) || (r.keyword as string) || (r.target_company as string))}</td></tr>`).join('')}</table>`}

<h2>Support Tickets (${tickets.length})</h2>
${tickets.length === 0 ? '<p class="section-note">No support tickets.</p>' : `<table><tr><th>Category</th><th>Subject</th><th>Status</th><th>Created</th></tr>${tickets.map(t => `<tr><td>${esc(t.category)}</td><td>${esc(t.subject)}</td><td>${esc(t.status)}</td><td>${esc(t.created_at)}</td></tr>`).join('')}</table>`}

<h2>Referrals</h2>
${((referralsData.referral_codes as Record<string, unknown>[]) ?? []).length === 0
  ? '<p class="section-note">No referral data.</p>'
  : `<table><tr><th>Code</th><th>Credits earned</th><th>Created</th></tr>${((referralsData.referral_codes as Record<string, unknown>[]) ?? []).map(r => `<tr><td>${esc(r.code)}</td><td>${esc(r.credits_earned)}</td><td>${esc(r.created_at)}</td></tr>`).join('')}</table>`}

<hr style="margin-top:48px">
<p class="meta">Questions? Contact <a href="mailto:support@goodbreeze.ai">support@goodbreeze.ai</a></p>
</body>
</html>`
}
