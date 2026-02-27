import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service-client'
import { UserActionsPanel } from './UserActionsPanel'
import { AdminNotesPanel } from './AdminNotesPanel'

const CREDIT_PRODUCT_LABELS: Record<string, string> = {
  spark_pack: 'Spark Pack',
  boost_pack: 'Boost Pack',
  impulse: 'Impulse Pack',
  signup_credit: 'Signup bonus',
  testimonial_reward: 'Testimonial reward',
  referral_credit: 'Referral credit',
}

const REPORT_LABELS: Record<string, string> = {
  h2h: 'Head to Head', t3c: 'Top 3 Competitors', cp: 'Competitive Position',
  ai_seo: 'AI SEO', landing_page: 'Landing Page Optimizer',
  keyword_research: 'Keyword Research', seo_audit: 'SEO Audit',
  seo_comprehensive: 'SEO Comprehensive', multi_page: 'Multi-Page Audit',
}
const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  processing: 'bg-blue-900/40 text-blue-400 border-blue-800',
  complete: 'bg-green-900/40 text-green-400 border-green-800',
  failed: 'bg-red-900/40 text-red-400 border-red-800',
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient()

  // Fetch ban status from auth
  const { data: authUserData } = await supabase.auth.admin.getUserById(id)
  const bannedUntil = authUserData?.user?.banned_until ?? null
  const isSuspended = !!bannedUntil && new Date(bannedUntil) > new Date()

  // Fetch all user data in parallel
  const [profileRes, subRes, creditsRes, reportsRes, emailLogsRes, supportRes, notesRes, testimonialsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('credits').select('balance, expires_at, purchased_at, product').eq('user_id', id).order('purchased_at', { ascending: false }),
    supabase.from('reports').select('id, report_type, status, created_at, pdf_url, input_data').eq('user_id', id).order('created_at', { ascending: false }).limit(25),
    supabase.from('email_logs').select('id, type, subject, status, created_at, error').eq('user_id', id).order('created_at', { ascending: false }).limit(20),
    supabase.from('support_requests').select('id, message, status, created_at').eq('user_id', id).order('created_at', { ascending: false }).limit(10),
    supabase.from('admin_notes').select('id, note, created_at, created_by').eq('user_id', id).order('created_at', { ascending: false }),
    supabase.from('testimonials').select('id, type, status, pull_quote, content, video_url, credits_granted, admin_note, created_at').eq('user_id', id).order('created_at', { ascending: false }),
  ])

  const profile = profileRes.data
  if (!profile) notFound()

  const sub = subRes.data
  const credits = creditsRes.data ?? []
  const reports = reportsRes.data ?? []
  const emailLogs = emailLogsRes.data ?? []
  const supportRequests = supportRes.data ?? []
  const rawNotes = notesRes.data ?? []
  const testimonials = testimonialsRes.data ?? []

  // Fetch note author names
  const authorIds = [...new Set(rawNotes.map((n: any) => n.created_by))]
  const { data: authors } = authorIds.length
    ? await supabase.from('profiles').select('id, name').in('id', authorIds)
    : { data: [] }
  const authorMap = Object.fromEntries((authors ?? []).map((a: any) => [a.id, a.name]))
  const notes = rawNotes.map((n: any) => ({ ...n, author_name: authorMap[n.created_by] ?? null }))

  const totalCredits = credits.reduce((sum, c) => sum + (c.balance ?? 0), 0)
  const plan = sub?.plan ?? 'free'

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <a href="/admin/users" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">← Users</a>
          <h1 className="text-2xl font-bold text-white mt-1">{profile.name ?? profile.email}</h1>
          <p className="text-gray-400 text-sm">{profile.email}</p>
          {profile.phone && <p className="text-gray-500 text-xs mt-0.5">📞 {profile.phone}</p>}
        </div>
        <div className="flex gap-2">
          <RoleBadge role={profile.role} />
          <PlanBadge plan={plan} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: profile info + actions + notes */}
        <div className="space-y-6">
          {/* Profile info */}
          <div className="bg-dark-700 border border-primary/20 rounded-2xl p-6 space-y-3">
            <h2 className="text-lg font-semibold text-white">Profile</h2>
            <Row label="ID" value={profile.id} mono />
            <Row label="Joined" value={new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
            <Row label="Plan" value={plan} />
            <Row label="Sub status" value={sub?.status ?? '—'} />
            {sub?.current_period_end && (
              <Row label="Renews" value={new Date(sub.current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
            )}
            {sub ? (
              <>
                <Row label="Plan credits" value={String(sub.credits_remaining ?? 0)} />
                <Row label="Pack credits" value={String(totalCredits)} />
                <Row label="Total credits" value={String((sub.credits_remaining ?? 0) + totalCredits)} />
              </>
            ) : (
              <Row label="Credits" value={String(totalCredits)} />
            )}
            <Row label="Marketing opt-in" value={profile.marketing_opt_in ? 'Yes' : 'No'} />
            {profile.plan_override_type && (
              <Row
                label="Override"
                value={`${profile.plan_override_type}${profile.plan_override_until ? ` until ${new Date(profile.plan_override_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}`}
              />
            )}
            {profile.free_reports_used && Object.keys(profile.free_reports_used).length > 0 && (
              <div>
                <p className="text-gray-500 text-xs mb-1">Free reports used</p>
                <pre className="text-xs text-gray-300 bg-dark rounded px-2 py-1">{JSON.stringify(profile.free_reports_used, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* Credit rows */}
          {credits.length > 0 && (
            <div className="bg-dark-700 border border-primary/20 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-primary/10">
                <h2 className="text-sm font-semibold text-white">Credit Rows ({credits.length})</h2>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-primary/10">
                    <th className="text-left px-4 py-2 text-gray-400 font-medium">Source</th>
                    <th className="text-left px-4 py-2 text-gray-400 font-medium">Bal</th>
                    <th className="text-left px-4 py-2 text-gray-400 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {credits.map((c: any, i: number) => (
                    <tr key={i} className="border-b border-primary/10 last:border-0">
                      <td className="px-4 py-2 text-gray-300">
                        {CREDIT_PRODUCT_LABELS[c.product ?? ''] ?? 'Credit grant'}
                      </td>
                      <td className={`px-4 py-2 font-medium ${c.balance > 0 ? 'text-white' : 'text-gray-600'}`}>
                        {c.balance}
                      </td>
                      <td className="px-4 py-2 text-gray-500">
                        {new Date(c.purchased_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Actions */}
          <UserActionsPanel
            userId={profile.id}
            currentRole={profile.role}
            currentOverrideType={profile.plan_override_type ?? null}
            currentOverrideUntil={profile.plan_override_until ?? null}
            stripeCustomerId={profile.stripe_customer_id ?? null}
            currentEmail={profile.email ?? ''}
            currentPhone={profile.phone ?? ''}
            isSuspended={isSuspended}
          />

          {/* Notes */}
          <AdminNotesPanel userId={profile.id} notes={notes} />
        </div>

        {/* Right: reports + email log + support */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reports */}
          <Section title={`Reports (${reports.length})`}>
            {reports.length === 0 ? (
              <p className="text-gray-500 text-sm px-4 py-3">No reports yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-primary/10">
                    <th className="text-left px-4 py-2 text-gray-400 font-medium">Type</th>
                    <th className="text-left px-4 py-2 text-gray-400 font-medium">Status</th>
                    <th className="text-left px-4 py-2 text-gray-400 font-medium">Date</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r: any) => (
                    <tr key={r.id} className="border-b border-primary/10 last:border-0">
                      <td className="px-4 py-2 text-white">{REPORT_LABELS[r.report_type] ?? r.report_type}</td>
                      <td className="px-4 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${STATUS_STYLES[r.status] ?? STATUS_STYLES.pending}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-500 text-xs">
                        {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {r.pdf_url && (
                          <a href={r.pdf_url} target="_blank" rel="noopener noreferrer"
                            className="text-primary text-xs hover:underline">PDF →</a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>

          {/* Email log */}
          <Section title={`Email Log (${emailLogs.length})`}>
            {emailLogs.length === 0 ? (
              <p className="text-gray-500 text-sm px-4 py-3">No emails logged.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-primary/10">
                    <th className="text-left px-4 py-2 text-gray-400 font-medium">Type</th>
                    <th className="text-left px-4 py-2 text-gray-400 font-medium">Subject</th>
                    <th className="text-left px-4 py-2 text-gray-400 font-medium">Status</th>
                    <th className="text-left px-4 py-2 text-gray-400 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {emailLogs.map((e: any) => (
                    <tr key={e.id} className="border-b border-primary/10 last:border-0">
                      <td className="px-4 py-2 text-gray-300 text-xs capitalize">{e.type?.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-2 text-white text-xs truncate max-w-48">{e.subject}</td>
                      <td className="px-4 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full border capitalize
                          ${e.status === 'sent' ? 'bg-green-900/40 text-green-400 border-green-800'
                            : e.status === 'failed' ? 'bg-red-900/40 text-red-400 border-red-800'
                            : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-500 text-xs">
                        {new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>

          {/* Support history */}
          <Section title={`Support Requests (${supportRequests.length})`}>
            {supportRequests.length === 0 ? (
              <p className="text-gray-500 text-sm px-4 py-3">No support requests.</p>
            ) : (
              <div className="divide-y divide-primary/10">
                {supportRequests.map((s: any) => (
                  <div key={s.id} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full border capitalize
                        ${s.status === 'open' ? 'bg-yellow-900/40 text-yellow-400 border-yellow-800'
                          : s.status === 'resolved' ? 'bg-green-900/40 text-green-400 border-green-800'
                          : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                        {s.status}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-white text-sm">{s.message}</p>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Testimonials */}
          <Section title={`Testimonials (${testimonials.length})`}>
            {testimonials.length === 0 ? (
              <p className="text-gray-500 text-sm px-4 py-3">No testimonials submitted.</p>
            ) : (
              <div className="divide-y divide-primary/10">
                {testimonials.map((t: any) => (
                  <div key={t.id} className="px-4 py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full border capitalize bg-dark-700 text-gray-300 border-gray-700">
                          {t.type}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border capitalize
                          ${t.status === 'approved' ? 'bg-green-900/40 text-green-400 border-green-800'
                            : t.status === 'rejected' ? 'bg-red-900/40 text-red-400 border-red-800'
                            : 'bg-yellow-900/40 text-yellow-400 border-yellow-800'}`}>
                          {t.status}
                        </span>
                        {t.credits_granted > 0 && (
                          <span className="text-xs text-primary">+{t.credits_granted} credits</span>
                        )}
                      </div>
                      <span className="text-gray-500 text-xs">
                        {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-white text-sm font-medium">&ldquo;{t.pull_quote}&rdquo;</p>
                    {t.content && (
                      <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">{t.content}</p>
                    )}
                    {t.video_url && (
                      <a href={t.video_url} target="_blank" rel="noopener noreferrer"
                        className="text-primary text-xs hover:underline">
                        View video →
                      </a>
                    )}
                    {t.admin_note && (
                      <p className="text-gray-500 text-xs italic">Note: {t.admin_note}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-500 text-xs shrink-0">{label}</span>
      <span className={`text-xs text-gray-300 text-right truncate ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-dark-700 border border-primary/20 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-primary/10">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: 'bg-purple-900/40 text-purple-400 border-purple-800',
    tester: 'bg-blue-900/40 text-blue-400 border-blue-800',
    affiliate: 'bg-yellow-900/40 text-yellow-400 border-yellow-800',
    user: 'bg-gray-800 text-gray-400 border-gray-700',
  }
  return <span className={`text-xs font-medium px-2 py-1 rounded-full border capitalize ${styles[role] ?? styles.user}`}>{role}</span>
}

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    starter: 'bg-green-900/40 text-green-400 border-green-800',
    impulse: 'bg-yellow-900/40 text-yellow-400 border-yellow-800',
    custom: 'bg-purple-900/40 text-purple-400 border-purple-800',
    free: 'bg-gray-800 text-gray-400 border-gray-700',
  }
  return <span className={`text-xs font-medium px-2 py-1 rounded-full border capitalize ${styles[plan] ?? styles.free}`}>{plan}</span>
}
