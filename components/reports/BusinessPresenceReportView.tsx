'use client'

import { useState } from 'react'

/**
 * BusinessPresenceReportView — renders BPR report data from input_data JSONB.
 * No dangerouslySetInnerHTML, no DOMPurify, no stored HTML.
 * Reads structured JSON from Supabase and renders via React + Tailwind.
 *
 * Supports BOTH V5 (old) and V6 (new) schema formats for backward compatibility.
 */

// ============================================================================
// Types — V5 (legacy)
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

interface CompetitorV5 {
  domain: string
  da: number
  links?: number
  whatTheyDoWell: string
  visibility?: 'Well Ahead' | 'Ahead' | 'Close'
}

interface OpportunityV5 {
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

// ============================================================================
// Types — V6 (new)
// ============================================================================

interface BusinessFinding {
  finding: string
  impact: string
  impactEstimate?: string
  severity: 'high' | 'medium' | 'low'
}

interface TechnicalChecklistItem {
  task: string
  difficulty: 'easy' | 'medium' | 'hard'
  timeEstimate: string
}

interface TopService {
  name: string
  rating: 'STRONG' | 'GENERIC' | 'WEAK'
  detail: string
}

interface BusinessOwnerAction {
  title: string
  impact: string
  impactEstimate?: string
  howToFix: string
  timeEstimate?: string
  cost?: string
}

interface WebDeveloperChecklistItem {
  task: string
  impact: string
  difficulty: 'easy' | 'medium' | 'hard'
  timeEstimate: string
}

// ============================================================================
// Combined BPR Data type (V5 + V6)
// ============================================================================

/* eslint-disable @typescript-eslint/no-explicit-any */
interface BPRData {
  overallScore: number
  searchTerm?: string
  sectionScores: Record<string, number>
  summaryBlock: {
    // V5
    advisorParagraph?: string
    bulletScorecard?: string[]
    opportunityTeaser?: string
    // V6
    summaryParagraph?: string
    keyMetrics?: string[]
    fastestWin?: string
    // shared
    quickWinCount?: number
    issueCount?: number
    visibilityGapPercent?: number
  }
  sections: {
    // V5 names
    businessSnapshot?: any
    websiteHealth?: any
    marketingEffectiveness?: any
    // V6 names
    businessIdentity?: any
    websiteExperience?: any
    websiteConversion?: any
    // shared names
    searchVisibility?: any
    topCompetitors?: any[]
    priorityOpportunities?: any
  }
  bottomLines?: {
    // V5
    websiteHealth?: BottomLine
    searchVisibility?: BottomLine
    marketingEffectiveness?: BottomLine
    // V6
    websiteExperience?: BottomLine
    websiteConversion?: BottomLine
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

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
  if (s === 'low') return 'bg-blue-400'
  return 'bg-yellow-400'
}

function severityBarColor(s: string): string {
  if (s === 'critical') return 'bg-red-500'
  if (s === 'high') return 'bg-orange-500'
  if (s === 'low') return 'bg-blue-400'
  return 'bg-yellow-400'
}

function nicheColor(rating: string): string {
  if (rating === 'STRONG') return 'bg-green-500'
  if (rating === 'GENERIC') return 'bg-yellow-400'
  return 'bg-red-500'
}

function difficultyColor(d: string): string {
  if (d === 'easy') return 'text-green-400'
  if (d === 'hard') return 'text-red-400'
  return 'text-yellow-400'
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

function SectionHeader({ number, title, question, intro }: { number: string; title: string; question?: string; intro?: string }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-bold tracking-widest text-primary mb-1">{number}</p>
      <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
      {question && <p className="text-sm italic text-gray-400 mb-2">{question}</p>}
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

function Callout({ type, title, children }: { type: 'insight' | 'strength' | 'weakness' | 'warning' | 'bottom-line' | 'info'; title?: string; children: React.ReactNode }) {
  const styles: Record<string, string> = {
    insight: 'border-l-primary bg-primary/5',
    strength: 'border-l-green-500 bg-green-500/5',
    weakness: 'border-l-red-500 bg-red-500/5',
    warning: 'border-l-yellow-400 bg-yellow-400/5',
    'bottom-line': 'border-l-gray-400 bg-gray-800/50',
    info: 'border-l-blue-400 bg-blue-400/5',
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

/** V6 business finding card */
function BusinessFindingCard({ finding }: { finding: BusinessFinding }) {
  return (
    <div className="flex gap-4 p-5 rounded-xl border border-gray-700 mb-3">
      <div className={`w-1 shrink-0 rounded-full ${severityBarColor(finding.severity)}`} />
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white ${severityColor(finding.severity)}`}>
            {finding.severity}
          </span>
          <span className="text-sm font-bold text-white">{finding.finding}</span>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed mb-1">{finding.impact}</p>
        {finding.impactEstimate && (
          <p className="text-xs text-gray-500 leading-relaxed italic">{finding.impactEstimate}</p>
        )}
      </div>
    </div>
  )
}

/** V6 technical checklist box */
function TechnicalChecklistBox({ items }: { items: TechnicalChecklistItem[] }) {
  if (!items || items.length === 0) return null
  return (
    <div className="bg-dark-800 border border-gray-700 rounded-xl p-5 mb-5">
      <h4 className="text-sm font-bold text-gray-400 mb-4">What to tell your web developer</h4>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="text-gray-500 shrink-0 mt-0.5 text-sm">{i + 1}.</span>
            <div className="flex-1">
              <p className="text-sm text-gray-300">{item.task}</p>
              <div className="flex gap-3 mt-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${difficultyColor(item.difficulty)}`}>
                  {item.difficulty}
                </span>
                <span className="text-[10px] text-gray-500">{item.timeEstimate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Copyable text block for webDeveloperNote */
function CopyableTextBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: do nothing
    }
  }

  return (
    <div className="relative bg-dark-800 border border-gray-700 rounded-xl p-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-gray-400">Copy and send this to your web developer</h4>
        <button
          onClick={handleCopy}
          className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors px-3 py-1 rounded border border-primary/30 hover:border-primary/50"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p className="text-sm text-gray-300 leading-relaxed font-mono whitespace-pre-wrap">{text}</p>
    </div>
  )
}

/** V5 recommendation card (kept for backward compat) */
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

/** V6 business owner action card */
function BusinessOwnerActionCard({ action }: { action: BusinessOwnerAction }) {
  return (
    <div className="flex gap-4 p-5 rounded-xl border border-gray-700 mb-3">
      <div className="w-1 shrink-0 rounded-full bg-primary" />
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {action.timeEstimate && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white bg-green-600">
              {action.timeEstimate}
            </span>
          )}
          {action.cost && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white bg-blue-600">
              {action.cost}
            </span>
          )}
          <span className="text-sm font-bold text-white">{action.title}</span>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed mb-1">{action.impact}</p>
        {action.impactEstimate && (
          <p className="text-xs text-gray-500 leading-relaxed italic mb-2">{action.impactEstimate}</p>
        )}
        <p className="text-sm text-gray-400 leading-relaxed">
          <span className="text-primary font-semibold">How to do it:</span> {action.howToFix}
        </p>
      </div>
    </div>
  )
}

/** V6 web developer checklist card */
function WebDevChecklistCard({ item }: { item: WebDeveloperChecklistItem }) {
  return (
    <div className="flex gap-4 p-4 rounded-xl border border-gray-700 mb-2">
      <div className={`w-1 shrink-0 rounded-full ${severityBarColor(item.difficulty === 'easy' ? 'medium' : item.difficulty === 'hard' ? 'critical' : 'high')}`} />
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${difficultyColor(item.difficulty)}`}>
            {item.difficulty}
          </span>
          <span className="text-[10px] text-gray-500">{item.timeEstimate}</span>
        </div>
        <p className="text-sm font-semibold text-white mb-1">{item.task}</p>
        <p className="text-sm text-gray-400 leading-relaxed">{item.impact}</p>
      </div>
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

  // Backward-compat: resolve V5 vs V6 section names
  const biz = s.businessIdentity || s.businessSnapshot || {}
  const web = s.websiteExperience || s.websiteHealth || {}
  const conv = s.websiteConversion || s.marketingEffectiveness || {}
  const search = s.searchVisibility || {}
  const competitors = s.topCompetitors || []
  const opps = s.priorityOpportunities

  // Detect V6 (object with businessOwnerActions) vs V5 (array)
  const isV6Opps = opps && !Array.isArray(opps) && opps.businessOwnerActions

  // Resolve summary fields (V6 names || V5 names)
  const summaryText = summary.summaryParagraph || summary.advisorParagraph
  const keyMetrics = summary.keyMetrics || summary.bulletScorecard || []
  const fastestWin = summary.fastestWin || summary.opportunityTeaser

  // Resolve section scores (V6 keys || V5 keys)
  const scoreIdentity = scores.businessIdentity ?? scores.businessSnapshot ?? 0
  const scoreWebsite = scores.websiteExperience ?? scores.websiteHealth ?? 0
  const scoreSearch = scores.searchVisibility ?? 0
  const scoreConversion = scores.websiteConversion ?? scores.marketingEffectiveness ?? 0
  const scoreCompetitor = scores.competitorPosition ?? 0

  // Resolve bottom lines (V6 keys || V5 keys)
  const blWebsite = bl?.websiteExperience || bl?.websiteHealth || web.bottomLine
  const blSearch = bl?.searchVisibility || search.bottomLine
  const blConversion = bl?.websiteConversion || bl?.marketingEffectiveness || conv.bottomLine

  // Resolve services (V6 topServices || V5 nicheAnalysis)
  const services: (TopService | NicheItem)[] = biz.topServices || biz.nicheAnalysis || []

  // Resolve business findings for each section
  const bizFindings: BusinessFinding[] = biz.businessFindings || []
  const webFindings: BusinessFinding[] = web.businessFindings || []
  const searchFindings: BusinessFinding[] = search.businessFindings || []
  const convFindings: BusinessFinding[] = conv.businessFindings || []

  // Resolve technical checklists
  const webChecklist: TechnicalChecklistItem[] = web.technicalChecklist || []
  const searchChecklist: TechnicalChecklistItem[] = search.technicalChecklist || []
  const convChecklist: TechnicalChecklistItem[] = conv.technicalChecklist || []

  // V5 fallback findings (string arrays)
  const webFindingsV5: string[] = web.findings || []
  const searchFindingsV5: string[] = search.findings || []
  const convHomepageFindingsV5: HomepageFinding[] = conv.homepageFindings || []

  return (
    <div className="space-y-10">

      {/* ── SECTION 01: Your Business Online ── */}
      <section>
        <SectionHeader
          number="SECTION 01"
          title="Your Business Online"
          question="How is my business doing online?"
          intro="A high-level snapshot of how your business appears online to potential customers, search engines, and AI-powered search tools."
        />

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
          <ScoreBar label="Business Identity" score={scoreIdentity} />
          <ScoreBar label="Website Experience" score={scoreWebsite} />
          <ScoreBar label="Search Visibility" score={scoreSearch} />
          <ScoreBar label="Website Conversion" score={scoreConversion} />
          <ScoreBar label="Competitor Position" score={scoreCompetitor} />
        </div>

        {summaryText && (
          <Callout type="insight" title="Summary">{summaryText}</Callout>
        )}

        {keyMetrics.length > 0 && (
          <div className="mb-5">
            <h4 className="text-sm font-bold text-gray-400 mb-3">Key Metrics</h4>
            <ul className="space-y-1">
              {keyMetrics.map((m, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-300">
                  <span className="text-primary shrink-0">&bull;</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {fastestWin && (
          <Callout type="strength" title="Fastest Win">{fastestWin}</Callout>
        )}
      </section>

      {/* ── SECTION 02: Your Business Identity ── */}
      <section>
        <SectionHeader
          number="SECTION 02"
          title="Your Business Identity"
          question="Do people know what I do and who I serve?"
          intro="What type of business you are, what services you highlight, and how effectively your website communicates them."
        />

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-dark-800 border border-gray-700 rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Business Type</p>
            <p className="text-sm font-semibold text-white">{biz.businessTypeBadge || 'Unknown'}</p>
          </div>
          <div className="bg-dark-800 border border-gray-700 rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Industry</p>
            <p className="text-sm font-semibold text-white">{biz.industry || 'Unknown'}</p>
          </div>
        </div>

        {biz.valueProp && (
          <div className="bg-dark-800 border border-gray-700 rounded-lg p-4 mb-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">What Your Site Communicates</p>
            <p className="text-sm text-gray-300">{biz.valueProp}</p>
          </div>
        )}

        {services.length > 0 && (
          <>
            <h4 className="text-sm font-bold text-gray-400 mb-3">Services You Highlight</h4>
            {services.map((svc, i) => (
              <div key={i} className="border border-gray-700 rounded-lg p-4 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white ${nicheColor(svc.rating)}`}>{svc.rating}</span>
                  <span className="text-sm font-bold text-white">{svc.name}</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{svc.detail}</p>
              </div>
            ))}
          </>
        )}

        {biz.reachAssessment && (
          <Callout type="insight" title="Are You Reaching the Right Customers?">{biz.reachAssessment}</Callout>
        )}

        {/* V5 fallback: mozSummary */}
        {biz.mozSummary && !biz.reachAssessment && (
          <Callout type="insight" title="Search Trust Score">{biz.mozSummary}</Callout>
        )}

        {bizFindings.length > 0 && (
          <>
            <h4 className="text-sm font-bold text-gray-400 mb-3">Key Findings</h4>
            {bizFindings.map((f, i) => (
              <BusinessFindingCard key={i} finding={f} />
            ))}
          </>
        )}
      </section>

      {/* ── SECTION 03: Your Website Experience ── */}
      <section>
        <SectionHeader
          number="SECTION 03"
          title="Your Website Experience"
          question="Is my website helping or hurting me?"
          intro="Whether your site works correctly and loads fast enough that visitors stay instead of leaving."
        />

        <div className="flex gap-3 mb-4">
          <StatCard value={web.score ?? 0} label="Experience Score" highlight colorClass={scoreColor(web.score ?? 0)} />
          {/* V6: mobileSpeedSeconds / mobilePerformanceScore; V5: desktopSpeed / mobileSpeed / issueCount */}
          {web.mobileSpeedSeconds != null ? (
            <>
              <StatCard value={`${web.mobileSpeedSeconds}s`} label="Mobile Load Time" />
              <StatCard value={web.mobilePerformanceScore ?? 'N/A'} label="Mobile Performance" colorClass={scoreColor(web.mobilePerformanceScore ?? 0)} />
            </>
          ) : (
            <>
              <StatCard value={web.issueCount ?? web.findings?.length ?? 0} label="Issues Found" />
              <StatCard value={web.desktopSpeed || 'N/A'} label="Desktop Speed" />
              <StatCard value={web.mobileSpeed || 'N/A'} label="Mobile Speed" />
            </>
          )}
        </div>

        {web.siteAge && (
          <div className="bg-dark-800 border border-gray-700 rounded-lg p-4 mb-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Estimated Last Redesign</p>
            <p className="text-sm font-semibold text-white">{web.siteAge}</p>
          </div>
        )}

        {/* V5 topIssue */}
        {web.topIssue && (
          <Callout type="weakness" title="Top Issue">{web.topIssue}</Callout>
        )}

        {/* V6 business findings */}
        {webFindings.length > 0 && (
          <>
            <h4 className="text-sm font-bold text-gray-400 mb-3">What Your Visitors Experience</h4>
            {webFindings.map((f, i) => (
              <BusinessFindingCard key={i} finding={f} />
            ))}
          </>
        )}

        {/* V5 string findings fallback */}
        {webFindings.length === 0 && webFindingsV5.length > 0 && webFindingsV5.map((f, i) => (
          <RecommendationCard key={i} severity="medium" title={f} />
        ))}

        <TechnicalChecklistBox items={webChecklist} />

        <BottomLineBlock data={blWebsite} />
      </section>

      {/* ── SECTION 04: Can People Find You? ── */}
      <section>
        <SectionHeader
          number="SECTION 04"
          title="Can People Find You?"
          question="When someone searches for what I offer, do they find me?"
          intro="Whether your business can be found across Google, AI tools like ChatGPT, and other search platforms."
        />

        <div className="flex gap-3 mb-4">
          <StatCard value={search.score ?? 0} label="Visibility Score" highlight colorClass={scoreColor(search.score ?? 0)} />
          <StatCard
            value={search.aiCrawlerStatus || 'Unknown'}
            label="AI Access"
            colorClass={search.aiCrawlerStatus === 'accessible' ? 'text-green-500' : 'text-red-500'}
          />
          {search.schemaTypesFound != null && (
            <StatCard value={search.schemaTypesFound} label="Schema Types Found" />
          )}
        </div>

        {/* Hardcoded "Where People Search Today" callout */}
        <Callout type="info" title="Where People Search Today">
          People no longer search in just one place. Google is still where most people start, but Google itself now shows AI-generated summaries before website links (BrightEdge research shows this happens in nearly half of all searches). YouTube is where people learn how to solve problems. ChatGPT and similar tools handle questions that used to go to Google. Social media — especially TikTok and Instagram — is where younger customers discover local businesses.
        </Callout>

        {/* V5 schemaAssessment */}
        {search.schemaAssessment && (
          <Callout type="insight">{search.schemaAssessment}</Callout>
        )}

        {/* V6 business findings */}
        {searchFindings.length > 0 && (
          <>
            <h4 className="text-sm font-bold text-gray-400 mb-3">How Visible Are You?</h4>
            {searchFindings.map((f, i) => (
              <BusinessFindingCard key={i} finding={f} />
            ))}
          </>
        )}

        {/* V5 string findings fallback */}
        {searchFindings.length === 0 && searchFindingsV5.length > 0 && searchFindingsV5.map((f, i) => (
          <RecommendationCard key={i} severity="high" title={f} />
        ))}

        <TechnicalChecklistBox items={searchChecklist} />

        <BottomLineBlock data={blSearch} />
      </section>

      {/* ── SECTION 05: Is Your Website Converting? ── */}
      <section>
        <SectionHeader
          number="SECTION 05"
          title="Is Your Website Converting?"
          question="When people visit my website, do they contact me?"
          intro="How well your website convinces visitors to take action and how strong your online reputation is."
        />

        <div className="flex gap-3 mb-4">
          <StatCard value={conv.score ?? 0} label="Conversion Score" highlight colorClass={scoreColor(conv.score ?? 0)} />
          <StatCard value={conv.ctaGrade || '?'} label="Call-to-Action Grade" />
          <StatCard value={conv.trustLevel || 'Unknown'} label="Trust Signals" />
        </div>

        {/* Ad tracking (V6) */}
        {conv.adTrackingDetected && conv.adTrackingDetected.length > 0 && (
          <div className="bg-dark-800 border border-gray-700 rounded-lg p-4 mb-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Ad Tracking Detected</p>
            <div className="flex flex-wrap gap-2">
              {conv.adTrackingDetected.map((tracker: string, i: number) => (
                <span key={i} className="text-xs font-semibold text-gray-300 bg-gray-700 px-2.5 py-1 rounded-full">
                  {tracker}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reputation grid */}
        {conv.reputationSignals && conv.reputationSignals.length > 0 && (
          <>
            <h4 className="text-sm font-bold text-gray-400 mb-3">Online Reputation</h4>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {conv.reputationSignals.map((sig: ReputationSignal, i: number) => (
                <div key={i} className={`rounded-lg border p-3 text-center ${repCardClass(sig.status)}`}>
                  <p className="text-xs font-semibold text-white mb-0.5">{sig.platform}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${repStatusClass(sig.status)}`}>{sig.status}</p>
                  {sig.detail && <p className="text-[10px] text-gray-500 mt-0.5">{sig.detail}</p>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* V6 business findings */}
        {convFindings.length > 0 && (
          <>
            <h4 className="text-sm font-bold text-gray-400 mb-3">Conversion Assessment</h4>
            {convFindings.map((f, i) => (
              <BusinessFindingCard key={i} finding={f} />
            ))}
          </>
        )}

        {/* V5 homepage findings fallback */}
        {convFindings.length === 0 && convHomepageFindingsV5.length > 0 && (
          <>
            <h4 className="text-sm font-bold text-gray-400 mb-3">Homepage Assessment</h4>
            {convHomepageFindingsV5.map((f, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg border border-gray-700 mb-2">
                <div className={`w-0.5 shrink-0 rounded-full ${severityBarColor(f.severity)}`} />
                <p className="text-sm text-gray-400 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </>
        )}

        {/* V5 string findings fallback */}
        {convFindings.length === 0 && convHomepageFindingsV5.length === 0 && conv.findings && conv.findings.length > 0 && (
          conv.findings.map((f: string, i: number) => (
            <RecommendationCard key={i} severity="medium" title={f} />
          ))
        )}

        <TechnicalChecklistBox items={convChecklist} />

        <BottomLineBlock data={blConversion} />
      </section>

      {/* ── SECTION 06: Your Competition ── */}
      <section>
        <SectionHeader
          number="SECTION 06"
          title="Your Competition"
          question="Who am I losing customers to?"
          intro="The businesses that appear instead of you when potential customers search for your services."
        />

        {data.searchTerm && (
          <Callout type="insight">
            <p className="mb-2">When someone searches for:</p>
            <span className="inline-block bg-primary/10 border border-primary/30 rounded px-2.5 py-1 text-sm font-semibold text-primary">{data.searchTerm}</span>
            <p className="mt-2">These are the businesses they find instead of yours.</p>
          </Callout>
        )}

        {competitors.length > 0 && (
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
                {competitors.map((comp: CompetitorV5, i: number) => (
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

      {/* ── SECTION 07: What To Do Next ── */}
      <section>
        <SectionHeader
          number="SECTION 07"
          title="What To Do Next"
          question="What should I focus on first?"
          intro="Your highest-impact improvements, split into things you can do yourself and things for your web developer."
        />

        {isV6Opps ? (
          <>
            {/* V6: Split view */}
            {opps.businessOwnerActions && opps.businessOwnerActions.length > 0 && (
              <>
                <h3 className="text-lg font-bold text-white mb-4">Things You Can Do</h3>
                {opps.businessOwnerActions.map((action: BusinessOwnerAction, i: number) => (
                  <BusinessOwnerActionCard key={i} action={action} />
                ))}
              </>
            )}

            {opps.webDeveloperChecklist && opps.webDeveloperChecklist.length > 0 && (
              <>
                <h3 className="text-lg font-bold text-white mb-4 mt-8">For Your Web Developer</h3>
                {opps.webDeveloperChecklist.map((item: WebDeveloperChecklistItem, i: number) => (
                  <WebDevChecklistCard key={i} item={item} />
                ))}
              </>
            )}

            {opps.webDeveloperNote && (
              <div className="mt-6">
                <CopyableTextBlock text={opps.webDeveloperNote} />
              </div>
            )}
          </>
        ) : (
          <>
            {/* V5: Flat array */}
            {Array.isArray(opps) && opps.map((opp: OpportunityV5, i: number) => (
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
          </>
        )}
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
