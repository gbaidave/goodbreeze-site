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

export interface EntitlementResult {
  allowed: boolean
  reason?: string          // shown to user if not allowed
  deductFrom?: 'subscription' | 'credits'
  creditRowId?: string     // which credits row to decrement
  upgradePrompt?: 'impulse' | 'starter'  // what to show in paywall
}

// ============================================================================
// Report metadata: which product each type belongs to
// ============================================================================

const REPORT_META: Record<ReportType, {
  product: Product
  impulseAllowed: boolean
  usesMoz: boolean
  usesSerp: boolean
}> = {
  // Analyzer
  h2h:               { product: 'analyzer',    impulseAllowed: true,  usesMoz: false, usesSerp: false },
  t3c:               { product: 'analyzer',    impulseAllowed: true,  usesMoz: false, usesSerp: false },
  cp:                { product: 'analyzer',    impulseAllowed: true,  usesMoz: false, usesSerp: false },
  // SEO Auditor
  ai_seo:            { product: 'seo_auditor', impulseAllowed: true,  usesMoz: false, usesSerp: false },
  landing_page:      { product: 'seo_auditor', impulseAllowed: true,  usesMoz: false, usesSerp: false },
  keyword_research:  { product: 'seo_auditor', impulseAllowed: true,  usesMoz: false, usesSerp: true  },
  seo_audit:         { product: 'seo_auditor', impulseAllowed: true,  usesMoz: true,  usesSerp: true  },
  seo_comprehensive: { product: 'seo_auditor', impulseAllowed: false, usesMoz: true,  usesSerp: true  },
}

// Per-plan monthly report caps (all report types combined).
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

  // 1. Fetch profile: role and plan override
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, plan_override_type, plan_override_until')
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

  // 5. Subscription plans (starter / growth / pro) — check combined monthly cap.
  //    If within cap, allow via subscription. If over cap, fall through to credit check.
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

    if (totalUsed < cap) {
      return { allowed: true, deductFrom: 'subscription' }
    }
    // Over monthly cap — fall through to credit check below
  }

  // 6. Credits — universal fallback for all non-subscription users.
  //    Reached by: free plan, impulse plan, or paid plan over its monthly cap.
  //    All users receive 1 credit on signup; additional credits come from
  //    credit packs, referrals, testimonials, or admin grants.

  // Gate: some report types require at least a Starter subscription (not credit-eligible)
  if (!meta.impulseAllowed) {
    return {
      allowed: false,
      reason: `This report type requires a Starter subscription.`,
      upgradePrompt: 'starter',
    }
  }

  // Find the oldest non-expired credit row with balance > 0, matching product or universal
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
      reason: `You have no remaining credits. Get a credit pack or upgrade to a monthly plan.`,
      upgradePrompt: 'impulse',
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
  creditRowId?: string
): Promise<void> {
  const meta = REPORT_META[reportType]
  const supabase = getServiceClient()

  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString().split('T')[0]

  // Increment usage counters (for starter plan monthly cap tracking)
  await supabase.rpc('increment_usage', {
    p_user_id: userId,
    p_period_start: periodStart,
    p_analyzer_delta: meta.product === 'analyzer' ? 1 : 0,
    p_seo_delta: meta.product === 'seo_auditor' ? 1 : 0,
  })

  // Decrement credit balance
  if (deductFrom === 'credits' && creditRowId) {
    await supabase.rpc('decrement_credit', {
      p_credit_id: creditRowId,
    })
  }
}

// ============================================================================
// Helper: create report row (call before triggering n8n)
// ============================================================================

export async function createReportRow(
  userId: string,
  reportType: ReportType,
  inputData: Record<string, unknown>,
  plan: Plan,
  usageInfo?: {
    usageType: 'credits' | 'subscription' | 'admin'
    creditRowId?: string
  }
): Promise<string> {
  const meta = REPORT_META[reportType]
  const supabase = getServiceClient()

  // Expiry: 30 days for free/credit users, 12 months for paid subscriptions
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
      ...(usageInfo && {
        usage_type: usageInfo.usageType,
        credit_row_id: usageInfo.creditRowId ?? null,
      }),
    })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error(`Failed to create report row: ${error?.message}`)
  }

  return data.id
}
