import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service-client'
import { getCatalogItem, getActiveSubscriptionPlans, getActivePackProducts } from '@/lib/catalog'
import { canDo } from '@/lib/permissions'
import ReportList from './ReportList'
import { ReferralSection } from './ReferralSection'
import { NudgeCard } from './NudgeCard'
import SupportSection from './SupportSection'
import { PasswordWarningPopup } from './PasswordWarningPopup'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>
}) {
  const params = await searchParams
  const showWelcomeBanner = params.welcome === '1'
  const supabase = await createClient()

  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'] = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Supabase error — treat as unauthenticated
  }
  if (!user) redirect('/login')

  // Fetch profile, subscription, credits, reports, referral data, testimonials, and support in parallel
  const serviceClient = createServiceClient()
  const [profileRes, subRes, creditsRes, reportsRes, referralRes, testimonialsRes, ticketsRes] = await Promise.all([
    supabase.from('profiles').select('name, email, role, plan_override_type, plan_override_until, password_last_changed_at, free_reports_used').eq('id', user.id).single(),
    supabase.from('subscriptions').select('plan, status, current_period_end, credits_remaining, cancel_at_period_end, cancel_at')
      .eq('user_id', user.id).in('status', ['active', 'trialing']).order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('credits').select('balance, expires_at').eq('user_id', user.id).gt('balance', 0).order('purchased_at', { ascending: true }),
    supabase.from('reports').select('id, report_type, status, created_at, pdf_url, expires_at, input_data').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(100),
    supabase.from('referral_codes').select('code, referral_uses(reward_granted)').eq('user_id', user.id).single(),
    supabase.from('testimonials').select('type').eq('user_id', user.id).in('status', ['approved', 'pending']),
    serviceClient.from('support_requests').select('id, message, status, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
  ])

  const profile = profileRes.data
  const sub = subRes.data
  const credits = creditsRes.data ?? []
  const reports = reportsRes.data ?? []

  // Catalog snapshot for dashboard copy (BPR cost + cheapest plan/pack for upgrade banner)
  const [bprCatalog, catalogPlans, catalogPacks] = await Promise.all([
    getCatalogItem('RPT-BPR'),
    getActiveSubscriptionPlans(),
    getActivePackProducts(),
  ])
  const bprCreditCost = bprCatalog?.priceCredits ?? 0
  const cheapestPlanCents = catalogPlans.length
    ? Math.min(...catalogPlans.map(p => p.priceUsdCents ?? Number.POSITIVE_INFINITY))
    : null
  const cheapestPackCents = catalogPacks.length
    ? Math.min(...catalogPacks.map(p => p.priceUsdCents ?? Number.POSITIVE_INFINITY))
    : null
  const planFrom = cheapestPlanCents && cheapestPlanCents !== Number.POSITIVE_INFINITY
    ? `$${Math.round(cheapestPlanCents / 100)}`
    : ''
  const packFrom = cheapestPackCents && cheapestPackCents !== Number.POSITIVE_INFINITY
    ? `$${Math.round(cheapestPackCents / 100)}`
    : ''
  let referralCode = referralRes.data?.code ?? null
  if (!referralCode) {
    // Auto-generate a referral code for users who don't have one yet
    const code = 'gb' + Math.random().toString(36).slice(2, 8).toUpperCase()
    const { data: newCodeRow } = await serviceClient
      .from('referral_codes')
      .insert({ user_id: user.id, code })
      .select('code')
      .single()
    referralCode = newCodeRow?.code ?? null
  }
  const referralUses = (referralRes.data as any)?.referral_uses ?? []
  const referralSignups = referralUses.length
  const referralCredits = referralUses.filter((u: { reward_granted: boolean }) => u.reward_granted).length
  const submittedTestimonialTypes = (testimonialsRes.data ?? []).map((t: { type: string }) => t.type)
  const hasWrittenTestimonial = submittedTestimonialTypes.includes('written')
  const hasVideoTestimonial = submittedTestimonialTypes.includes('video')

  // Support tickets + messages
  const rawTickets = ticketsRes.data ?? []
  const ticketIds = rawTickets.map((t) => t.id)
  const { data: allMessages } = ticketIds.length
    ? await serviceClient
        .from('support_messages')
        .select('id, request_id, sender_role, message, created_at')
        .in('request_id', ticketIds)
        .order('created_at', { ascending: true })
    : { data: [] }
  const msgByTicket: Record<string, Array<{ id: string; sender_role: 'user' | 'admin'; message: string; created_at: string }>> = {}
  for (const msg of allMessages ?? []) {
    if (!msgByTicket[msg.request_id]) msgByTicket[msg.request_id] = []
    msgByTicket[msg.request_id]!.push(msg as any)
  }
  const tickets = rawTickets.map((t) => ({ ...t, messages: msgByTicket[t.id] ?? [] }))

  // Plan: check for active override
  const overrideActive =
    profile?.plan_override_type &&
    (!profile.plan_override_until || new Date(profile.plan_override_until) > new Date())
  const rawPlan = sub?.plan ?? 'free'
  const plan = overrideActive ? (profile!.plan_override_type as string) : rawPlan

  // Password expiry warning — shown as popup for email/password users within 7 days of expiry
  const isEmailUser = (user.app_metadata?.providers as string[] | undefined)?.includes('email') ?? false
  const pwLastChanged = profile?.password_last_changed_at
  const pwExpiryMs = pwLastChanged ? new Date(pwLastChanged).getTime() + 90 * 86400000 : null
  const daysUntilExpiry = pwExpiryMs ? Math.ceil((pwExpiryMs - Date.now()) / 86400000) : null
  const showPwWarning = isEmailUser && daysUntilExpiry !== null && daysUntilExpiry > 0 && daysUntilExpiry <= 7
  const pwExpiryDateLabel = pwExpiryMs
    ? new Date(pwExpiryMs).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : ''

  const firstName = profile?.name?.split(' ')[0] || profile?.email?.split('@')[0] || 'there'
  const isAdminPanel = canDo(profile?.role, 'view_admin_panel') // superadmin, admin, support — gets admin link
  const isAdmin = isAdminPanel || profile?.role === 'tester'    // also tester — suppresses billing/nudge UI
  const isTester = profile?.role === 'tester'

  const PAID_PLANS = ['PLN-STARTER', 'PLN-GROWTH', 'PLN-PRO', 'custom']
  const SUBSCRIPTION_PLANS = ['PLN-STARTER', 'PLN-GROWTH', 'PLN-PRO']
  const isSubscription = SUBSCRIPTION_PLANS.includes(plan)

  // Credits available for reports:
  // Subscription users: subscription credits (credits_remaining) + pack credits (credits table)
  // Free/impulse users: pack credits only
  const packCredits = credits.reduce((sum, c) => sum + (c.balance ?? 0), 0)
  const subscriptionCredits = isSubscription ? (sub?.credits_remaining ?? 0) : 0
  const totalCredits = packCredits  // legacy alias used by NudgeCard / exhaustion check
  const totalAvailableCredits = isSubscription ? subscriptionCredits + packCredits : packCredits

  const isExhausted = !PAID_PLANS.includes(plan) && !isAdmin && packCredits === 0
  const isLowCredits = !isAdmin && totalAvailableCredits >= 1 && totalAvailableCredits <= 2
  const isSubscriberExhausted = isSubscription && !isAdmin && subscriptionCredits === 0 && packCredits === 0


  return (
    <div className="min-h-screen bg-dark py-12 px-6">
      {showPwWarning && (
        <PasswordWarningPopup daysUntilExpiry={daysUntilExpiry!} expiryDate={pwExpiryDateLabel} />
      )}
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Welcome banner — shown on first login after email confirmation */}
        {showWelcomeBanner && (
          <div className="bg-gradient-to-r from-primary/10 to-accent-blue/10 border border-primary/30 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold">Account created. You&apos;re in.</p>
              <p className="text-gray-400 text-sm mt-0.5">
                Your first Business Presence Report is free.{' '}
                <a href="/reports/business-presence" className="text-primary hover:text-primary/80 transition-colors font-medium">Run it now</a>{' '}
                to see how your business shows up online.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Hey, {firstName} 👋</h1>
            <p className="text-gray-400 mt-1">Here&apos;s your Good Breeze AI dashboard.</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/support"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Support & requests
            </a>
            {isAdminPanel && (
              <a
                href="/admin"
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                {profile?.role === 'support' ? 'Support Dashboard' : 'Admin Dashboard'} →
              </a>
            )}
            {isTester && (
              <a
                href="/admin/bug-reports"
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Tester Dashboard →
              </a>
            )}
            <a
              href="/reports"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Run a new report
            </a>
          </div>
        </div>

        {/* Plan + Credits */}
        <div className="grid sm:grid-cols-3 gap-4">

          {/* Plan */}
          <div className="bg-dark-700 border border-primary/20 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Current plan</p>
              <p className="text-2xl font-bold text-white capitalize">
                {profile?.role === 'support' ? 'Support Account' : isTester ? 'Tester Account' : (profile?.role === 'superadmin' || profile?.role === 'admin') ? 'Admin Account' : plan}
              </p>
              {!isAdmin && sub?.current_period_end && (() => {
                const isCancelling = !!sub.cancel_at_period_end || !!sub.cancel_at
                const displayIso = (sub.cancel_at as string | null) ?? sub.current_period_end
                return (
                  <p className={`text-xs mt-1 ${isCancelling ? 'text-amber-400' : 'text-gray-500'}`}>
                    {isCancelling ? 'Cancels on' : 'Renews'} {new Date(displayIso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )
              })()}
              {isAdmin && (
                <p className="text-gray-500 text-xs mt-1">Full access. No billing required</p>
              )}
            </div>
            {isSubscription && !isAdmin && (
              <a
                href="/account"
                className="mt-3 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Manage Plan →
              </a>
            )}
          </div>

          {/* Credits */}
          <div className="bg-dark-700 border border-primary/20 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Credits</p>
            <p className="text-2xl font-bold text-white">
              {isAdmin ? '∞' : totalAvailableCredits}
            </p>
            <p className="text-gray-500 text-xs mt-1">
              {isAdmin
                ? 'Full access. No billing required.'
                : totalAvailableCredits === 0
                  ? <>No credits remaining. <a href="/pricing" className="text-primary hover:text-primary/80 transition-colors">Buy More Credits →</a></>
                  : isLowCredits
                    ? <>Credits running low. <a href="/pricing" className="text-primary hover:text-primary/80 transition-colors">Buy More Credits →</a></>
                    : isSubscription
                      ? `${totalAvailableCredits} credit${totalAvailableCredits !== 1 ? 's' : ''} remaining`
                      : `${totalAvailableCredits} credit${totalAvailableCredits !== 1 ? 's' : ''} available`}
            </p>
          </div>

          {/* Reports run */}
          <div className="bg-dark-700 border border-primary/20 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Reports generated</p>
            <p className="text-2xl font-bold text-white">{reports.length}</p>
            <p className="text-gray-500 text-xs mt-1">All time</p>
          </div>
        </div>

        {/* Referral — above report history, hidden from admins */}
        {!isAdmin && referralCode && (
          <div id="referral">
            <ReferralSection
              code={referralCode}
              signups={referralSignups}
              creditsEarned={referralCredits}
            />
          </div>
        )}

        {/* Business Presence Report card */}
        {(() => {
          const bpr = reports.find(r => r.report_type === 'RPT-BPR' && r.status === 'complete')
          const bprScore = bpr ? (bpr as any).input_data?.overallScore : null
          const bprDate = bpr ? new Date(bpr.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null
          const freeUsed = profile?.free_reports_used as Record<string, boolean> | null
          const hasFreeSlot = !freeUsed?.['RPT-BPR']
          return (
            <div className="bg-dark-700 border border-primary/20 rounded-2xl px-6 py-5 flex items-center gap-5">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-bold text-white mb-0.5">Business Presence Report</h3>
                {bpr ? (
                  <div className="flex items-center gap-4 flex-wrap">
                    {bprScore != null && <span className="text-xl font-extrabold text-primary">{bprScore}<span className="text-xs text-gray-500 font-normal"> / 100</span></span>}
                    <span className="text-xs text-gray-500">Last checked {bprDate}</span>
                  </div>
                ) : hasFreeSlot ? (
                  <p className="text-sm text-gray-400">See how visible your business is online. <span className="text-primary font-semibold">First one is free.</span></p>
                ) : (
                  <p className="text-sm text-gray-400">See how visible your business is online. <span className="text-gray-500">{bprCreditCost} credit{bprCreditCost === 1 ? '' : 's'} per report.</span></p>
                )}
              </div>
              <a
                href="/reports/business-presence"
                className="flex-shrink-0 px-5 py-2.5 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all text-sm"
              >
                {bpr ? 'View Report' : hasFreeSlot ? 'Get My Free Report' : 'Run Report'}
              </a>
            </div>
          )
        })()}

        {/* Report history */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Report history</h2>
          <ReportList initialReports={reports} />
        </div>

        {/* Upgrade banner — show when credits are low (≤2) for free/impulse users */}
        {!isAdmin && isLowCredits && (
          <div className="bg-gradient-to-r from-primary/10 to-accent-blue/10 border border-primary/30 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-white font-semibold text-lg">Get more reports</p>
              <p className="text-gray-400 text-sm mt-1">
                {packFrom && planFrom
                  ? `Credit packs from ${packFrom} or monthly plans from ${planFrom}/mo.`
                  : packFrom
                    ? `Credit packs from ${packFrom}.`
                    : planFrom
                      ? `Monthly plans from ${planFrom}/mo.`
                      : 'Get more credits.'}
                {' '}All report types, cancel anytime.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
              <a
                href="/pricing"
                className="inline-block px-5 py-2.5 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all text-sm"
              >
                Get More Reports
              </a>
            </div>
          </div>
        )}

        {/* Exhausted nudge — shown only when all free + paid credits consumed, never for admin/tester */}
        {isExhausted && !isAdmin && (
          <NudgeCard
            hasWrittenTestimonial={hasWrittenTestimonial}
            hasVideoTestimonial={hasVideoTestimonial}
          />
        )}

        {/* Subscriber exhausted — subscriber plan has 0 monthly credits remaining */}
        {isSubscriberExhausted && (
          <div className="bg-gradient-to-br from-primary/10 to-accent-blue/10 border border-primary/40 rounded-2xl p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold">You&apos;ve used all your {plan.charAt(0).toUpperCase() + plan.slice(1)} plan credits</p>
                <p className="text-gray-400 text-sm mt-0.5">
                  Upgrade your plan for more monthly reports, or pick up a credit pack.
                </p>
              </div>
            </div>
            <a
              href="/pricing"
              className="inline-block px-5 py-2.5 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all text-sm"
            >
              Upgrade plan
            </a>
          </div>
        )}

        {/* Testimonial CTA — show until user has submitted both types */}
        {(!hasWrittenTestimonial || !hasVideoTestimonial) && (
          <div className="bg-dark-700 border border-zinc-700 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-white font-semibold">Share your experience</p>
              <p className="text-gray-400 text-sm mt-1">
                {hasWrittenTestimonial
                  ? 'Got a minute for a quick video testimonial? It helps us a lot.'
                  : 'A quick written or video testimonial goes a long way. We really appreciate it.'}
              </p>
            </div>
            <a
              href="/testimonials/submit"
              className="flex-shrink-0 inline-block px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white font-medium rounded-xl transition-colors text-sm"
            >
              Submit a testimonial →
            </a>
          </div>
        )}

        {/* Support requests — hidden for admins (they use /admin/support) */}
        {!isAdmin && (
          <SupportSection
            tickets={tickets}
            userEmail={profile?.email || user.email!}
          />
        )}

      </div>
    </div>
  )
}
