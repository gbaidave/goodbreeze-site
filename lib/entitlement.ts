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
import { getReportCreditCost } from '@/lib/catalog'

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
  deductFrom?: 'subscription' | 'credits' | 'free_slot'
  creditRowId?: string     // which credits row to decrement
  creditAmount?: number    // how many credits to deduct (for variable-cost reports)
  freeSystem?: string      // which free_reports_used key was reserved
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
  acceptsAnyCredit?: boolean
  creditCost: number        // how many credits this report costs
  freeSlotSystem?: string   // if set, users get 1 free via free_reports_used JSONB
}> = {
  // Analyzer
  h2h:               { product: 'analyzer',    impulseAllowed: true,  usesMoz: false, usesSerp: false, creditCost: 1 },
  t3c:               { product: 'analyzer',    impulseAllowed: true,  usesMoz: false, usesSerp: false, creditCost: 1 },
  cp:                { product: 'analyzer',    impulseAllowed: true,  usesMoz: false, usesSerp: false, creditCost: 1 },
  // SEO Auditor
  ai_seo:            { product: 'seo_auditor', impulseAllowed: true,  usesMoz: false, usesSerp: false, creditCost: 1 },
  landing_page:      { product: 'seo_auditor', impulseAllowed: true,  usesMoz: false, usesSerp: false, creditCost: 1 },
  keyword_research:  { product: 'seo_auditor', impulseAllowed: true,  usesMoz: false, usesSerp: true,  creditCost: 1 },
  seo_audit:         { product: 'seo_auditor', impulseAllowed: true,  usesMoz: true,  usesSerp: true,  creditCost: 1 },
  seo_comprehensive: { product: 'seo_auditor', impulseAllowed: true,  usesMoz: true,  usesSerp: true,  creditCost: 1 },
  // Business Presence Report
  business_presence_report: { product: 'business_presence_report', impulseAllowed: true, usesMoz: false, usesSerp: false, acceptsAnyCredit: true, creditCost: 3, freeSlotSystem: 'business_presence_report' },
}

// Plan monthly credit caps are now read from the `products` catalog via
// getPlanCreditsPerPeriod(sku). The old PLAN_MONTHLY_CAPS constant is deleted
// (2026-04-16 catalog migration). Do NOT reintroduce hardcoded plan caps.

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

  // 6. Free slot check — one-time free report per account for eligible types.
  //    Uses profiles.free_reports_used JSONB + check_and_reserve_free_slot RPC.
  //    The RPC atomically reserves the slot (prevents race conditions).
  if (meta.freeSlotSystem) {
    const { data: freeSlotResult } = await supabase.rpc('check_and_reserve_free_slot', {
      p_user_id: userId,
      p_free_system: meta.freeSlotSystem,
      p_report_type: reportType,
    })
    // NULL = slot was available and is now reserved (success)
    // 'already_used' = slot was already taken
    if (freeSlotResult === null) {
      return { allowed: true, deductFrom: 'free_slot', freeSystem: meta.freeSlotSystem }
    }
  }

  // 7. Credits — fallback for all non-subscription users.
  //    Reached by: free plan, impulse plan, or paid plan over its monthly cap.
  //    Credits come from credit packs, referrals, testimonials, or admin grants.

  // Gate: some report types require at least a Starter subscription (not credit-eligible)
  if (!meta.impulseAllowed) {
    return {
      allowed: false,
      reason: `This report type requires a Starter subscription.`,
      upgradePrompt: 'starter',
    }
  }

  const creditCost = await getReportCreditCost(reportType)

  // Find the oldest non-expired credit row with balance >= creditCost
  let creditQuery = supabase
    .from('credits')
    .select('id, balance, expires_at, product')
    .eq('user_id', userId)
    .gte('balance', creditCost)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

  // acceptsAnyCredit: skip product filter (e.g. business_presence_report uses any credit type)
  if (!meta.acceptsAnyCredit) {
    creditQuery = creditQuery.or(`product.is.null,product.eq.${meta.product}`)
  }

  const { data: creditRows } = await creditQuery
    .order('purchased_at', { ascending: true })
    .limit(1)

  const creditRow = creditRows?.[0]

  if (!creditRow) {
    return {
      allowed: false,
      reason: `This report costs ${creditCost} credit${creditCost > 1 ? 's' : ''}. You don't have enough credits. Get a credit pack or upgrade to a monthly plan.`,
      upgradePrompt: 'impulse',
    }
  }

  return {
    allowed: true,
    deductFrom: 'credits',
    creditRowId: creditRow.id,
    creditAmount: creditCost,
  }
}

// ============================================================================
// BPR entitlement — dedicated flow for business_presence_report
//
// Consumption order (per locked rules, no deviations):
//   1. Free slot (1 per account, ever — profiles.free_reports_used)
//   2. Plan monthly allowance (plan_report_allowances.monthly_limit, tracked in report_type_usage)
//   3. Pack credits at catalog cost (typically 3)
//
// Never touches subscriptions.credits_remaining. That pool is for other report types.
// ============================================================================

export interface BprEntitlementResult extends EntitlementResult {
  usedPlanAllowance?: boolean
}

export async function checkBprEntitlement(
  userId: string,
  plan: Plan
): Promise<BprEntitlementResult> {
  const reportType: ReportType = 'business_presence_report'
  const meta = REPORT_META[reportType]
  const supabase = getServiceClient()

  // Privileged roles bypass everything (same behavior as other reports)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (profile && ['tester', 'admin', 'superadmin', 'support'].includes(profile.role)) {
    return { allowed: true, deductFrom: 'subscription' }
  }

  // Custom plan — no limits
  if (plan === 'custom') {
    return { allowed: true, deductFrom: 'subscription' }
  }

  // 1. Free slot (always check first, regardless of plan)
  if (meta.freeSlotSystem) {
    const { data: freeSlotResult } = await supabase.rpc('check_and_reserve_free_slot', {
      p_user_id: userId,
      p_free_system: meta.freeSlotSystem,
      p_report_type: reportType,
    })
    if (freeSlotResult === null) {
      return { allowed: true, deductFrom: 'free_slot', freeSystem: meta.freeSlotSystem }
    }
  }

  // 2. Plan allowance (only for paid plans)
  if (['starter', 'growth', 'pro'].includes(plan)) {
    const planCheck = await checkPlanAllowance(userId, reportType, plan)
    if (planCheck.allowed) {
      return { allowed: true, deductFrom: 'subscription', usedPlanAllowance: true }
    }
    // Plan allowance exhausted — fall through to credits
  }

  const creditCost = await getReportCreditCost(reportType)

  // 3. Subscription credits_remaining at catalog cost.
  //    Narrow additive branch (2026-04-16). When credits_remaining is enough to
  //    cover the BPR cost, consume from there before falling to pack credits.
  //    Other report types still use the checkEntitlement path and decrement by 1.
  //    TODO: remove when credits unified — see .workspace/PLAN-credits-unification.md
  if (['starter', 'growth', 'pro'].includes(plan)) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('credits_remaining')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (sub && (sub.credits_remaining ?? 0) >= creditCost) {
      return {
        allowed: true,
        deductFrom: 'subscription',
        creditAmount: creditCost,
      }
    }
  }

  // 4. Pack credits at catalog cost

  let creditQuery = supabase
    .from('credits')
    .select('id, balance, expires_at, product')
    .eq('user_id', userId)
    .gte('balance', creditCost)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

  if (!meta.acceptsAnyCredit) {
    creditQuery = creditQuery.or(`product.is.null,product.eq.${meta.product}`)
  }

  const { data: creditRows } = await creditQuery
    .order('purchased_at', { ascending: true })
    .limit(1)

  const creditRow = creditRows?.[0]

  if (!creditRow) {
    return {
      allowed: false,
      reason: `This report costs ${creditCost} credit${creditCost > 1 ? 's' : ''}. You don't have enough credits. Get a credit pack or upgrade to a monthly plan.`,
      upgradePrompt: 'impulse',
    }
  }

  return {
    allowed: true,
    deductFrom: 'credits',
    creditRowId: creditRow.id,
    creditAmount: creditCost,
  }
}

// ============================================================================
// Deduct usage after successful report generation
// ============================================================================

export async function recordUsage(
  userId: string,
  reportType: ReportType,
  deductFrom: 'subscription' | 'credits' | 'free_slot',
  creditRowId?: string,
  creditAmount?: number
): Promise<void> {
  const supabase = getServiceClient()

  if (deductFrom === 'subscription') {
    // BPR with creditAmount > 1 uses the variable-amount RPC (migration 063).
    // Every other report type falls through to the existing by-1 RPC unchanged.
    // TODO: collapse when credits unified — see .workspace/PLAN-credits-unification.md
    if (reportType === 'business_presence_report' && creditAmount && creditAmount > 1) {
      await supabase.rpc('decrement_subscription_credits_by', { p_user_id: userId, p_amount: creditAmount })
    } else {
      await supabase.rpc('decrement_subscription_credits', { p_user_id: userId })
    }
  }

  if (deductFrom === 'credits' && creditRowId) {
    const amount = creditAmount ?? await getReportCreditCost(reportType)
    if (amount === 1) {
      // Use original RPC for backwards compatibility
      await supabase.rpc('decrement_credit', { p_credit_id: creditRowId })
    } else {
      await supabase.rpc('decrement_credit_amount', { p_credit_id: creditRowId, p_amount: amount })
    }
  }

  // free_slot: no deduction needed — already reserved by check_and_reserve_free_slot
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
    usageType: 'credits' | 'subscription' | 'admin' | 'free'
    creditRowId?: string
    creditAmount?: number
    freeSystem?: string
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
        credit_amount: usageInfo.creditAmount ?? null,
        free_system: usageInfo.freeSystem ?? null,
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
): Promise<{ allowed: boolean; reason?: string; usedMonthly: number; monthlyLimit: number }> {
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
    return { allowed: false, reason: 'No plan allowance for this report type.', usedMonthly: 0, monthlyLimit: 0 }
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
    }
  }

  return {
    allowed: true,
    usedMonthly,
    monthlyLimit: allowance.monthly_limit,
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

// ============================================================================
// Public: Get credit costs for all report types (for frontend display)
// ============================================================================

export { getReportCreditCost } from '@/lib/catalog'
export { getAllCatalogItems } from '@/lib/catalog'
