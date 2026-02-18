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

// ============================================================================
// n8n webhook URLs (internal — bypasses Cloudflare 100s limit)
// ============================================================================

const N8N_WEBHOOKS: Record<ReportType, string> = {
  // Analyzer
  h2h:               'http://localhost:5678/webhook/bfa6c879-77ea-475c-b279-09f6fdbfdfde',
  t3c:               'http://localhost:5678/webhook/bfa6c879-77ea-475c-b279-09f6fdbfdfde',
  cp:                'http://localhost:5678/webhook/bfa6c879-77ea-475c-b279-09f6fdbfdfde',
  // SEO Auditor PDFs
  ai_seo:            'http://localhost:5678/webhook/ai-seo-optimizer-pdf',
  landing_page:      'http://localhost:5678/webhook/landing-page-optimizer-pdf',
  keyword_research:  'http://localhost:5678/webhook/keyword-research-pdf',
  seo_audit:         'http://localhost:5678/webhook/seo-audit-pdf',
  seo_comprehensive: 'http://localhost:5678/webhook/seo-comprehensive-pdf',
  multi_page:        'http://localhost:5678/webhook/seo-audit-multi-page',
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

    // 2. Parse request
    const body: GenerateRequest = await request.json()
    const { reportType } = body

    if (!reportType || !N8N_WEBHOOKS[reportType]) {
      return NextResponse.json(
        { error: 'Invalid report type', code: 'INVALID_REPORT_TYPE' },
        { status: 400 }
      )
    }

    // 3. Check entitlement
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

    // 4. Get user profile for email/name defaults
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, email, subscriptions(plan)')
      .eq('id', user.id)
      .single()

    const userEmail = body.userEmail || profile?.email || user.email!
    const userName = body.userName || profile?.name || userEmail.split('@')[0]
    const plan = (profile as any)?.subscriptions?.[0]?.plan ?? 'free'

    // 5. Create report row in DB
    const inputData = { ...body, userEmail, userName }
    delete (inputData as any).reportType

    const reportId = await createReportRow(user.id, reportType, inputData, plan)

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

    // 8. Record usage (optimistic — before n8n confirms success)
    await recordUsage(user.id, reportType, entitlement.deductFrom!, entitlement.creditRowId)

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

function buildN8nPayload(
  reportType: ReportType,
  body: GenerateRequest,
  meta: { userEmail: string; userName: string; sessionId: string }
): Record<string, unknown> {
  const { userEmail, userName, sessionId } = meta

  // Analyzer reports
  if (reportType === 'h2h') {
    return {
      reportType: 'Head to Head',
      targetWebsite: body.targetWebsite,
      competitor1: body.competitor1,
      competitor1Website: body.competitor1Website,
      userEmail,
      userName,
      sessionId,
    }
  }
  if (reportType === 't3c') {
    return {
      reportType: 'Top 3 Competitors',
      targetWebsite: body.targetWebsite,
      competitor1: body.competitor1,
      competitor1Website: body.competitor1Website,
      competitor2: body.competitor2,
      competitor2Website: body.competitor2Website,
      competitor3: body.competitor3,
      competitor3Website: body.competitor3Website,
      userEmail,
      userName,
      sessionId,
    }
  }
  if (reportType === 'cp') {
    return {
      reportType: 'Competitive Position',
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
