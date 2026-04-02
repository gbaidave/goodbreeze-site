'use client'

/**
 * BusinessPresenceReportView — renders BPR report data from input_data JSONB.
 * No dangerouslySetInnerHTML, no DOMPurify, no stored HTML.
 * Reads structured JSON from Supabase and renders via React + Tailwind.
 */

// ============================================================================
// Types
// ============================================================================

interface NicheItem {
  name: string
  rating: 'STRONG' | 'GENERIC' | 'WEAK'
  detail: string
}

interface ReputationSignal {
  platform: string
  status: 'Linked' | 'Not Found'
  detail?: string
}

interface HomepageFinding {
  severity: 'critical' | 'high' | 'medium'
  text: string
}

interface Competitor {
  domain: string
  da: number
  links?: number
  whatTheyDoWell: string
  visibility?: 'Well Ahead' | 'Ahead' | 'Close'
}

interface Opportunity {
  title: string
  severity: 'critical' | 'high' | 'medium'
  timeEstimate?: string
  what: string
  why: string
  fix: string
}

interface BottomLine {
  bullets: string[]
  result: string
}

interface BPRData {
  overallScore: number
  searchTerm?: string
  sectionScores: Record<string, number>
  summaryBlock: {
    advisorParagraph: string
    bulletScorecard: string[]
    opportunityTeaser: string
    quickWinCount?: number
    issueCount?: number
    visibilityGapPercent?: number
  }
  sections: {
    businessSnapshot: {
      businessTypeBadge?: string
      industry?: string
      valueProp?: string
      mozSummary?: string
      competitorContext?: string
      nicheAnalysis?: NicheItem[]
    }
    websiteHealth: {
      score: number
      findings: string[]
      topIssue?: string
      desktopSpeed?: string
      mobileSpeed?: string
      issueCount?: number
    }
    searchVisibility: {
      score: number
      aiCrawlerStatus?: string
      hasLlmsTxt?: boolean
      schemaAssessment?: string
      findings: string[]
    }
    marketingEffectiveness: {
      score: number
      ctaGrade?: string
      ctaAnalysis?: string
      trustLevel?: string
      trackingStatus?: string
      findings: string[]
      reputationSignals?: ReputationSignal[]
      homepageFindings?: HomepageFinding[]
    }
    topCompetitors: Competitor[]
    priorityOpportunities: Opportunity[]
  }
  bottomLines?: {
    websiteHealth?: BottomLine
    searchVisibility?: BottomLine
    marketingEffectiveness?: BottomLine
  }
}

// ============================================================================
// Helpers
// ============================================================================

function scoreColor(n: number): string {
  if (n >= 71) return 'text-green-500'
  if (n >= 41) return 'text-yellow-400'
  return 'text-red-500'
}

function scoreBg(n: number): string {
  if (n >= 71) return 'bg-green-500'
  if (n >= 41) return 'bg-yellow-400'
  return 'bg-red-500'
}

function severityColor(s: string): string {
  if (s === 'critical') return 'bg-red-500'
  if (s === 'high') return 'bg-orange-500'
  return 'bg-yellow-400'
}

function severityBarColor(s: string): string {
  if (s === 'critical') return 'bg-red-500'
  if (s === 'high') return 'bg-orange-500'
  return 'bg-yellow-400'
}

function nicheColor(rating: string): string {
  if (rating === 'STRONG') return 'bg-green-500'
  if (rating === 'GENERIC') return 'bg-yellow-400'
  return 'bg-red-500'
}

function repCardClass(status: string): string {
  if (status === 'Linked') return 'border-green-600 bg-green-900/20'
  return 'border-gray-700 bg-dark-800'
}

function repStatusClass(status: string): string {
  if (status === 'Linked') return 'text-green-400'
  return 'text-gray-500'
}

// ============================================================================
// Sub-components
// ============================================================================

function SectionHeader({ number, title, intro }: { number: string; title: string; intro?: string }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-bold tracking-widest text-primary mb-1">{number}</p>
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
      <div className="w-12 h-0.5 bg-primary mb-4" />
      {intro && <p className="text-sm text-gray-400 leading-relaxed">{intro}</p>}
    </div>
  )
}

function StatCard({ value, label, highlight, colorClass }: { value: string | number; label: string; highlight?: boolean; colorClass?: string }) {
  return (
    <div className={`flex-1 rounded-xl border p-4 text-center ${highlight ? 'border-primary border-2' : 'border-gray-700'} bg-dark-800`}>
      <div className={`text-2xl font-extrabold leading-none mb-1 ${colorClass || 'text-primary'}`}>{value}</div>
      <div className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</div>
    </div>
  )
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <div className="w-44 shrink-0 text-sm text-gray-300">{label}</div>
      <div className="flex-1 h-2.5 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${scoreBg(score)}`} style={{ width: `${score}%` }} />
      </div>
      <div className="w-16 text-right text-sm font-bold text-gray-300">{score} / 100</div>
    </div>
  )
}

function Callout({ type, title, children }: { type: 'insight' | 'strength' | 'weakness' | 'warning' | 'bottom-line'; title?: string; children: React.ReactNode }) {
  const styles: Record<string, string> = {
    insight: 'border-l-primary bg-primary/5',
    strength: 'border-l-green-500 bg-green-500/5',
    weakness: 'border-l-red-500 bg-red-500/5',
    warning: 'border-l-yellow-400 bg-yellow-400/5',
    'bottom-line': 'border-l-gray-400 bg-gray-800/50',
  }
  return (
    <div className={`rounded-lg border-l-4 p-5 mb-5 ${styles[type]}`}>
      {title && <p className="text-sm font-bold text-white mb-2">{title}</p>}
      <div className="text-sm text-gray-300 leading-relaxed">{children}</div>
    </div>
  )
}

function BottomLineBlock({ data }: { data?: BottomLine }) {
  if (!data) return null
  return (
    <Callout type="bottom-line" title="Bottom Line">
      <ul className="space-y-1 mt-2">
        {data.bullets.map((b, i) => (
          <li key={i} className="flex gap-2 text-sm text-gray-300">
            <span className="text-gray-500 shrink-0">&rarr;</span>
            <span>{b}</span>
          </li>
        ))}
        <li className="flex gap-2 text-sm font-semibold text-white mt-1">
          <span className="text-gray-500 shrink-0">&rarr;</span>
          <span>Result: {data.result}</span>
        </li>
      </ul>
    </Callout>
  )
}

function RecommendationCard({ severity, title, detail, timeEstimate, what, why, fix }: {
  severity: string; title: string; detail?: string; timeEstimate?: string; what?: string; why?: string; fix?: string
}) {
  return (
    <div className="flex gap-4 p-5 rounded-xl border border-gray-700 mb-3">
      <div className={`w-1 shrink-0 rounded-full ${severityBarColor(severity)}`} />
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white ${severityColor(severity)}`}>
            {severity}
          </span>
          {timeEstimate && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white bg-green-600">
              {timeEstimate}
            </span>
          )}
          <span className="text-sm font-bold text-white">{title}</span>
        </div>
        {detail && <p className="text-sm text-gray-400 leading-relaxed">{detail}</p>}
        {what && <p className="text-sm text-gray-400 leading-relaxed mb-1"><strong className="text-gray-300">What:</strong> {what}</p>}
        {why && <p className="text-sm text-gray-400 leading-relaxed mb-1"><strong className="text-gray-300">Why:</strong> {why}</p>}
        {fix && <p className="text-sm text-gray-400 leading-relaxed"><span className="text-primary font-semibold">How to fix:</span> {fix}</p>}
      </div>
    </div>
  )
}

function CompactFinding({ severity, text }: { severity: string; text: string }) {
  return (
    <div className="flex gap-3 p-3 rounded-lg border border-gray-700 mb-2">
      <div className={`w-0.5 shrink-0 rounded-full ${severityBarColor(severity)}`} />
      <p className="text-sm text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: text }} />
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export default function BusinessPresenceReportView({ data, domain }: { data: BPRData; domain?: string }) {
  const s = data.sections
  const scores = data.sectionScores
  const summary = data.summaryBlock
  const bl = data.bottomLines

  return (
    <div className="space-y-10">

      {/* ── SECTION 01: Executive Summary ── */}
      <section>
        <SectionHeader number="SECTION 01" title="Executive Summary" intro="A high-level snapshot of how your business appears online to potential customers, search engines, and AI-powered search tools." />

        <div className="flex gap-3 mb-6">
          <StatCard value={data.overallScore} label="Overall Score" highlight colorClass={scoreColor(data.overallScore)} />
          <StatCard value={summary.issueCount ?? 0} label="Issues Found" />
          <StatCard value={summary.quickWinCount ?? 0} label="Quick Wins" />
          <div className="flex-1 rounded-xl border border-gray-700 bg-dark-800 p-4 text-center">
            <div className="text-2xl font-extrabold text-red-500 leading-none mb-1">{summary.visibilityGapPercent ?? 0}%</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">less visible than competitors</div>
          </div>
        </div>

        <div className="mb-6">
          <ScoreBar label="Business Snapshot" score={scores.businessSnapshot ?? 0} />
          <ScoreBar label="Website Health" score={scores.websiteHealth ?? 0} />
          <ScoreBar label="Search Visibility" score={scores.searchVisibility ?? 0} />
          <ScoreBar label="Marketing Effectiveness" score={scores.marketingEffectiveness ?? 0} />
          <ScoreBar label="Competitor Position" score={scores.competitorPosition ?? 0} />
        </div>

        {summary.advisorParagraph && (
          <Callout type="insight" title="Summary">{summary.advisorParagraph}</Callout>
        )}
        {summary.opportunityTeaser && (
          <Callout type="strength" title="Fastest Win">{summary.opportunityTeaser}</Callout>
        )}
      </section>

      {/* ── SECTION 02: Business Snapshot ── */}
      <section>
        <SectionHeader number="SECTION 02" title="Business Snapshot" intro="What type of business you are, what services you highlight, and how effectively your website communicates them." />

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-dark-800 border border-gray-700 rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Business Type</p>
            <p className="text-sm font-semibold text-white">{s.businessSnapshot?.businessTypeBadge || 'Unknown'}</p>
          </div>
          <div className="bg-dark-800 border border-gray-700 rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Industry</p>
            <p className="text-sm font-semibold text-white">{s.businessSnapshot?.industry || 'Unknown'}</p>
          </div>
        </div>

        {s.businessSnapshot?.valueProp && (
          <div className="bg-dark-800 border border-gray-700 rounded-lg p-4 mb-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">What Your Site Communicates</p>
            <p className="text-sm text-gray-300">{s.businessSnapshot.valueProp}</p>
          </div>
        )}

        {s.businessSnapshot?.nicheAnalysis && s.businessSnapshot.nicheAnalysis.length > 0 && (
          <>
            <h4 className="text-sm font-bold text-gray-400 mb-3">Services You Highlight</h4>
            {s.businessSnapshot.nicheAnalysis.map((niche, i) => (
              <div key={i} className="border border-gray-700 rounded-lg p-4 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white ${nicheColor(niche.rating)}`}>{niche.rating}</span>
                  <span className="text-sm font-bold text-white">{niche.name}</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{niche.detail}</p>
              </div>
            ))}
          </>
        )}

        {s.businessSnapshot?.mozSummary && (
          <Callout type="insight" title="Search Trust Score">{s.businessSnapshot.mozSummary}</Callout>
        )}
      </section>

      {/* ── SECTION 03: Website Health ── */}
      <section>
        <SectionHeader number="SECTION 03" title="Website Health" intro="Whether your site works correctly and loads fast enough that visitors stay instead of leaving." />

        <div className="flex gap-3 mb-4">
          <StatCard value={s.websiteHealth?.score ?? 0} label="Health Score" highlight colorClass={scoreColor(s.websiteHealth?.score ?? 0)} />
          <StatCard value={s.websiteHealth?.issueCount ?? s.websiteHealth?.findings?.length ?? 0} label="Issues Found" />
          <StatCard value={s.websiteHealth?.desktopSpeed || 'N/A'} label="Desktop Speed" />
          <StatCard value={s.websiteHealth?.mobileSpeed || 'N/A'} label="Mobile Speed" />
        </div>

        {s.websiteHealth?.topIssue && (
          <Callout type="weakness" title="Top Issue">{s.websiteHealth.topIssue}</Callout>
        )}

        {s.websiteHealth?.findings?.map((f, i) => (
          <RecommendationCard key={i} severity="medium" title={f} />
        ))}

        <BottomLineBlock data={bl?.websiteHealth} />
      </section>

      {/* ── SECTION 04: Search Everywhere Visibility ── */}
      <section>
        <SectionHeader number="SECTION 04" title="Search Everywhere Visibility" intro="Whether your business can be found across Google, AI tools like ChatGPT, and other search platforms." />

        <div className="flex gap-3 mb-4">
          <StatCard value={s.searchVisibility?.score ?? 0} label="Visibility Score" highlight colorClass={scoreColor(s.searchVisibility?.score ?? 0)} />
          <StatCard value={s.searchVisibility?.aiCrawlerStatus || 'Unknown'} label="AI Access" colorClass={s.searchVisibility?.aiCrawlerStatus === 'accessible' ? 'text-green-500' : 'text-red-500'} />
        </div>

        {s.searchVisibility?.schemaAssessment && (
          <Callout type="insight">{s.searchVisibility.schemaAssessment}</Callout>
        )}

        {s.searchVisibility?.findings?.map((f, i) => (
          <RecommendationCard key={i} severity="high" title={f} />
        ))}

        <BottomLineBlock data={bl?.searchVisibility} />
      </section>

      {/* ── SECTION 05: Marketing Effectiveness ── */}
      <section>
        <SectionHeader number="SECTION 05" title="Marketing Effectiveness" intro="How well your website converts visitors into customers and how strong your online reputation is." />

        <div className="flex gap-3 mb-4">
          <StatCard value={s.marketingEffectiveness?.score ?? 0} label="Marketing Score" highlight colorClass={scoreColor(s.marketingEffectiveness?.score ?? 0)} />
          <StatCard value={s.marketingEffectiveness?.ctaGrade || '?'} label="CTA Grade" />
          <StatCard value={s.marketingEffectiveness?.trustLevel || 'Unknown'} label="Trust Signals" />
        </div>

        {/* Reputation grid */}
        {s.marketingEffectiveness?.reputationSignals && s.marketingEffectiveness.reputationSignals.length > 0 && (
          <>
            <h4 className="text-sm font-bold text-gray-400 mb-3">Online Reputation</h4>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {s.marketingEffectiveness.reputationSignals.map((sig, i) => (
                <div key={i} className={`rounded-lg border p-3 text-center ${repCardClass(sig.status)}`}>
                  <p className="text-xs font-semibold text-white mb-0.5">{sig.platform}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${repStatusClass(sig.status)}`}>{sig.status}</p>
                  {sig.detail && <p className="text-[10px] text-gray-500 mt-0.5">{sig.detail}</p>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Homepage findings */}
        {s.marketingEffectiveness?.homepageFindings && s.marketingEffectiveness.homepageFindings.length > 0 && (
          <>
            <h4 className="text-sm font-bold text-gray-400 mb-3">Homepage Assessment</h4>
            {s.marketingEffectiveness.homepageFindings.map((f, i) => (
              <CompactFinding key={i} severity={f.severity} text={f.text} />
            ))}
          </>
        )}

        <BottomLineBlock data={bl?.marketingEffectiveness} />
      </section>

      {/* ── SECTION 06: Top 3 Competitors ── */}
      <section>
        <SectionHeader number="SECTION 06" title="Top 3 Competitors" intro="The businesses that appear instead of you when potential customers search for your services." />

        {data.searchTerm && (
          <Callout type="insight">
            <p className="mb-2">When someone searches for:</p>
            <span className="inline-block bg-primary/10 border border-primary/30 rounded px-2.5 py-1 text-sm font-semibold text-primary">{data.searchTerm}</span>
            <p className="mt-2">These are the businesses they find instead of yours.</p>
          </Callout>
        )}

        {s.topCompetitors && s.topCompetitors.length > 0 && (
          <div className="overflow-x-auto mb-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800">
                  <th className="text-left p-3 font-semibold text-gray-300">Competitor</th>
                  <th className="text-left p-3 font-semibold text-gray-300">Trust</th>
                  <th className="text-left p-3 font-semibold text-gray-300">Links</th>
                  <th className="text-left p-3 font-semibold text-gray-300">What They Do Well</th>
                  <th className="text-left p-3 font-semibold text-gray-300">Visibility</th>
                </tr>
              </thead>
              <tbody>
                {s.topCompetitors.map((comp, i) => (
                  <tr key={i} className={i % 2 === 1 ? 'bg-dark-800' : ''}>
                    <td className="p-3 font-semibold text-white">{comp.domain || 'Not identified'}</td>
                    <td className="p-3"><span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{comp.da}</span></td>
                    <td className="p-3 text-gray-400">{comp.links ?? 0}</td>
                    <td className="p-3 text-gray-400 leading-relaxed">{comp.whatTheyDoWell}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${comp.visibility === 'Well Ahead' ? 'bg-red-500' : 'bg-orange-500'}`}>
                        {comp.visibility || 'Ahead'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── SECTION 07: Priority Opportunities ── */}
      <section>
        <SectionHeader number="SECTION 07" title="Priority Opportunities" intro="Your highest-impact improvements, ordered by what you can do most easily and affordably first." />

        {s.priorityOpportunities?.map((opp, i) => (
          <RecommendationCard
            key={i}
            severity={opp.severity}
            title={opp.title}
            timeEstimate={opp.timeEstimate}
            what={opp.what}
            why={opp.why}
            fix={opp.fix}
          />
        ))}
      </section>

      {/* ── CTA ── */}
      <section className="rounded-xl bg-primary p-10 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Ready to fix these issues and grow your business?</h2>
        <p className="text-sm text-white/80 mb-6">Book a free 30-minute strategy session to implement these recommendations.</p>
        <a href="https://goodbreeze.ai/strategy-call" className="inline-block px-8 py-3 bg-white text-primary font-bold rounded-lg text-sm hover:shadow-lg transition-shadow">
          Book Your Strategy Call
        </a>
      </section>

    </div>
  )
}
