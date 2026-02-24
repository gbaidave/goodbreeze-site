import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service-client'
import ReportList from './ReportList'
import { ReferralSection } from './ReferralSection'
import { NudgeCard } from './NudgeCard'

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

  // Fetch profile, subscription, credits, reports, referral data, and testimonials in parallel
  const [profileRes, subRes, creditsRes, reportsRes, referralRes, testimonialsRes] = await Promise.all([
    supabase.from('profiles').select('name, email, role, free_reports_used, plan_override_type, plan_override_until').eq('id', user.id).single(),
    supabase.from('subscriptions').select('plan, status, current_period_end')
      .eq('user_id', user.id).in('status', ['active', 'trialing']).order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('credits').select('balance, expires_at').eq('user_id', user.id).gt('balance', 0).order('purchased_at', { ascending: true }),
    supabase.from('reports').select('id, report_type, status, created_at, pdf_url, expires_at').eq('user_id', user.id)
      .not('status', 'in', '("failed","failed_site_blocked")')
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false }).limit(20),
    supabase.from('referral_codes').select('code, referral_uses(reward_granted)').eq('user_id', user.id).single(),
    supabase.from('testimonials').select('type').eq('user_id', user.id),
  ])

  const profile = profileRes.data
  const sub = subRes.data
  const credits = creditsRes.data ?? []
  const reports = reportsRes.data ?? []
  let referralCode = referralRes.data?.code ?? null
  if (!referralCode) {
    // Auto-generate a referral code for users who don't have one yet
    const code = 'gb' + Math.random().toString(36).slice(2, 8).toUpperCase()
    const serviceClient = createServiceClient()
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

  // Plan: check for active override
  const overrideActive =
    profile?.plan_override_type &&
    (!profile.plan_override_until || new Date(profile.plan_override_until) > new Date())
  const rawPlan = sub?.plan ?? 'free'
  const plan = overrideActive ? (profile!.plan_override_type as string) : rawPlan

  const totalCredits = credits.reduce((sum, c) => sum + (c.balance ?? 0), 0)
  const firstName = profile?.name?.split(' ')[0] || profile?.email?.split('@')[0] || 'there'
  const isAdmin = profile?.role === 'admin' || profile?.role === 'tester'
  const isTester = profile?.role === 'tester'

  // Free reports remaining (free plan only — 1 per system)
  const freeUsed = (profile?.free_reports_used ?? {}) as Record<string, string>
  const freeRemaining = (freeUsed.analyzer ? 0 : 1) + (freeUsed.brand_visibility ? 0 : 1)
  const PAID_PLANS = ['starter', 'growth', 'pro', 'custom']
  const isExhausted = !PAID_PLANS.includes(plan) && totalCredits === 0 && freeRemaining === 0

  const starterPriceId = process.env.STRIPE_STARTER_PLAN_PRICE_ID!
  const boostPackPriceId = process.env.STRIPE_BOOST_PACK_PRICE_ID!

  return (
    <div className="min-h-screen bg-dark py-12 px-6">
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
              <p className="text-white font-semibold">Account created — you&apos;re in.</p>
              <p className="text-gray-400 text-sm mt-0.5">
                You have {freeRemaining} free report{freeRemaining !== 1 ? 's' : ''} ready to use. Head to{' '}
                <a href="/tools" className="text-primary hover:text-primary/80 transition-colors font-medium">Tools</a>{' '}
                to run your first one.
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
              Get help
            </a>
            {profile?.role === 'admin' && (
              <a
                href="/admin"
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Admin Panel →
              </a>
            )}
            <a
              href="/tools"
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
          <div className="bg-dark-700 border border-primary/20 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Current plan</p>
            <p className="text-2xl font-bold text-white capitalize">
              {isTester ? 'Tester Account' : isAdmin ? 'Admin Account' : plan}
            </p>
            {!isAdmin && sub?.current_period_end && (
              <p className="text-gray-500 text-xs mt-1">
                Renews {new Date(sub.current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            )}
            {isAdmin && (
              <p className="text-gray-500 text-xs mt-1">Full access — no billing required</p>
            )}
          </div>

          {/* Credits */}
          <div className="bg-dark-700 border border-primary/20 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Report credits</p>
            <p className="text-2xl font-bold text-white">
              {isAdmin ? '∞' : PAID_PLANS.includes(plan) ? plan.charAt(0).toUpperCase() + plan.slice(1) : totalCredits > 0 ? totalCredits : freeRemaining > 0 ? `${freeRemaining} free` : '0'}
            </p>
            <p className="text-gray-500 text-xs mt-1">
              {isAdmin
                ? 'Full access — no billing required.'
                : PAID_PLANS.includes(plan)
                  ? 'Monthly plan — see pricing for report caps'
                  : totalCredits > 0
                    ? `${totalCredits} paid credit${totalCredits !== 1 ? 's' : ''} available`
                    : freeRemaining > 0
                      ? `${freeRemaining} free report${freeRemaining !== 1 ? 's' : ''} remaining`
                      : 'No credits remaining'}
            </p>
          </div>

          {/* Reports run */}
          <div className="bg-dark-700 border border-primary/20 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Reports generated</p>
            <p className="text-2xl font-bold text-white">{reports.length}</p>
            <p className="text-gray-500 text-xs mt-1">All time</p>
          </div>
        </div>

        {/* Upgrade banner — only show if not on a paid plan and not admin/tester */}
        {!isAdmin && !PAID_PLANS.includes(plan) && (
          <div className="bg-gradient-to-r from-primary/10 to-accent-blue/10 border border-primary/30 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-white font-semibold text-lg">Get more reports</p>
              <p className="text-gray-400 text-sm mt-1">Credit packs from $5 or monthly plans from $20/mo. All report types, cancel anytime.</p>
            </div>
            <div className="flex-shrink-0">
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
            starterPriceId={starterPriceId}
            boostPackPriceId={boostPackPriceId}
            hasWrittenTestimonial={hasWrittenTestimonial}
            hasVideoTestimonial={hasVideoTestimonial}
          />
        )}

        {/* Referral */}
        <div id="referral">
          {referralCode && (
            <ReferralSection
              code={referralCode}
              signups={referralSignups}
              creditsEarned={referralCredits}
            />
          )}
        </div>

        {/* Testimonial CTA — show until user has submitted both types */}
        {(!hasWrittenTestimonial || !hasVideoTestimonial) && (
          <div className="bg-dark-700 border border-zinc-700 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-white font-semibold">Share your experience</p>
              <p className="text-gray-400 text-sm mt-1">
                {hasWrittenTestimonial
                  ? 'Got a minute for a quick video testimonial? It helps us a lot.'
                  : 'A quick written or video testimonial goes a long way — and we really appreciate it.'}
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

        {/* Report history */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Report history</h2>
          <ReportList initialReports={reports} />
        </div>

        {/* Support footer */}
        <div className="pt-4 text-center">
          <p className="text-gray-600 text-sm">
            Having an issue?{' '}
            <a href="/support" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Get help
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}
