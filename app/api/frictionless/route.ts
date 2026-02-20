/**
 * POST /api/frictionless
 *
 * Creates an account (if new) and triggers a free report for unauthenticated visitors.
 * Sends a magic link email so the user can access their account and results.
 *
 * Only report types where freeAllowed=true in entitlement.ts are accepted.
 * Rate limited: max 3 reports per email per hour.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service-client'
import { createReportRow, type ReportType } from '@/lib/entitlement'
import { sendMagicLinkSetupEmail } from '@/lib/email'

// ============================================================================
// n8n webhook URLs (same as /api/reports/generate — internal only)
// ============================================================================

const N8N_WEBHOOKS: Record<string, string> = {
  h2h:               'http://localhost:5678/webhook/bfa6c879-77ea-475c-b279-09f6fdbfdfde',
  t3c:               'http://localhost:5678/webhook/bfa6c879-77ea-475c-b279-09f6fdbfdfde',
  cp:                'http://localhost:5678/webhook/bfa6c879-77ea-475c-b279-09f6fdbfdfde',
  ai_seo:            'http://localhost:5678/webhook/ai-seo-optimizer-pdf',
  landing_page:      'http://localhost:5678/webhook/landing-page-optimizer-pdf',
  keyword_research:  'http://localhost:5678/webhook/keyword-research-pdf',
  seo_audit:         'http://localhost:5678/webhook/seo-audit-pdf',
  seo_comprehensive: 'http://localhost:5678/webhook/seo-comprehensive-pdf',
  multi_page:        'http://localhost:5678/webhook/seo-audit-multi-page',
}

const REPORT_TYPE_LABELS: Record<string, string> = {
  h2h:              'Head-to-Head Analyzer',
  t3c:              'Top 3 Competitors',
  cp:               'Competitive Position',
  ai_seo:           'AI SEO Optimizer',
  landing_page:     'Landing Page Optimizer',
  keyword_research: 'Keyword Research',
  seo_audit:        'SEO Audit',
  seo_comprehensive:'SEO Comprehensive',
  multi_page:       'Multi-Page Audit',
}

// Types where freeAllowed = true (must match entitlement.ts REPORT_META)
const FREE_ALLOWED_TYPES: ReportType[] = ['h2h', 'ai_seo']

// ============================================================================
// Request shape
// ============================================================================

interface FrictionlessRequest {
  email: string
  name: string
  phone?: string
  reportType: ReportType
  // Analyzer
  targetWebsite?: string
  competitor1?: string
  competitor1Website?: string
  // SEO
  url?: string
  company?: string
  focusKeyword?: string
}

// ============================================================================
// Validation
// ============================================================================

const MAX_URL_LEN = 500
const MAX_STR_LEN = 200

function isValidHttpUrl(str: string): boolean {
  try {
    const u = new URL(str)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateInput(body: FrictionlessRequest): string | null {
  if (!body.email || !isValidEmail(body.email)) return 'Valid email address is required'
  if (!body.name || body.name.trim().length < 1) return 'Name is required'
  if (body.name.length > MAX_STR_LEN) return 'Name is too long'

  if (!body.reportType || !FREE_ALLOWED_TYPES.includes(body.reportType)) {
    return `This tool is not available for guest submissions`
  }

  for (const field of ['url', 'targetWebsite', 'competitor1Website'] as const) {
    const val = body[field]
    if (val !== undefined && val !== '') {
      if (val.length > MAX_URL_LEN || !isValidHttpUrl(val))
        return `Invalid URL in field: ${field}`
    }
  }

  for (const field of ['company', 'focusKeyword', 'competitor1'] as const) {
    const val = body[field]
    if (val && val.length > MAX_STR_LEN) return `${field} is too long`
  }

  if (body.reportType === 'h2h') {
    if (!body.targetWebsite || !isValidHttpUrl(body.targetWebsite))
      return 'Valid target website URL is required'
    if (!body.competitor1Website || !isValidHttpUrl(body.competitor1Website))
      return 'Valid competitor website URL is required'
  } else {
    if (!body.url || !isValidHttpUrl(body.url))
      return 'Valid website URL is required'
  }

  return null
}

// ============================================================================
// n8n payload builder
// ============================================================================

function buildN8nPayload(
  reportType: ReportType,
  body: FrictionlessRequest,
  meta: { userEmail: string; userName: string; sessionId: string }
): Record<string, unknown> {
  const { userEmail, userName, sessionId } = meta

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

  return {
    url: body.url,
    company: body.company,
    focus_keyword: body.focusKeyword,
    userEmail,
    userName,
    sessionId,
  }
}

// ============================================================================
// Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body: FrictionlessRequest = await request.json()

    // 1. Validate input
    const validationError = validateInput(body)
    if (validationError) {
      return NextResponse.json(
        { error: validationError, code: 'INVALID_INPUT' },
        { status: 400 }
      )
    }

    const email = body.email.toLowerCase().trim()
    const name = body.name.trim()
    const supabase = createServiceClient()

    // 2. Find or create user
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, free_reports_used')
      .eq('email', email)
      .single()

    let userId: string
    let isNewUser: boolean

    if (existingProfile) {
      userId = existingProfile.id
      isNewUser = false

      // Check if they've already used this frictionless report type.
      // h2h is tracked under "analyzer" key (shared with authenticated free tier — prevents double-dipping).
      // ai_seo is tracked under "ai_seo_frictionless" key (separate from the authenticated brand_visibility slot).
      const freeUsed = (existingProfile.free_reports_used ?? {}) as Record<string, string | boolean>
      const frictionlessKey = body.reportType === 'h2h' ? 'analyzer' : 'ai_seo_frictionless'

      if (freeUsed[frictionlessKey]) {
        return NextResponse.json(
          {
            error: 'You already have a Good Breeze AI account. Sign in to run more reports.',
            code: 'ACCOUNT_EXISTS',
            signInUrl: '/login',
          },
          { status: 409 }
        )
      }
    } else {
      // New user: create with email already confirmed (no confirmation email sent)
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { name },
      })

      if (createError || !newUser.user) {
        console.error('Failed to create frictionless user:', createError)
        return NextResponse.json(
          { error: 'Failed to create account. Please try again.', code: 'CREATE_FAILED' },
          { status: 500 }
        )
      }

      userId = newUser.user.id
      isNewUser = true

      // Update profile name (handle_new_user trigger creates the row; set name from metadata)
      await supabase
        .from('profiles')
        .update({ name })
        .eq('id', userId)
    }

    // 3. Rate limit: max 3 frictionless reports per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count: recentCount } = await supabase
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', oneHourAgo)

    if (recentCount !== null && recentCount >= 3) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a while before trying again.', code: 'RATE_LIMITED' },
        { status: 429 }
      )
    }

    // 4. Create report row
    const inputData: Record<string, unknown> = {
      targetWebsite: body.targetWebsite,
      competitor1: body.competitor1,
      competitor1Website: body.competitor1Website,
      url: body.url,
      company: body.company,
      focusKeyword: body.focusKeyword,
      userEmail: email,
      userName: name,
    }
    // Remove undefined fields
    Object.keys(inputData).forEach((k) => inputData[k] === undefined && delete inputData[k])

    const reportId = await createReportRow(userId, body.reportType, inputData, 'free')

    // 5. Mark free report as used on profile.
    // h2h: stored as { "analyzer": "h2h" } — shared key with authenticated free tier (prevents double-dipping).
    // ai_seo: stored as { "ai_seo_frictionless": true } — separate from the authenticated brand_visibility free slot.
    const freeUsed = (existingProfile?.free_reports_used ?? {}) as Record<string, string | boolean>
    const freeUsedUpdate =
      body.reportType === 'h2h'
        ? { ...freeUsed, analyzer: 'h2h' }
        : { ...freeUsed, ai_seo_frictionless: true }
    const updates: Record<string, unknown> = { free_reports_used: freeUsedUpdate }
    if (body.phone) updates.phone = body.phone

    await supabase.from('profiles').update(updates).eq('id', userId)

    // 6. Fire n8n webhook (async — fire and forget)
    const n8nPayload = buildN8nPayload(body.reportType, body, {
      userEmail: email,
      userName: name,
      sessionId: reportId,
    })

    fetch(N8N_WEBHOOKS[body.reportType], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(n8nPayload),
    }).catch((err) => {
      console.error(`n8n frictionless webhook failed for report ${reportId}:`, err)
    })

    // 7. Generate magic link so user can access their account
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://goodbreeze.ai'
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: `${siteUrl}/dashboard` },
    })

    const magicLink = linkData?.properties?.action_link

    if (linkError || !magicLink) {
      console.error('Failed to generate magic link for frictionless user:', linkError)
    }

    // 8. Send magic link email (best-effort — report is already queued)
    let emailStatus: 'sent' | 'failed' = 'failed'
    let emailError: string | null = linkError?.message ?? 'No magic link generated'

    if (magicLink) {
      try {
        await sendMagicLinkSetupEmail(
          email,
          magicLink,
          REPORT_TYPE_LABELS[body.reportType] ?? body.reportType
        )
        emailStatus = 'sent'
        emailError = null
      } catch (emailErr: any) {
        console.error('Failed to send magic link email:', emailErr)
        emailError = emailErr?.message ?? 'Email send failed'
      }
    }

    // 9. Log email send attempt
    await supabase.from('email_logs').insert({
      user_id: userId,
      to_email: email,
      type: 'magic_link',
      subject: `Your ${REPORT_TYPE_LABELS[body.reportType] ?? body.reportType} report is running`,
      status: emailStatus,
      error: emailError,
    })

    return NextResponse.json({
      success: true,
      isNewUser,
      message: 'Report started. Check your inbox for a link to access your account and results.',
    })

  } catch (error) {
    console.error('Frictionless route error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
