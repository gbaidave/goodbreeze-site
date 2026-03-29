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
  | 'business_presence_report'

export type Product = 'analyzer' | 'seo_auditor' | 'business_presence_report'

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
  seo_comprehensive: { product: 'seo_auditor', impulseAllowed: true,  usesMoz: true,  usesSerp: true  },
  // Business Presence Report
  business_presence_report: { product: 'business_presence_report', impulseAllowed: true, usesMoz: false, usesSerp: false },
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

  // Privileged roles bypass all limits (no deduction either)
  if (['tester', 'admin', 'superadmin', 'support'].includes(profile.role)) {
    return { allowed: true, deductFrom: 'subscription' }
  }

  // 2. Fetch active subscription
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan, status, credits_remaining, current_period_start, current_period_end')
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

  // 5. Subscription plans (starter / growth / pro) — check credits_remaining.
  //    credits_remaining is the single source of truth, managed by the webhook
  //    (provisioned on created, decremented on usage, reset on renewal,
  //    adjusted on upgrade/downgrade).
  //    If credits_remaining > 0, allow via subscription.
  //    If at zero, fall through to credit pack check below.
  if (plan === 'starter' || plan === 'growth' || plan === 'pro') {
    if ((sub?.credits_remaining ?? 0) > 0) {
      return { allowed: true, deductFrom: 'subscription' }
    }
    // No subscription credits left — fall through to credit pack check below
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
  const supabase = getServiceClient()

  if (deductFrom === 'subscription') {
    // Decrement credits_remaining on the subscription row.
    // Managed by decrement_subscription_credits() DB function (GREATEST(0, n-1) floor).
    await supabase.rpc('decrement_subscription_credits', { p_user_id: userId })
  }

  if (deductFrom === 'credits' && creditRowId) {
    // Decrement the specific credit pack row.
    await supabase.rpc('decrement_credit', { p_credit_id: creditRowId })
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

  // Expiry: flat 7 days for all reports (GDrive copy is permanent; dashboard link expires)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

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

// ============================================================================
// Plan allowance checks (for report types with per-plan monthly limits)
// Used by business_presence_report and future report types with plan allowances.
// ============================================================================

export async function checkPlanAllowance(
  userId: string,
  reportType: ReportType,
  plan: Plan
): Promise<{ allowed: boolean; reason?: string; usedMonthly: number; monthlyLimit: number; usedWeekly: number; weeklyLimit: number | null }> {
  const supabase = getServiceClient()
  const usageMonth = new Date().toISOString().slice(0, 7) // 'YYYY-MM'

  // 1. Look up plan allowance for this report type
  const { data: allowance } = await supabase
    .from('plan_report_allowances')
    .select('monthly_limit, weekly_limit, is_additive')
    .eq('plan', plan)
    .eq('report_type', reportType)
    .single()

  // No allowance row = no plan-based allowance for this report type
  if (!allowance) {
    return { allowed: false, reason: 'No plan allowance for this report type.', usedMonthly: 0, monthlyLimit: 0, usedWeekly: 0, weeklyLimit: null }
  }

  // 2. Get current monthly usage
  const { data: usage } = await supabase
    .from('report_type_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('report_type', reportType)
    .eq('usage_month', usageMonth)
    .single()

  const usedMonthly = usage?.count ?? 0

  // 3. Check monthly limit
  if (usedMonthly >= allowance.monthly_limit) {
    return {
      allowed: false,
      reason: `You've used all ${allowance.monthly_limit} of your monthly business presence reports. Purchase credits or wait until next month.`,
      usedMonthly,
      monthlyLimit: allowance.monthly_limit,
      usedWeekly: 0,
      weeklyLimit: allowance.weekly_limit,
    }
  }

  // 4. Check weekly rate limit (if configured)
  if (allowance.weekly_limit) {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count: weeklyCount } = await supabase
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('report_type', reportType)
      .gte('created_at', oneWeekAgo)
      .not('status', 'in', '("failed","failed_site_blocked")')

    const usedWeekly = weeklyCount ?? 0
    if (usedWeekly >= allowance.weekly_limit) {
      return {
        allowed: false,
        reason: `You can run ${allowance.weekly_limit} business presence report${allowance.weekly_limit > 1 ? 's' : ''} per week. Try again in a few days.`,
        usedMonthly,
        monthlyLimit: allowance.monthly_limit,
        usedWeekly,
        weeklyLimit: allowance.weekly_limit,
      }
    }
  }

  return {
    allowed: true,
    usedMonthly,
    monthlyLimit: allowance.monthly_limit,
    usedWeekly: 0,
    weeklyLimit: allowance.weekly_limit,
  }
}

// Record plan allowance usage (atomic increment via RPC)
export async function recordPlanAllowanceUsage(
  userId: string,
  reportType: ReportType
): Promise<void> {
  const supabase = getServiceClient()
  const usageMonth = new Date().toISOString().slice(0, 7)

  const { error } = await supabase.rpc('increment_report_type_usage', {
    p_user_id: userId,
    p_report_type: reportType,
    p_usage_month: usageMonth,
  })

  if (error) {
    console.error('Failed to record plan allowance usage:', error)
  }
}
