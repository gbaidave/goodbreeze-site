'use client'

import { useState } from 'react'

/**
 * BusinessPresenceReportView — renders the BPR inline from reports.input_data JSONB.
 * Mirrors the PDF formatter structure (business-scorecard-formatter-v1.js) section by section.
 * Supports V5 + V6 synthesis field fallbacks.
 * Dark theme: zinc bg, teal primary, white text.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// Input data shape — permissive due to V5/V6 fallbacks + deterministicContent
// ============================================================================

interface BPRData {
  overallScore: number
  searchTerm?: string
  sectionScores?: Record<string, number>
  summaryBlock?: any
  sections?: any
  deterministicContent?: any
  bottomLines?: any
  [key: string]: any
}

interface Props {
  data: BPRData
  domain: string
}

// ============================================================================
// Utility functions (ported from PDF formatter)
// ============================================================================

function safeObj(v: any): Record<string, any> {
  return (v && typeof v === 'object' && !Array.isArray(v)) ? v : {}
}
function safeArr<T = any>(v: any): T[] {
  return Array.isArray(v) ? v : []
}
function safeStr(v: any): string {
  return typeof v === 'string' ? v : (v == null ? '' : String(v))
}
function safeNum(v: any, fallback = 0): number {
  const n = typeof v === 'number' ? v : Number(v)
  return isFinite(n) ? n : fallback
}

function scoreColor(score: number): string {
  if (score <= 40) return 'text-red-400'
  if (score <= 70) return 'text-yellow-400'
  return 'text-green-400'
}

function scoreBarColor(score: number): string {
  if (score <= 40) return 'bg-red-500'
  if (score <= 70) return 'bg-yellow-500'
  return 'bg-green-500'
}

function severityColor(severity: string): string {
  const s = (severity || '').toLowerCase()
  if (s === 'critical') return 'bg-red-900/40 text-red-300 border-red-500/40'
  if (s === 'high') return 'bg-orange-900/40 text-orange-300 border-orange-500/40'
  if (s === 'medium' || s === 'warning') return 'bg-yellow-900/40 text-yellow-300 border-yellow-500/40'
  return 'bg-green-900/40 text-green-300 border-green-500/40'
}

function severityBarColor(severity: string): string {
  const s = (severity || '').toLowerCase()
  if (s === 'critical' || s === 'high') return 'bg-red-500'
  if (s === 'medium' || s === 'warning') return 'bg-yellow-500'
  return 'bg-green-500'
}

function nicheRatingColor(rating: string): string {
  const r = (rating || '').toUpperCase()
  if (r === 'STRONG' || r === 'GOOD') return 'bg-green-900/40 text-green-300 border-green-500/40'
  if (r === 'WEAK' || r === 'POOR') return 'bg-red-900/40 text-red-300 border-red-500/40'
  return 'bg-yellow-900/40 text-yellow-300 border-yellow-500/40'
}

function daColor(da: number): string {
  if (da >= 60) return 'text-green-400'
  if (da >= 30) return 'text-yellow-400'
  return 'text-red-400'
}

function visibilityBadgeColor(v: string): string {
  const s = (v || '').toLowerCase()
  if (s.indexOf('well ahead') >= 0) return 'bg-red-900/40 text-red-300 border-red-500/40'
  if (s.indexOf('ahead') >= 0) return 'bg-orange-900/40 text-orange-300 border-orange-500/40'
  if (s.indexOf('behind') >= 0 || s.indexOf('matched') >= 0 || s.indexOf('close') >= 0)
    return 'bg-green-900/40 text-green-300 border-green-500/40'
  return 'bg-zinc-800 text-zinc-300 border-zinc-600'
}

function ctaGradeColor(grade: string): string {
  const g = (grade || '').toUpperCase()
  if (g === 'A') return 'text-green-400'
  if (g === 'B') return 'text-lime-400'
  if (g === 'C') return 'text-yellow-400'
  if (g === 'D') return 'text-orange-400'
  if (g === 'F') return 'text-red-400'
  return 'text-zinc-400'
}

function trustLevelColor(level: string): string {
  const s = (level || '').toLowerCase()
  if (s === 'strong') return 'text-green-400'
  if (s === 'present') return 'text-lime-400'
  if (s === 'weak') return 'text-yellow-400'
  if (s === 'absent') return 'text-red-400'
  return 'text-zinc-400'
}

function repCardStatusClass(status: string): string {
  const s = (status || '').toLowerCase()
  if (s === 'found' || s === 'linked' || s === 'active' || s === 'claimed')
    return 'border-green-500/40 bg-green-900/20'
  if (s === 'partial' || s === 'limited' || s === 'unclaimed')
    return 'border-yellow-500/40 bg-yellow-900/20'
  return 'border-zinc-700 bg-zinc-800/40'
}

function checklistIcon(status: string): { icon: string; color: string } {
  const s = (status || '').toLowerCase()
  if (s === 'good' || s === 'pass' || s === 'ok') return { icon: '✓', color: 'text-green-400' }
  if (s === 'bad' || s === 'fail' || s === 'missing') return { icon: '✗', color: 'text-red-400' }
  if (s === 'warning' || s === 'partial' || s === 'warn') return { icon: '⚠', color: 'text-yellow-400' }
  return { icon: '•', color: 'text-zinc-400' }
}

function isLocalBiz(bizType: string): boolean {
  return (bizType || '').toLowerCase().indexOf('local') >= 0
}

function splitOnFirstPeriod(text: string): { bold: string; detail: string } {
  const idx = text.indexOf('.')
  if (idx <= 0) return { bold: text, detail: '' }
  return {
    bold: text.substring(0, idx + 1),
    detail: text.substring(idx + 1).trim(),
  }
}

function howToCompeteText(bizType: string): string {
  const b = (bizType || '').toLowerCase()
  if (b.indexOf('local') >= 0) {
    return 'Local customers trust businesses visible in their community. Focus on Google Business Profile, verified reviews, local content, and partnerships with nearby businesses. Visibility in "near me" searches and AI-powered local assistants is where the wins are right now.'
  }
  if (b.indexOf('agency') >= 0) {
    return 'Agency buyers research extensively before hiring. They compare case studies, testimonials, and thought leadership. Strong content that shows your thinking — blog posts, video explainers, case studies — compounds over time and tilts decisions in your favor.'
  }
  if (b.indexOf('saas') >= 0 || b.indexOf('ecommerce') >= 0 || b.indexOf('commerce') >= 0) {
    return 'Online buyers compare features, reviews, and pricing before converting. Clear product pages, frictionless signup, trust signals, and fast load times are the basics. Content that answers buyer questions before they ask wins the sale.'
  }
  return 'Build your online presence around what makes your business unique. Consistent content, real reviews, and a clear answer to "why you?" are the difference-makers. AI search assistants reward businesses with structured information and authentic authority.'
}

function computeAiVisibilityScore(
  schemaTypesFound: number,
  hasLlmsTxt: boolean,
  aiCrawler: string
): number {
  let score = 0
  if (schemaTypesFound > 0) score += 30
  if (schemaTypesFound >= 3) score += 20
  if (hasLlmsTxt) score += 30
  if ((aiCrawler || '').toLowerCase() === 'accessible') score += 20
  return score
}

// ============================================================================
// Reusable presentation components
// ============================================================================

function SectionHeader({ number, title, intro }: { number: string; title: string; intro: string }) {
  return (
    <div className="mb-6">
      <div className="text-xs font-mono text-primary tracking-widest mb-1">SECTION {number}</div>
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-sm text-zinc-400">{intro}</p>
    </div>
  )
}

function StatCard({ label, value, colorClass }: { label: string; value: string | number; colorClass?: string }) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-700 rounded-lg p-4">
      <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">{label}</div>
      <div className={`text-3xl font-bold ${colorClass ?? 'text-white'}`}>{value}</div>
    </div>
  )
}

function Callout({
  variant = 'insight',
  title,
  children,
}: {
  variant?: 'insight' | 'weakness' | 'strength' | 'warning' | 'bottom-line'
  title: string
  children: React.ReactNode
}) {
  const border = {
    insight: 'border-primary/50 bg-primary/10',
    weakness: 'border-red-500/50 bg-red-900/20',
    strength: 'border-green-500/50 bg-green-900/20',
    warning: 'border-yellow-500/50 bg-yellow-900/20',
    'bottom-line': 'border-zinc-600 bg-zinc-800/40',
  }[variant]

  const titleColor = {
    insight: 'text-primary',
    weakness: 'text-red-300',
    strength: 'text-green-300',
    warning: 'text-yellow-300',
    'bottom-line': 'text-zinc-300',
  }[variant]

  return (
    <div className={`border rounded-lg p-4 ${border}`}>
      <div className={`text-xs font-bold uppercase tracking-wide mb-2 ${titleColor}`}>{title}</div>
      <div className="text-sm text-zinc-200 space-y-2">{children}</div>
    </div>
  )
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = Math.max(0, Math.min(100, score))
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-zinc-300">{label}</span>
        <span className="text-zinc-400">{score} / 100</span>
      </div>
      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full ${scoreBarColor(pct)}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function ChecklistRow({
  status,
  name,
  text,
  benchmark,
}: {
  status: string
  name: string
  text?: string
  benchmark?: string
}) {
  const { icon, color } = checklistIcon(status)
  return (
    <div className="flex gap-3 py-2 border-b border-zinc-800 last:border-0">
      <div className={`text-lg font-bold w-5 flex-shrink-0 ${color}`}>{icon}</div>
      <div className="flex-1">
        <div className="text-sm text-white font-medium">{name}</div>
        {text && <div className="text-sm text-zinc-400">{text}</div>}
        {benchmark && <div className="text-xs italic text-zinc-500 mt-0.5">{benchmark}</div>}
      </div>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch {
          // clipboard unavailable
        }
      }}
      className="px-3 py-1.5 bg-primary text-white rounded text-xs font-medium hover:bg-primary/80"
    >
      {copied ? 'Copied ✓' : 'Copy to clipboard'}
    </button>
  )
}

// ============================================================================
// Main component
// ============================================================================

export default function BusinessPresenceReportView({ data, domain }: Props) {
  // ---------------------------------------------------------------
  // Resolve synthesis fields with V5 / V6 fallbacks
  // ---------------------------------------------------------------
  const synthesis = data
  const overallScore = safeNum(synthesis.overallScore)
  const sectionScores = safeObj(synthesis.sectionScores)
  const sections = safeObj(synthesis.sections)
  const detContent = safeObj(synthesis.deterministicContent)
  const bottomLines = safeObj(synthesis.bottomLines)
  const summaryBlock = safeObj(synthesis.summaryBlock)

  const summaryParagraph = safeStr(summaryBlock.summaryParagraph || summaryBlock.advisorParagraph)
  const keyMetrics = safeArr<string>(summaryBlock.keyMetrics?.length ? summaryBlock.keyMetrics : summaryBlock.bulletScorecard)
  const issueCount = safeNum(summaryBlock.issueCount || detContent.issueCount)
  const quickWinCount = safeNum(summaryBlock.quickWinCount)
  const visibilityGapPercent = safeNum(summaryBlock.visibilityGapPercent)

  const biz = safeObj(sections.businessIdentity || sections.businessSnapshot)
  const bizType = safeStr(biz.businessTypeBadge || biz.businessType)
  const industry = safeStr(biz.industry)
  const valueProp = safeStr(biz.valueProp)
  const nicheAnalysis = safeArr<any>(biz.nicheAnalysis || biz.topServices)
  const reachAssessment = safeStr(biz.reachAssessment)
  const mozSummary = safeStr(biz.mozSummary)
  const searchMetrics = safeObj(detContent.searchMetrics)
  const emailSecurity = safeObj(detContent.emailSecurity)

  const website = safeObj(sections.websiteExperience || sections.websiteHealth)
  const healthScore = safeNum(website.score || sectionScores.websiteExperience || sectionScores.websiteHealth)
  const speedCards = safeObj(detContent.speedCards)
  const healthFindings = safeArr<any>(website.findings)
  const topIssue = safeStr(website.topIssue)
  const siteAge = safeStr(website.siteAge)
  const conversionChecklist = safeArr<any>(detContent.conversionChecklist)

  const search = safeObj(sections.searchVisibility)
  const searchScore = safeNum(search.score || sectionScores.searchVisibility)
  const schemaTypesFound = safeNum(search.schemaTypesFound)
  const hasLlmsTxt = Boolean(search.hasLlmsTxt)
  const aiCrawler = safeStr(search.aiCrawlerStatus)
  const aiVisScore = computeAiVisibilityScore(schemaTypesFound, hasLlmsTxt, aiCrawler)
  const findabilityChecklist = safeArr<any>(detContent.findabilityChecklist)
  const searchFindings = safeArr<any>(search.findings)

  const conv = safeObj(sections.websiteConversion || sections.marketingEffectiveness)
  const mktgScore = safeNum(conv.score || sectionScores.websiteConversion || sectionScores.marketingEffectiveness)
  const ctaGrade = safeStr(conv.ctaGrade || '-')
  const ctaAnalysis = safeStr(conv.ctaAnalysis)
  const trustLevel = safeStr(conv.trustLevel || '—')
  const repSignalsRaw = safeArr<any>(conv.reputationSignals)
  const repSignals = isLocalBiz(bizType)
    ? repSignalsRaw
    : repSignalsRaw.filter((r) => {
        const p = safeStr(safeObj(r).platform).toLowerCase()
        return p.indexOf('google') < 0 && p.indexOf('gbp') < 0
      })
  const homepageFindings = safeArr<any>(conv.homepageFindings)
  const adTracking = safeArr<string>(conv.adTrackingDetected)

  const competitors = safeArr<any>(sections.topCompetitors)
  const searchTerm = safeStr(synthesis.searchTerm || summaryBlock.searchTerm)

  // Section 7 — growth opportunities (V6 business owner actions) + web dev
  const priorityOpps = safeObj(sections.priorityOpportunities)
  const businessOwnerActions = safeArr<any>(priorityOpps.businessOwnerActions)
  const webDeveloperChecklistV6 = safeArr<any>(priorityOpps.webDeveloperChecklist)
  const webDevNote = safeStr(priorityOpps.webDeveloperNote || priorityOpps.webDevNote)
  const growthOpps = safeArr<any>(synthesis.growthOpportunities || priorityOpps.growthOpportunities || businessOwnerActions)

  // Section 8 — consolidated technical checklist (dedupe by first 50 chars)
  const allTechItems: any[] = [
    ...safeArr<any>(website.technicalChecklist),
    ...safeArr<any>(search.technicalChecklist),
    ...safeArr<any>(conv.technicalChecklist),
    ...webDeveloperChecklistV6,
  ]
  const seenTechKeys = new Set<string>()
  const techChecklist: any[] = []
  for (const item of allTechItems) {
    const task = safeStr(safeObj(item).task || item)
    const key = task.slice(0, 50).toLowerCase()
    if (!key || seenTechKeys.has(key)) continue
    seenTechKeys.add(key)
    techChecklist.push(item)
  }

  const biggestWin = growthOpps[0]
  const biggestWinTitle = safeStr(safeObj(biggestWin).title)
  const showBiggestWin = biggestWin && biggestWinTitle && biggestWinTitle.indexOf('Share the technical details') < 0

  return (
    <div className="space-y-12 pb-12">
      {/* Cover / title */}
      <div className="text-center py-8 border-b border-zinc-800">
        <div className="text-xs font-mono text-primary tracking-widest mb-3">BUSINESS PRESENCE REPORT</div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 break-words">{domain}</h1>
        <p className="text-zinc-400">Your business presence assessment</p>
      </div>

      {/* ===================================================================
          SECTION 01 — YOUR BUSINESS ONLINE
          =================================================================== */}
      <section>
        <SectionHeader number="01" title="Your Business Online" intro="A high-level overview of your business presence across search, website, and reputation." />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Overall Score" value={overallScore} colorClass={scoreColor(overallScore)} />
          <StatCard label="Issues Found" value={issueCount} colorClass="text-red-400" />
          <StatCard label="Quick Wins" value={quickWinCount} colorClass="text-green-400" />
          <StatCard label="Visibility Gap" value={`${visibilityGapPercent}%`} colorClass="text-red-400" />
        </div>

        <div className="space-y-3 mb-6">
          {[
            { label: 'Business Identity', key: sectionScores.businessIdentity ?? sectionScores.businessSnapshot },
            { label: 'Website Experience', key: sectionScores.websiteExperience ?? sectionScores.websiteHealth },
            { label: 'Search Visibility', key: sectionScores.searchVisibility },
            { label: 'Website Conversion', key: sectionScores.websiteConversion ?? sectionScores.marketingEffectiveness },
            { label: 'Competitor Position', key: sectionScores.competitorPosition },
          ].map((s) => (
            <ScoreBar key={s.label} label={s.label} score={safeNum(s.key)} />
          ))}
        </div>

        {summaryParagraph && (
          <div className="mb-6">
            <Callout variant="insight" title="Summary">
              <p>{summaryParagraph}</p>
              {keyMetrics.length > 0 && (
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {keyMetrics.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
              )}
            </Callout>
          </div>
        )}

        {showBiggestWin && (
          <Callout variant="strength" title="Biggest Win">
            <p className="font-semibold">{biggestWinTitle}</p>
            <p className="text-xs text-zinc-400 mt-2">See Section 7 for details and more opportunities.</p>
          </Callout>
        )}
      </section>

      {/* ===================================================================
          SECTION 02 — YOUR BUSINESS IDENTITY
          =================================================================== */}
      <section>
        <SectionHeader number="02" title="Your Business Identity" intro="Do people know what I do and who I serve?" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="bg-zinc-900/60 border border-zinc-700 rounded-lg p-4">
            <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Business Type</div>
            <div className="text-white">{bizType || '—'}</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-700 rounded-lg p-4">
            <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Industry</div>
            <div className="text-white">{industry || '—'}</div>
          </div>
        </div>

        {valueProp && (
          <div className="mb-4 bg-zinc-900/60 border border-zinc-700 rounded-lg p-4">
            <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">What Your Site Communicates</div>
            <div className="text-white">{valueProp}</div>
          </div>
        )}

        {nicheAnalysis.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-semibold text-zinc-300 mb-2">Services You Highlight on Your Site</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {nicheAnalysis.map((n: any, i: number) => {
                const o = safeObj(n)
                return (
                  <div key={i} className="bg-zinc-900/60 border border-zinc-700 rounded-lg p-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${nicheRatingColor(safeStr(o.rating))}`}>
                      {safeStr(o.rating).toUpperCase() || 'MODERATE'}
                    </span>
                    <div className="text-white text-sm font-medium mt-2">{safeStr(o.name)}</div>
                    {o.detail && <div className="text-xs text-zinc-400 mt-1">{safeStr(o.detail)}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {reachAssessment && (
          <div className="mb-4">
            <Callout variant="insight" title="Are you reaching the right customers?">
              <p>{reachAssessment}</p>
            </Callout>
          </div>
        )}

        {(searchMetrics.trustScore || searchMetrics.sitesLinking || emailSecurity.status) && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              {searchMetrics.trustScore && (
                <div className="bg-zinc-900/60 border border-zinc-700 rounded-lg p-4">
                  <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Search Trust Score</div>
                  <div className="text-2xl font-bold text-white">{safeStr(searchMetrics.trustScore.value) || '—'}</div>
                </div>
              )}
              {searchMetrics.sitesLinking && (
                <div className="bg-zinc-900/60 border border-zinc-700 rounded-lg p-4">
                  <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Sites Linking</div>
                  <div className="text-2xl font-bold text-white">{safeStr(searchMetrics.sitesLinking.value) || '—'}</div>
                </div>
              )}
              {emailSecurity.status && (
                <div className="bg-zinc-900/60 border border-zinc-700 rounded-lg p-4">
                  <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Email Protection</div>
                  <div className="text-2xl font-bold">
                    {(() => {
                      const s = safeStr(emailSecurity.status).toLowerCase()
                      if (s === 'protected' || s === 'good') return <span className="text-green-400">✓</span>
                      if (s === 'partial') return <span className="text-yellow-400">⚠</span>
                      return <span className="text-red-400">✗</span>
                    })()}
                  </div>
                </div>
              )}
            </div>
            <div className="text-xs text-zinc-500 space-y-1 mb-3">
              {searchMetrics.trustScore?.text && <p><span className="text-zinc-400 font-medium">Search Trust Score:</span> {safeStr(searchMetrics.trustScore.text)}</p>}
              {searchMetrics.sitesLinking?.text && <p><span className="text-zinc-400 font-medium">Sites Linking:</span> {safeStr(searchMetrics.sitesLinking.text)}</p>}
              {(emailSecurity.spf?.text || emailSecurity.dmarc?.text) && (
                <p><span className="text-zinc-400 font-medium">Email Protection:</span> {safeStr(emailSecurity.spf?.text)} {safeStr(emailSecurity.dmarc?.text)}</p>
              )}
            </div>
          </>
        )}

        {mozSummary && <p className="text-xs text-zinc-500 italic">{mozSummary}</p>}
      </section>

      {/* ===================================================================
          SECTION 03 — YOUR WEBSITE EXPERIENCE
          =================================================================== */}
      <section>
        <SectionHeader number="03" title="Your Website Experience" intro="Is my website helping or hurting me?" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Experience Score" value={healthScore} colorClass={scoreColor(healthScore)} />
          <StatCard label="Mobile Performance" value={speedCards.mobilePerf ?? 'N/A'} colorClass={scoreColor(safeNum(speedCards.mobilePerf))} />
          <StatCard label="Desktop Performance" value={speedCards.desktopPerf ?? 'N/A'} colorClass={scoreColor(safeNum(speedCards.desktopPerf))} />
          <StatCard label="Issues Found" value={safeNum(detContent.issueCount || website.issueCount || 0)} colorClass="text-red-400" />
        </div>

        <div className="mb-4">
          <Callout variant="warning" title="Speed matters">
            <p>Pages loading over 3 seconds lose 53% of mobile visitors. First Contentful Paint under 1.8 seconds is considered good. Largest Contentful Paint under 2.5 seconds is good; over 4 seconds is slow.</p>
          </Callout>
        </div>

        {conversionChecklist.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-semibold text-zinc-300 mb-2">What We Checked</div>
            <div className="bg-zinc-900/60 border border-zinc-700 rounded-lg px-4">
              {conversionChecklist.map((item: any, i: number) => {
                const o = safeObj(item)
                return <ChecklistRow key={i} status={safeStr(o.status)} name={safeStr(o.element || o.name)} text={safeStr(o.text)} benchmark={safeStr(o.benchmark)} />
              })}
            </div>
          </div>
        )}

        {topIssue && (
          <div className="mb-4">
            <Callout variant="weakness" title="Top Issue">
              <p>{topIssue}</p>
            </Callout>
          </div>
        )}

        {healthFindings.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-semibold text-zinc-300 mb-2">Additional Findings</div>
            <div className="space-y-2">
              {healthFindings.map((f: any, i: number) => {
                const o = safeObj(f)
                const sev = safeStr(o.severity)
                return (
                  <div key={i} className={`border rounded p-3 ${severityColor(sev)}`}>
                    <div className="flex items-start gap-2 mb-1">
                      <span className="text-xs font-bold uppercase">{sev || 'medium'}</span>
                    </div>
                    <p className="text-sm text-zinc-100">{safeStr(o.finding || o.title || o.text)}</p>
                    {o.impact && <p className="text-xs text-zinc-300 mt-1">{safeStr(o.impact)}</p>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {siteAge && <p className="text-xs text-zinc-500 mb-4">Site age: {siteAge}</p>}

        {bottomLines.websiteExperience && (
          <Callout variant="bottom-line" title="Bottom Line">
            <ul className="list-disc list-inside space-y-1">
              {safeArr<string>(safeObj(bottomLines.websiteExperience || bottomLines.websiteHealth).bullets).map((b: string, i: number) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
            {safeObj(bottomLines.websiteExperience || bottomLines.websiteHealth).result && (
              <p className="font-semibold mt-2">Result: {safeStr(safeObj(bottomLines.websiteExperience || bottomLines.websiteHealth).result)}</p>
            )}
          </Callout>
        )}
      </section>

      {/* ===================================================================
          SECTION 04 — CAN PEOPLE FIND YOU?
          =================================================================== */}
      <section>
        <SectionHeader number="04" title="Can People Find You?" intro="When someone searches for what I offer, do they find me?" />

        <div className="mb-6">
          <Callout variant="insight" title="Where people search today">
            <p>People no longer search in just one place. Google shows AI-generated summaries that may or may not include your business. YouTube, ChatGPT, Perplexity, and social media now surface answers directly. Visibility across all of these has become the new baseline.</p>
          </Callout>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <StatCard label="Visibility Score" value={searchScore} colorClass={scoreColor(searchScore)} />
          <StatCard label="AI Visibility Score" value={aiVisScore} colorClass={scoreColor(aiVisScore)} />
          <div className="md:col-span-1 bg-zinc-900/40 border border-zinc-800 rounded-lg p-4 text-xs text-zinc-400">
            <p><span className="text-zinc-300 font-medium">Visibility Score</span> measures how findable your business is in traditional search.</p>
            <p className="mt-1"><span className="text-zinc-300 font-medium">AI Visibility Score</span> measures how well AI assistants can access and cite your content.</p>
          </div>
        </div>

        {findabilityChecklist.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-semibold text-zinc-300 mb-2">Can Customers Find You?</div>
            <div className="bg-zinc-900/60 border border-zinc-700 rounded-lg px-4">
              {findabilityChecklist.map((item: any, i: number) => {
                const o = safeObj(item)
                return <ChecklistRow key={i} status={safeStr(o.status)} name={safeStr(o.element || o.name)} text={safeStr(o.text)} benchmark={safeStr(o.benchmark)} />
              })}
            </div>
          </div>
        )}

        {searchFindings.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-semibold text-zinc-300 mb-2">Findings</div>
            <div className="space-y-2">
              {searchFindings.map((f: any, i: number) => {
                const o = safeObj(f)
                const sev = safeStr(o.severity)
                return (
                  <div key={i} className={`border rounded p-3 ${severityColor(sev)}`}>
                    <span className="text-xs font-bold uppercase">{sev || 'medium'}</span>
                    <p className="text-sm text-zinc-100 mt-1">{safeStr(o.finding || o.title || o.text)}</p>
                    {o.impact && <p className="text-xs text-zinc-300 mt-1">{safeStr(o.impact)}</p>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {bottomLines.searchVisibility && (
          <Callout variant="bottom-line" title="Bottom Line">
            <ul className="list-disc list-inside space-y-1">
              {safeArr<string>(safeObj(bottomLines.searchVisibility).bullets).map((b: string, i: number) => <li key={i}>{b}</li>)}
            </ul>
            {safeObj(bottomLines.searchVisibility).result && (
              <p className="font-semibold mt-2">Result: {safeStr(safeObj(bottomLines.searchVisibility).result)}</p>
            )}
          </Callout>
        )}
      </section>

      {/* ===================================================================
          SECTION 05 — IS YOUR WEBSITE CONVERTING?
          =================================================================== */}
      <section>
        <SectionHeader number="05" title="Is Your Website Converting?" intro="When people visit my website, do they contact me?" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <StatCard label="Marketing Score" value={mktgScore} colorClass={scoreColor(mktgScore)} />
          <StatCard label="Call-to-Action Grade" value={ctaGrade} colorClass={ctaGradeColor(ctaGrade)} />
          <StatCard label="Trust Signals" value={trustLevel} colorClass={trustLevelColor(trustLevel)} />
        </div>

        {repSignals.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-semibold text-zinc-300 mb-2">Reputation Signals</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {repSignals.map((r: any, i: number) => {
                const o = safeObj(r)
                return (
                  <div key={i} className={`border rounded p-3 ${repCardStatusClass(safeStr(o.status))}`}>
                    <div className="text-sm font-semibold text-white">{safeStr(o.platform)}</div>
                    <div className="text-xs font-medium text-zinc-300 mt-1">{safeStr(o.status)}</div>
                    {o.detail && <div className="text-xs text-zinc-400 mt-1">{safeStr(o.detail)}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {ctaAnalysis && (
          <div className="mb-4">
            <Callout variant="insight" title="CTA Analysis">
              <p>{ctaAnalysis}</p>
            </Callout>
          </div>
        )}

        <div className="mb-4 bg-zinc-900/60 border border-zinc-700 rounded-lg p-3">
          <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Analytics & Tracking</div>
          <div className="text-sm text-zinc-200">
            {adTracking.length > 0 ? adTracking.join(', ') : 'No analytics or tracking tools detected.'}
          </div>
        </div>

        {homepageFindings.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-semibold text-zinc-300 mb-2">Homepage Findings</div>
            <div className="space-y-2">
              {homepageFindings.map((f: any, i: number) => {
                const o = safeObj(f)
                const { bold, detail } = splitOnFirstPeriod(safeStr(o.text || o.finding))
                return (
                  <div key={i} className="flex items-stretch bg-zinc-900/40 rounded border border-zinc-800 overflow-hidden">
                    <div className={`w-1 flex-shrink-0 ${severityBarColor(safeStr(o.severity))}`} />
                    <div className="p-3 flex-1 text-sm">
                      <span className="text-white font-semibold">{bold}</span>
                      {detail && <span className="text-zinc-400"> {detail}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {bottomLines.websiteConversion && (
          <Callout variant="bottom-line" title="Bottom Line">
            <ul className="list-disc list-inside space-y-1">
              {safeArr<string>(safeObj(bottomLines.websiteConversion || bottomLines.marketingEffectiveness).bullets).map((b: string, i: number) => <li key={i}>{b}</li>)}
            </ul>
            {safeObj(bottomLines.websiteConversion || bottomLines.marketingEffectiveness).result && (
              <p className="font-semibold mt-2">Result: {safeStr(safeObj(bottomLines.websiteConversion || bottomLines.marketingEffectiveness).result)}</p>
            )}
          </Callout>
        )}
      </section>

      {/* ===================================================================
          SECTION 06 — YOUR COMPETITION
          =================================================================== */}
      <section>
        <SectionHeader number="06" title="Your Competition" intro="Who am I losing customers to?" />

        {searchTerm && (
          <div className="mb-4">
            <span className="inline-block bg-primary/20 text-primary border border-primary/40 rounded-full px-3 py-1 text-xs font-medium">
              Search term: {searchTerm}
            </span>
          </div>
        )}

        {competitors.length > 0 ? (
          <div className="mb-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-700">
                  <th className="text-left py-2 px-3">Domain</th>
                  <th className="text-left py-2 px-3">Trust (DA)</th>
                  <th className="text-left py-2 px-3">What They Do Well</th>
                  <th className="text-left py-2 px-3">Visibility</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((c: any, i: number) => {
                  const o = safeObj(c)
                  const da = safeNum(o.da)
                  return (
                    <tr key={i} className="border-b border-zinc-800 last:border-0">
                      <td className="py-2 px-3 text-white font-medium">{safeStr(o.domain)}</td>
                      <td className={`py-2 px-3 font-semibold ${daColor(da)}`}>{da || '—'}</td>
                      <td className="py-2 px-3 text-zinc-300">{safeStr(o.whatTheyDoWell)}</td>
                      <td className="py-2 px-3">
                        {o.visibility && (
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${visibilityBadgeColor(safeStr(o.visibility))}`}>
                            {safeStr(o.visibility)}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-zinc-500 mb-4">No competitive comparisons available.</p>
        )}

        <div className="mb-4">
          <Callout variant="insight" title="How to Compete">
            <p>Focus on what makes you different and where your buyers actually spend time.</p>
            <p>{howToCompeteText(bizType)}</p>
          </Callout>
        </div>

        {competitors.length > 0 && (
          <Callout variant="warning" title="What this means">
            <p>The businesses listed above have stronger online visibility for this search term right now. The gap is not permanent — it reflects where time and effort have been invested. The actions in the next section are designed to close that gap.</p>
          </Callout>
        )}
      </section>

      {/* ===================================================================
          SECTION 07 — WHAT TO DO NEXT
          =================================================================== */}
      <section>
        <SectionHeader number="07" title="What To Do Next" intro="What should I focus on first?" />

        {growthOpps.length > 0 && (
          <div className="mb-6">
            <div className="text-sm font-semibold text-zinc-300 mb-2">Business Growth Opportunities</div>
            <div className="space-y-2">
              {growthOpps.map((o: any, i: number) => {
                const g = safeObj(o)
                return (
                  <div key={i} className="bg-zinc-900/60 border border-zinc-700 rounded-lg p-4">
                    <div className="text-sm font-semibold text-white mb-1">{safeStr(g.title)}</div>
                    <p className="text-sm text-zinc-300">{safeStr(g.text || g.howToFix || g.impact)}</p>
                    {(g.timeEstimate || g.cost) && (
                      <div className="flex gap-2 mt-2 text-xs">
                        {g.timeEstimate && <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded">Time: {safeStr(g.timeEstimate)}</span>}
                        {g.cost && <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded">Cost: {safeStr(g.cost)}</span>}
                      </div>
                    )}
                    {g.reference && <div className="text-xs text-zinc-500 mt-1">{safeStr(g.reference)}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </section>

      {/* ===================================================================
          SECTION 08 — FOR YOUR WEB DEVELOPER
          =================================================================== */}
      {(techChecklist.length > 0 || webDevNote) && (
        <section>
          <SectionHeader number="08" title="For Your Web Developer" intro="A consolidated checklist of technical items from this report you can share with your web developer." />

          {techChecklist.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-semibold text-zinc-300 mb-2">What to tell your web developer</div>
              <div className="bg-zinc-900/60 border border-zinc-700 rounded-lg p-4">
                <ul className="space-y-2">
                  {techChecklist.map((item: any, i: number) => {
                    const o = safeObj(item)
                    const task = safeStr(o.task || item)
                    const diff = safeStr(o.difficulty)
                    return (
                      <li key={i} className="flex items-start gap-2 text-sm text-zinc-200">
                        <span className="text-zinc-500 mt-0.5">☐</span>
                        <span className="flex-1">
                          {task}
                          {diff && <span className="ml-2 text-xs text-zinc-500">({diff})</span>}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          )}

          {webDevNote && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-zinc-300">Send This to Your Web Developer</div>
                <CopyButton text={webDevNote} />
              </div>
              <pre className="bg-zinc-950 border border-zinc-700 rounded-lg p-4 text-xs text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
                {webDevNote}
              </pre>
            </div>
          )}
        </section>
      )}

      {/* ===================================================================
          CTA + LEGAL + DATA SOURCES
          =================================================================== */}
      <section className="border-t border-zinc-700 pt-8 space-y-4">
        <div className="bg-primary/10 border border-primary/40 rounded-lg p-6 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Ready to fix these issues and grow your business?</h3>
          <p className="text-zinc-300 text-sm mb-4">Book a free 30-minute strategy session to talk through priorities and next steps.</p>
          <a
            href="https://goodbreeze.ai/strategy-call"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/80"
          >
            Book Your Free Strategy Call
          </a>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4 text-xs text-zinc-500">
          <div className="font-semibold text-zinc-400 mb-1">Important Legal Disclaimer</div>
          <p>This report was generated using artificial intelligence and automated analysis of publicly available information. Findings, scores, and recommendations are directional guidance, not professional advice. Good Breeze AI makes no guarantees of specific outcomes. See <a href="https://goodbreeze.ai/terms-of-use" className="text-primary">goodbreeze.ai/terms-of-use</a>.</p>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4 text-xs text-zinc-500">
          <div className="font-semibold text-zinc-400 mb-1">Data Sources</div>
          <p>Moz Search Presence and Link Metrics · Google PageSpeed Insights · AI Crawler Access Analysis · Schema.org Structured Data · Competitive SERP Analysis</p>
        </div>
      </section>
    </div>
  )
}
