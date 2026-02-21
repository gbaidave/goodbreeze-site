/**
 * Entitlement checks for report generation.
 *
 * Call checkEntitlement() in API routes BEFORE triggering n8n webhooks.
 * Returns allowed=true (with deduction instructions) or allowed=false (with reason).
 *
 * Install: npm install @supabase/ssr
 * Requires env: SUPABASE_SERVICE_ROLE_KEY (server-only, never NEXT_PUBLIC_)
 */

import { createClient } from '@supabase/supabase-js'

// ============================================================================
// Types
// ============================================================================

export type ReportType =
  | 'h2h' | 't3c' | 'cp'
  | 'ai_seo' | 'landing_page' | 'keyword_research'
  | 'seo_audit' | 'seo_comprehensive'

export type Product = 'analyzer' | 'seo_auditor'

export type Plan = 'free' | 'impulse' | 'starter' | 'growth' | 'pro' | 'custom'

// System keys used in free_reports_used JSONB
// e.g. { "analyzer": "h2h", "brand_visibility": "seo_audit" }
export type FreeSystem = 'analyzer' | 'brand_visibility'

export interface EntitlementResult {
  allowed: boolean
  reason?: string          // shown to user if not allowed
  deductFrom?: 'subscription' | 'credits'
  creditRowId?: string     // which credits row to decrement
  upgradePrompt?: 'impulse' | 'starter'  // what to show in paywall
  freeSystemConsumed?: FreeSystem  // if set, mark this system's free slot as used
}

// ============================================================================
// Report metadata: which product each type belongs to, and free-tier eligibility
//
// freeSystem: which system's free slot this consumes when used on a free plan.
//   'analyzer'       → user gets ONE free (h2h or t3c) — stored in free_reports_used.analyzer
//   'brand_visibility' → user gets ONE free (seo_audit or landing_page) — stored in free_reports_used.brand_visibility
//   null             → never free for authenticated users (may be available via frictionless)
//
// Note: ai_seo is free via frictionless (guest flow) only — not the authenticated free tier.
// ============================================================================

const REPORT_META: Record<ReportType, {
  product: Product
  freeSystem: FreeSystem | null
  impulseAllowed: boolean
  usesMoz: boolean
  usesSerp: boolean
}> = {
  // Analyzer
  h2h:               { product: 'analyzer',    freeSystem: 'analyzer',         impulseAllowed: true,  usesMoz: false, usesSerp: false },
  t3c:               { product: 'analyzer',    freeSystem: 'analyzer',         impulseAllowed: true,  usesMoz: false, usesSerp: false },
  cp:                { product: 'analyzer',    freeSystem: null,               impulseAllowed: true,  usesMoz: false, usesSerp: false },
  // SEO Auditor — only seo_audit + landing_page are free for authenticated users
  ai_seo:            { product: 'seo_auditor', freeSystem: null,               impulseAllowed: true,  usesMoz: false, usesSerp: false },
  landing_page:      { product: 'seo_auditor', freeSystem: 'brand_visibility', impulseAllowed: true,  usesMoz: false, usesSerp: false },
  keyword_research:  { product: 'seo_auditor', freeSystem: null,               impulseAllowed: true,  usesMoz: false, usesSerp: true  },
  seo_audit:         { product: 'seo_auditor', freeSystem: 'brand_visibility', impulseAllowed: true,  usesMoz: true,  usesSerp: true  },
  seo_comprehensive: { product: 'seo_auditor', freeSystem: null,               impulseAllowed: false, usesMoz: true,  usesSerp: true  },
}

// Human-readable system name for error messages
const FREE_SYSTEM_LABELS: Record<FreeSystem, string> = {
  analyzer:         'Competitive Analyzer',
  brand_visibility: 'Brand Visibility',
}

// Per-plan monthly report caps (all report types combined).
// Free/impulse: 1 per purchase event (not monthly).
const PLAN_MONTHLY_CAPS: Record<string, number> = {
  starter: 25,
  growth:  40,
  pro:     50,
}

// ============================================================================
// Service role Supabase client (bypasses RLS)
// ============================================================================

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing Supabase service role configuration')
  }
  return createClient(url, key, {
    auth: { persistSession: false }
  })
}

// ============================================================================
// Main entitlement check
// ============================================================================

export async function checkEntitlement(
  userId: string,
  reportType: ReportType
): Promise<EntitlementResult> {
  const meta = REPORT_META[reportType]
  const supabase = getServiceClient()

  // 1. Fetch profile: role, plan override, and free_reports_used JSONB
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, plan_override_type, plan_override_until, free_reports_used')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    return { allowed: false, reason: 'Account not found. Please sign in again.' }
  }

  // Testers and admins bypass all limits (no deduction either)
  if (profile.role === 'tester' || profile.role === 'admin') {
    return { allowed: true, deductFrom: 'subscription' }
  }

  // 2. Fetch active subscription
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan, status, current_period_start, current_period_end')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const rawPlan = (sub?.plan ?? 'free') as Plan

  // 3. Check for active plan override (admin-granted temporary plan)
  //    plan_override_until = null means indefinite
  const overrideActive =
    profile.plan_override_type &&
    (!profile.plan_override_until || new Date(profile.plan_override_until) > new Date())

  const plan: Plan = overrideActive ? (profile.plan_override_type as Plan) : rawPlan

  // 4. Custom plan — no limits
  if (plan === 'custom') {
    return { allowed: true, deductFrom: 'subscription' }
  }

  // 5. Subscription plans (starter / growth / pro) — check combined monthly cap
  if (plan === 'starter' || plan === 'growth' || plan === 'pro') {
    const cap = PLAN_MONTHLY_CAPS[plan]
    const now = new Date()
    const periodStart = sub?.current_period_start
      ? new Date(sub.current_period_start).toISOString().split('T')[0]
      : new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

    const { data: usageRow } = await supabase
      .from('usage')
      .select('analyzer_reports_used, seo_reports_used')
      .eq('user_id', userId)
      .eq('period_start', periodStart)
      .single()

    const totalUsed = (usageRow?.analyzer_reports_used ?? 0) + (usageRow?.seo_reports_used ?? 0)

    if (totalUsed >= cap) {
      return {
        allowed: false,
        reason: `You've used all ${cap} reports included in your ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan this month. Upgrade your plan or wait until your next billing period.`,
        upgradePrompt: 'starter',
      }
    }

    return { allowed: true, deductFrom: 'subscription' }
  }

  // 6. Free plan — check per-system free slot using free_reports_used JSONB
  if (plan === 'free') {
    const freeSystem = meta.freeSystem

    if (!freeSystem) {
      // This report type is never free for authenticated users
      return {
        allowed: false,
        reason: `This report type requires a paid plan or credit pack.`,
        upgradePrompt: 'impulse',
      }
    }

    // Check if user has already consumed their free slot for this system
    const freeUsed = (profile.free_reports_used ?? {}) as Record<string, string>

    if (freeUsed[freeSystem]) {
      const systemLabel = FREE_SYSTEM_LABELS[freeSystem]
      return {
        allowed: false,
        reason: `You've already used your free ${systemLabel} report. Get a credit pack or upgrade to a monthly plan for more.`,
        upgradePrompt: 'impulse',
      }
    }

    return {
      allowed: true,
      deductFrom: 'subscription',
      freeSystemConsumed: freeSystem,
    }
  }

  // 7. Impulse plan (credit pack) — check credits
  // Find oldest non-expired credit row with balance > 0, matching product (or universal)
  const { data: creditRows } = await supabase
    .from('credits')
    .select('id, balance, expires_at, product')
    .eq('user_id', userId)
    .gt('balance', 0)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .or(`product.is.null,product.eq.${meta.product}`)
    .order('purchased_at', { ascending: true })
    .limit(1)

  const creditRow = creditRows?.[0]

  if (!creditRow) {
    return {
      allowed: false,
      reason: `You have no remaining reports. Get a credit pack or upgrade to a monthly plan.`,
      upgradePrompt: meta.impulseAllowed ? 'impulse' : 'starter',
    }
  }

  // Check if this report type is allowed on impulse (some require starter)
  if (!meta.impulseAllowed) {
    return {
      allowed: false,
      reason: `This report type requires a Starter subscription.`,
      upgradePrompt: 'starter',
    }
  }

  return {
    allowed: true,
    deductFrom: 'credits',
    creditRowId: creditRow.id,
  }
}

// ============================================================================
// Deduct usage after successful report generation
// ============================================================================

export async function recordUsage(
  userId: string,
  reportType: ReportType,
  deductFrom: 'subscription' | 'credits',
  creditRowId?: string,
  freeSystemConsumed?: FreeSystem
): Promise<void> {
  const meta = REPORT_META[reportType]
  const supabase = getServiceClient()

  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString().split('T')[0]

  // Increment usage counters (used for starter limits)
  await supabase.rpc('increment_usage', {
    p_user_id: userId,
    p_period_start: periodStart,
    p_analyzer_delta: meta.product === 'analyzer' ? 1 : 0,
    p_seo_delta: meta.product === 'seo_auditor' ? 1 : 0,
  })

  // Decrement credit balance (impulse pack)
  if (deductFrom === 'credits' && creditRowId) {
    await supabase.rpc('decrement_credit', {
      p_credit_id: creditRowId,
    })
  }

  // Mark free system slot as consumed (free plan only)
  if (freeSystemConsumed) {
    const { data: prof } = await supabase
      .from('profiles')
      .select('free_reports_used')
      .eq('id', userId)
      .single()

    const current = (prof?.free_reports_used ?? {}) as Record<string, string>
    await supabase
      .from('profiles')
      .update({ free_reports_used: { ...current, [freeSystemConsumed]: reportType } })
      .eq('id', userId)
  }
}

// ============================================================================
// Helper: create report row (call before triggering n8n)
// ============================================================================

export async function createReportRow(
  userId: string,
  reportType: ReportType,
  inputData: Record<string, unknown>,
  plan: Plan
): Promise<string> {
  const meta = REPORT_META[reportType]
  const supabase = getServiceClient()

  // Expiry: 30 days for free/impulse, 12 months for paid subscriptions
  const expiryDays = (plan === 'starter' || plan === 'growth' || plan === 'pro' || plan === 'custom') ? 365 : 30
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiryDays)

  const { data, error } = await supabase
    .from('reports')
    .insert({
      user_id: userId,
      report_type: reportType,
      product: meta.product,
      status: 'pending',
      input_data: inputData,
      expires_at: expiresAt.toISOString(),
    })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error(`Failed to create report row: ${error?.message}`)
  }

  return data.id
}
