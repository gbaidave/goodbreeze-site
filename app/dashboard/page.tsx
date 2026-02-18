import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UpgradeButton } from './UpgradeButton'

const REPORT_TYPE_LABELS: Record<string, string> = {
  h2h:               'Head to Head Analysis',
  t3c:               'Top 3 Competitors',
  cp:                'Competitive Position',
  ai_seo:            'AI SEO Optimizer',
  landing_page:      'Landing Page Optimizer',
  keyword_research:  'Keyword Research',
  seo_audit:         'SEO Audit',
  seo_comprehensive: 'SEO Comprehensive',
  multi_page:        'Multi-Page Audit',
}

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  processing: 'bg-blue-900/40 text-blue-400 border-blue-800',
  complete:   'bg-green-900/40 text-green-400 border-green-800',
  failed:     'bg-red-900/40 text-red-400 border-red-800',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch profile, subscription, credits, reports in parallel
  const [profileRes, subRes, creditsRes, reportsRes] = await Promise.all([
    supabase.from('profiles').select('name, email').eq('id', user.id).single(),
    supabase.from('subscriptions').select('plan, status, current_period_end')
      .eq('user_id', user.id).in('status', ['active', 'trialing']).order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('credits').select('balance, expires_at').eq('user_id', user.id).gt('balance', 0).order('purchased_at', { ascending: true }),
    supabase.from('reports').select('id, report_type, status, created_at, pdf_url').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(20),
  ])

  const profile = profileRes.data
  const sub = subRes.data
  const credits = creditsRes.data ?? []
  const reports = reportsRes.data ?? []

  const plan = sub?.plan ?? 'free'
  const totalCredits = credits.reduce((sum, c) => sum + (c.balance ?? 0), 0)
  const firstName = profile?.name?.split(' ')[0] || profile?.email?.split('@')[0] || 'there'

  const starterPriceId = process.env.STRIPE_STARTER_PRICE_ID!
  const impulsePriceId = process.env.STRIPE_IMPULSE_PRICE_ID!

  return (
    <div className="min-h-screen bg-dark py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Hey, {firstName} 👋</h1>
            <p className="text-gray-400 mt-1">Here's your Good Breeze AI dashboard.</p>
          </div>
          <a
            href="/tools"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Run a new report
          </a>
        </div>

        {/* Plan + Credits */}
        <div className="grid sm:grid-cols-3 gap-4">

          {/* Plan */}
          <div className="bg-dark-700 border border-primary/20 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Current plan</p>
            <p className="text-2xl font-bold text-white capitalize">{plan}</p>
            {sub?.current_period_end && (
              <p className="text-gray-500 text-xs mt-1">
                Renews {new Date(sub.current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>

          {/* Credits */}
          <div className="bg-dark-700 border border-primary/20 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Report credits</p>
            <p className="text-2xl font-bold text-white">{plan === 'starter' ? '∞' : totalCredits}</p>
            <p className="text-gray-500 text-xs mt-1">
              {plan === 'starter' ? 'Unlimited on Starter plan' : totalCredits === 0 ? 'No credits remaining' : `${totalCredits} report${totalCredits !== 1 ? 's' : ''} available`}
            </p>
          </div>

          {/* Reports run */}
          <div className="bg-dark-700 border border-primary/20 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Reports generated</p>
            <p className="text-2xl font-bold text-white">{reports.length}</p>
            <p className="text-gray-500 text-xs mt-1">All time</p>
          </div>
        </div>

        {/* Upgrade banner — only show if not on starter */}
        {plan !== 'starter' && plan !== 'custom' && (
          <div className="bg-gradient-to-r from-primary/10 to-accent-blue/10 border border-primary/30 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-white font-semibold text-lg">Unlock unlimited reports</p>
              <p className="text-gray-400 text-sm mt-1">Starter plan — $20/month. All report types, no limits.</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              {totalCredits === 0 && (
                <UpgradeButton
                  priceId={impulsePriceId}
                  label="Get 3 reports — $10"
                  className="px-5 py-2.5 border border-primary text-primary font-semibold rounded-xl hover:bg-primary/10 transition-colors text-sm"
                />
              )}
              <UpgradeButton
                priceId={starterPriceId}
                label="Upgrade to Starter"
                className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all text-sm"
              />
            </div>
          </div>
        )}

        {/* Report history */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Report history</h2>

          {reports.length === 0 ? (
            <div className="bg-dark-700 border border-primary/20 rounded-2xl p-12 text-center">
              <p className="text-gray-400 mb-4">No reports yet. Run your first one free.</p>
              <a
                href="/tools"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition-all"
              >
                Get started
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-dark-700 border border-primary/20 rounded-xl px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-white font-medium">
                        {REPORT_TYPE_LABELS[report.report_type] ?? report.report_type}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {new Date(report.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full border capitalize ${STATUS_STYLES[report.status] ?? STATUS_STYLES.pending}`}>
                      {report.status}
                    </span>
                    {report.pdf_url && report.status === 'complete' && (
                      <a
                        href={report.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        Download PDF →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
