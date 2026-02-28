/**
 * POST /api/reports/generate
 *
 * Entitlement-checked report generation endpoint.
 * Called by the frontend tool forms (SEO Auditor, Competitive Analyzer).
 *
 * Flow:
 * 1. Authenticate user (Supabase session)
 * 2. Check entitlement (plan + usage limits)
 * 3. Create report row in DB (status: pending)
 * 4. Trigger n8n webhook asynchronously
 * 5. Return reportId immediately (frontend polls or awaits email)
 *
 * The n8n webhook runs async — PDF arrives by email, HTML displayed in dashboard.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import {
  checkEntitlement,
  recordUsage,
  createReportRow,
  type ReportType,
} from '@/lib/entitlement'
import { createServiceClient } from '@/lib/supabase/service-client'
import { sendReportsExhaustedEmail } from '@/lib/email'

// ============================================================================
// n8n webhook URLs
// N8N_WEBHOOK_BASE_URL: set to https://n8n.goodbreeze.ai on Vercel (staging/prod)
//                       leave unset on VPS to use localhost:5678 (bypasses Cloudflare)
// ============================================================================

const N8N_BASE = process.env.N8N_WEBHOOK_BASE_URL ?? 'http://localhost:5678'

const N8N_WEBHOOKS: Record<ReportType, string> = {
  // Analyzer
  h2h:               `${N8N_BASE}/webhook/bfa6c879-77ea-475c-b279-09f6fdbfdfde`,
  t3c:               `${N8N_BASE}/webhook/bfa6c879-77ea-475c-b279-09f6fdbfdfde`,
  cp:                `${N8N_BASE}/webhook/bfa6c879-77ea-475c-b279-09f6fdbfdfde`,
  // SEO Auditor PDFs
  ai_seo:            `${N8N_BASE}/webhook/ai-seo-optimizer-pdf`,
  landing_page:      `${N8N_BASE}/webhook/landing-page-optimizer-pdf`,
  keyword_research:  `${N8N_BASE}/webhook/keyword-research-pdf`,
  seo_audit:         `${N8N_BASE}/webhook/seo-audit-v4-pdf`,
  seo_comprehensive: `${N8N_BASE}/webhook/seo-comprehensive-pdf`,
}

// ============================================================================
// Request body type
// ============================================================================

interface GenerateRequest {
  reportType: ReportType
  // Analyzer fields
  targetWebsite?: string
  competitor1?: string
  competitor1Website?: string
  competitor2?: string
  competitor2Website?: string
  competitor3?: string
  competitor3Website?: string
  // SEO fields
  url?: string
  company?: string
  focusKeyword?: string
  // Common
  userEmail?: string  // override — defaults to account email
  userName?: string   // override — defaults to account name
}

// ============================================================================
// Input validation
// ============================================================================

const MAX_URL_LEN = 500
const MAX_STR_LEN = 200

function normalizeUrl(str: string): string {
  const trimmed = str.trim()
  if (!trimmed) return trimmed
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  if (trimmed.startsWith('//')) return 'https:' + trimmed
  return 'https://' + trimmed
}

function isValidHttpUrl(str: string): boolean {
  try {
    const url = new URL(str)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function validateInput(body: GenerateRequest): string | null {
  // Validate URL fields
  for (const field of ['url', 'targetWebsite', 'competitor1Website', 'competitor2Website', 'competitor3Website'] as const) {
    const val = body[field]
    if (val !== undefined && val !== '') {
      if (val.length > MAX_URL_LEN || !isValidHttpUrl(val))
        return `Invalid URL in field: ${field}`
    }
  }
  // Validate string lengths
  for (const field of ['company', 'focusKeyword', 'competitor1', 'competitor2', 'competitor3'] as const) {
    const val = body[field]
    if (val && val.length > MAX_STR_LEN)
      return `${field} exceeds maximum length of ${MAX_STR_LEN} characters`
  }
  // Required fields per report type
  if (['h2h', 't3c', 'cp'].includes(body.reportType)) {
    if (!body.targetWebsite || !isValidHttpUrl(body.targetWebsite))
      return 'Valid target website URL is required'
    if (body.reportType === 'h2h' && (!body.competitor1Website || !isValidHttpUrl(body.competitor1Website)))
      return 'Valid competitor website URL is required'
    if (body.reportType === 't3c') {
      if (!body.competitor1Website || !body.competitor2Website || !body.competitor3Website)
        return 'All 3 competitor website URLs are required for Top 3 Competitors report'
    }
  } else {
    if (!body.url || !isValidHttpUrl(body.url))
      return 'Valid website URL is required'
  }
  return null
}

// ============================================================================
// Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHENTICATED' },
        { status: 401 }
      )
    }

    // 2. Parse and validate request
    const body: GenerateRequest = await request.json()
    const { reportType } = body

    if (!reportType || !N8N_WEBHOOKS[reportType]) {
      return NextResponse.json(
        { error: 'Invalid report type', code: 'INVALID_REPORT_TYPE' },
        { status: 400 }
      )
    }

    // Normalize URL fields — prepend https:// if user omitted the protocol
    const urlFields = ['url', 'targetWebsite', 'competitor1Website', 'competitor2Website', 'competitor3Website'] as const
    for (const field of urlFields) {
      if (body[field]) body[field] = normalizeUrl(body[field]!)
    }

    const validationError = validateInput(body)
    if (validationError) {
      return NextResponse.json(
        { error: validationError, code: 'INVALID_INPUT' },
        { status: 400 }
      )
    }

    // 2b. Hourly rate limit — max 20 reports per user per hour (burst protection)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count: recentCount } = await supabase
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneHourAgo)

    if (recentCount !== null && recentCount >= 20) {
      return NextResponse.json(
        { error: 'Too many requests. You can generate up to 20 reports per hour.', code: 'RATE_LIMITED' },
        { status: 429 }
      )
    }

    // 3. Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, email, subscriptions(plan, status)')
      .eq('id', user.id)
      .single()

    const userEmail = body.userEmail || profile?.email || user.email!
    const userName = body.userName || profile?.name || userEmail.split('@')[0]
    // Only count active/trialing subscriptions when determining report expiry
    const activeSub = ((profile as any)?.subscriptions ?? [])
      .find((s: { plan: string; status: string }) => s.status === 'active' || s.status === 'trialing')
    const plan = activeSub?.plan ?? 'free'

    // 4. Check entitlement
    const entitlement = await checkEntitlement(user.id, reportType)

    if (!entitlement.allowed) {
      return NextResponse.json(
        {
          error: entitlement.reason,
          code: 'ENTITLEMENT_DENIED',
          upgradePrompt: entitlement.upgradePrompt,
        },
        { status: 402 } // Payment Required
      )
    }

    // 5. Create report row in DB
    const inputData = { ...body, userEmail, userName }
    delete (inputData as any).reportType

    const usageType = entitlement.deductFrom === 'credits' ? 'credits' : 'subscription'

    const reportId = await createReportRow(user.id, reportType, inputData, plan, {
      usageType,
      creditRowId: entitlement.creditRowId,
    })

    // 6. Build n8n payload
    const n8nPayload = buildN8nPayload(reportType, body, {
      userEmail,
      userName,
      sessionId: reportId,
    })

    // 7. Trigger n8n async (fire and forget — n8n responds immediately, processes in background)
    const webhookUrl = N8N_WEBHOOKS[reportType]

    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(n8nPayload),
    }).catch((err) => {
      console.error(`n8n webhook failed for report ${reportId}:`, err)
      // Report status stays 'pending' — can be retried or flagged via error monitoring
    })

    // 8. Record usage (increment usage counters + decrement credits if applicable)
    //    Note: free_reports_used is NOT passed here — the free slot was already atomically
    //    reserved inside checkEntitlement() via check_and_reserve_free_slot RPC.
    await recordUsage(user.id, reportType, entitlement.deductFrom!, entitlement.creditRowId)

    // 8b. If this was a credit deduction, check if user is now out of credits — fire nudge email
    if (entitlement.deductFrom === 'credits') {
      void (async () => {
        try {
          const svc = createServiceClient()
          const { data: creditRows } = await svc
            .from('credits')
            .select('balance')
            .eq('user_id', user.id)
            .gt('balance', 0)
          const remaining = (creditRows ?? []).reduce((sum: number, c: { balance: number }) => sum + (c.balance ?? 0), 0)
          if (remaining === 0) {
            await sendReportsExhaustedEmail(userEmail, userName, user.id)
          }
        } catch (e) {
          console.error('Reports-exhausted nudge email failed:', e)
        }
      })()
    }

    // 9. Return immediately
    return NextResponse.json({
      success: true,
      reportId,
      message: 'Report generation started. You\'ll receive your PDF by email shortly.',
    })

  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

// ============================================================================
// Build n8n-specific payload per report type
// ============================================================================

// Extract readable company name from a URL (e.g. "acme" from "https://acme.com")
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '').split('.')[0]
  } catch {
    return url
  }
}

function buildN8nPayload(
  reportType: ReportType,
  body: GenerateRequest,
  meta: { userEmail: string; userName: string; sessionId: string }
): Record<string, unknown> {
  const { userEmail, userName, sessionId } = meta

  // Analyzer reports — field names must match n8n Orchestrator Agent prompts
  if (reportType === 'h2h') {
    return {
      reportType: 'Head to Head',
      targetCompany: extractDomain(body.targetWebsite!),
      targetWebsite: body.targetWebsite,
      competitor1: body.competitor1 || extractDomain(body.competitor1Website!),
      competitor1Website: body.competitor1Website,
      userEmail,
      userName,
      sessionId,
    }
  }
  if (reportType === 't3c') {
    return {
      reportType: 'Top 3 Competitors',
      targetCompany: extractDomain(body.targetWebsite!),
      targetWebsite: body.targetWebsite,
      competitor1: body.competitor1 || extractDomain(body.competitor1Website!),
      competitor1Website: body.competitor1Website,
      competitor2: body.competitor2 || extractDomain(body.competitor2Website!),
      competitor2Website: body.competitor2Website,
      competitor3: body.competitor3 || extractDomain(body.competitor3Website!),
      competitor3Website: body.competitor3Website,
      userEmail,
      userName,
      sessionId,
    }
  }
  if (reportType === 'cp') {
    return {
      reportType: 'Competitive Position',
      targetCompany: extractDomain(body.targetWebsite!),
      targetWebsite: body.targetWebsite,
      userEmail,
      userName,
      sessionId,
    }
  }

  // SEO Auditor reports — all use url + company + optional keyword
  return {
    url: body.url,
    company: body.company,
    focus_keyword: body.focusKeyword,
    userEmail,
    userName,
    sessionId,
  }
}
