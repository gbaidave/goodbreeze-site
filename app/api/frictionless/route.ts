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
import { isDisposableEmail } from '@/lib/disposable-email'
import { isValidPhone } from '@/lib/phone'

// ============================================================================
// n8n webhook URLs (same as /api/reports/generate — internal only)
// N8N_WEBHOOK_BASE_URL: set to https://n8n.goodbreeze.ai on Vercel (staging/prod)
//                       leave unset on VPS to use localhost:5678 (bypasses Cloudflare)
// ============================================================================

const N8N_BASE = process.env.N8N_WEBHOOK_BASE_URL ?? 'http://localhost:5678'

const N8N_WEBHOOKS: Record<string, string> = {
  h2h:               `${N8N_BASE}/webhook/bfa6c879-77ea-475c-b279-09f6fdbfdfde`,
  t3c:               `${N8N_BASE}/webhook/bfa6c879-77ea-475c-b279-09f6fdbfdfde`,
  cp:                `${N8N_BASE}/webhook/bfa6c879-77ea-475c-b279-09f6fdbfdfde`,
  ai_seo:            `${N8N_BASE}/webhook/ai-seo-optimizer-pdf`,
  landing_page:      `${N8N_BASE}/webhook/landing-page-optimizer-pdf`,
  keyword_research:  `${N8N_BASE}/webhook/keyword-research-pdf`,
  seo_audit:         `${N8N_BASE}/webhook/seo-audit-v4-pdf`,
  seo_comprehensive: `${N8N_BASE}/webhook/seo-comprehensive-pdf`,
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

function normalizeUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return trimmed
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return 'https://' + trimmed
}

function validateInput(body: FrictionlessRequest): string | null {
  if (!body.email || !isValidEmail(body.email)) return 'Valid email address is required'
  if (isDisposableEmail(body.email)) return 'Please use a real email address to receive your report.'
  if (!body.name || body.name.trim().length < 1) return 'Name is required'
  if (body.name.length > MAX_STR_LEN) return 'Name is too long'
  if (body.phone && !isValidPhone(body.phone)) return 'Enter a valid phone number'

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

    // 1. Normalize URL fields (prepend https:// if missing)
    if (body.targetWebsite)       body.targetWebsite       = normalizeUrl(body.targetWebsite)
    if (body.competitor1Website)  body.competitor1Website  = normalizeUrl(body.competitor1Website)
    if (body.url)                 body.url                 = normalizeUrl(body.url)

    // 2. Validate input
    const validationError = validateInput(body)
    if (validationError) {
      return NextResponse.json(
        { error: validationError, code: 'INVALID_INPUT' },
        { status: 400 }
      )
    }

    const email = body.email.toLowerCase().trim()
    const name = body.name.trim()
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || request.headers.get('x-real-ip')
            || null
    const supabase = createServiceClient()

    // 2. IP rate limit: max 3 frictionless accounts per IP per 24 hours
    if (ip) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { count: ipCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('signup_ip', ip)
        .gte('created_at', oneDayAgo)

      if (ipCount !== null && ipCount >= 3) {
        return NextResponse.json(
          { error: 'Too many accounts created from this device. Please sign in or try again later.', code: 'IP_RATE_LIMITED' },
          { status: 429 }
        )
      }
    }

    // 3. Find or create user
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    let userId: string
    let isNewUser: boolean

    // Check if the profile's auth account still exists (guard against re-registration after deletion)
    let liveProfile = existingProfile
    if (existingProfile) {
      const { data: authLookup } = await supabase.auth.admin.getUserById(existingProfile.id)
      if (!authLookup?.user) {
        // Stale profile: auth account was deleted — remove it so the user can re-register cleanly
        await supabase.from('profiles').delete().eq('id', existingProfile.id)
        liveProfile = null
      }
    }

    if (liveProfile) {
      // Any existing user should sign in — frictionless is for new users only
      return NextResponse.json(
        {
          error: 'You already have a Good Breeze AI account. Sign in to run more reports.',
          code: 'ACCOUNT_EXISTS',
          signInUrl: '/login',
        },
        { status: 409 }
      )
    } else {
      // New user: create with email already confirmed (no confirmation email sent)
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { name },
      })

      let authUser = newUser?.user ?? null

      if (createError || !authUser) {
        if (createError?.status === 422) {
          // 422 = Supabase still holds this email in auth.users after a dashboard deletion
          // (soft-delete left a ghost row). Force-purge it and retry once.
          const { data: forceDeleted } = await supabase.rpc('force_delete_auth_user_by_email', {
            p_email: email,
          })

          if (forceDeleted) {
            const { data: retryUser, error: retryError } = await supabase.auth.admin.createUser({
              email,
              email_confirm: true,
              user_metadata: { name },
            })

            if (retryError || !retryUser?.user) {
              console.error('Failed to create user after force-delete:', retryError)
              return NextResponse.json(
                { error: 'Failed to create account. Please try again.', code: 'CREATE_FAILED' },
                { status: 500 }
              )
            }

            authUser = retryUser.user
          } else {
            // force_delete returned false = no stale row found. Genuine live account.
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
          console.error('Failed to create frictionless user:', createError)
          return NextResponse.json(
            { error: 'Failed to create account. Please try again.', code: 'CREATE_FAILED' },
            { status: 500 }
          )
        }
      }

      userId = authUser!.id
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

    // 4a. Find the seeded credit row for this new user (created by handle_new_user trigger)
    const { data: creditRows } = await supabase
      .from('credits')
      .select('id')
      .eq('user_id', userId)
      .gt('balance', 0)
      .order('purchased_at', { ascending: true })
      .limit(1)
    const frictionlessCreditId = creditRows?.[0]?.id

    const reportId = await createReportRow(userId, body.reportType, inputData, 'free', {
      usageType: 'credits',
      creditRowId: frictionlessCreditId,
    })

    // 5. Deduct the credit and update profile
    if (frictionlessCreditId) {
      await supabase.rpc('decrement_credit', { p_credit_id: frictionlessCreditId })
    }

    const updates: Record<string, unknown> = {}
    if (body.phone) updates.phone = body.phone
    if (isNewUser && ip) updates.signup_ip = ip

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
      options: { redirectTo: `${siteUrl}/auth/callback?returnUrl=/dashboard` },
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
      subject: `Your Good Breeze AI account is ready`,
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
