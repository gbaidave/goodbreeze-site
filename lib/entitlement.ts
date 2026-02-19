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
  | 'seo_audit' | 'seo_comprehensive' | 'multi_page'

export type Product = 'analyzer' | 'seo_auditor'

export type Plan = 'free' | 'impulse' | 'starter' | 'custom'

export interface EntitlementResult {
  allowed: boolean
  reason?: string          // shown to user if not allowed
  deductFrom?: 'subscription' | 'credits'
  creditRowId?: string     // which credits row to decrement
  upgradePrompt?: 'impulse' | 'starter'  // what to show in paywall
}

// ============================================================================
// Report metadata: which product each type belongs to, and tier access
// ============================================================================

const REPORT_META: Record<ReportType, {
  product: Product
  freeAllowed: boolean
  impulseAllowed: boolean
  usesMoz: boolean
  usesSerp: boolean
}> = {
  // Analyzer
  h2h:               { product: 'analyzer',    freeAllowed: true,  impulseAllowed: true,  usesMoz: false, usesSerp: false },
  t3c:               { product: 'analyzer',    freeAllowed: false, impulseAllowed: true,  usesMoz: false, usesSerp: false },
  cp:                { product: 'analyzer',    freeAllowed: false, impulseAllowed: true,  usesMoz: false, usesSerp: false },
  // SEO Auditor
  ai_seo:            { product: 'seo_auditor', freeAllowed: true,  impulseAllowed: true,  usesMoz: false, usesSerp: false },
  landing_page:      { product: 'seo_auditor', freeAllowed: false, impulseAllowed: true,  usesMoz: false, usesSerp: false },
  keyword_research:  { product: 'seo_auditor', freeAllowed: false, impulseAllowed: true,  usesMoz: false, usesSerp: true  },
  seo_audit:         { product: 'seo_auditor', freeAllowed: false, impulseAllowed: true,  usesMoz: true,  usesSerp: true  },
  seo_comprehensive: { product: 'seo_auditor', freeAllowed: false, impulseAllowed: false, usesMoz: true,  usesSerp: true  },
  multi_page:        { product: 'seo_auditor', freeAllowed: false, impulseAllowed: false, usesMoz: true,  usesSerp: true  },
}

// Per-plan daily/monthly limits (starter). Free/impulse = 1 per purchase event.
const STARTER_LIMITS = {
  analyzer_per_day: 5,
  // SEO limits TBD pending COGS analysis — set generously for now
  seo_per_month: 50,
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

  // 1. Fetch user plan + role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    return { allowed: false, reason: 'Account not found. Please sign in again.' }
  }

  // Testers and admins bypass all limits
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

  const plan = (sub?.plan ?? 'free') as Plan

  // 3. Starter plan — check usage limits
  if (plan === 'starter' || plan === 'custom') {
    if (plan === 'custom') {
      return { allowed: true, deductFrom: 'subscription' }
    }

    // Check if report type is allowed on starter
    // seo_comprehensive and multi_page: allowed on starter
    // (all types allowed on starter per spec)

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

    const analyzerUsed = usageRow?.analyzer_reports_used ?? 0
    const seoUsed = usageRow?.seo_reports_used ?? 0

    if (meta.product === 'analyzer' && analyzerUsed >= STARTER_LIMITS.analyzer_per_day) {
      return {
        allowed: false,
        reason: `You've reached your daily limit of ${STARTER_LIMITS.analyzer_per_day} Analyzer reports. Limit resets tomorrow.`,
        upgradePrompt: 'starter',
      }
    }

    if (meta.product === 'seo_auditor' && seoUsed >= STARTER_LIMITS.seo_per_month) {
      return {
        allowed: false,
        reason: `You've reached your monthly SEO report limit. Upgrade or add a credit pack to continue.`,
        upgradePrompt: 'starter',
      }
    }

    return { allowed: true, deductFrom: 'subscription' }
  }

  // 4. Free plan — check if this report type is allowed for free
  if (plan === 'free') {
    if (!meta.freeAllowed) {
      return {
        allowed: false,
        reason: `This report type requires a paid plan or credit pack.`,
        upgradePrompt: 'impulse',
      }
    }

    // Check if free report already used
    const { count } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['complete', 'processing', 'pending'])

    if ((count ?? 0) > 0) {
      return {
        allowed: false,
        reason: `You've used your free report. Get 3 more reports for just $10, or upgrade to Starter for unlimited access.`,
        upgradePrompt: 'impulse',
      }
    }

    return { allowed: true, deductFrom: 'subscription' }
  }

  // 5. Impulse plan ($1 pack) — check credits
  // Find oldest non-expired credit row with balance > 0
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
      reason: `You have no remaining reports. Get 3 more for $10 or upgrade to Starter.`,
      upgradePrompt: meta.impulseAllowed ? 'impulse' : 'starter',
    }
  }

  // Check if this report type is allowed on impulse
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
  creditRowId?: string
): Promise<void> {
  const meta = REPORT_META[reportType]
  const supabase = getServiceClient()

  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString().split('T')[0]

  // Upsert usage row
  const usageIncrement = meta.product === 'analyzer'
    ? { analyzer_reports_used: 1 }
    : { seo_reports_used: 1 }

  await supabase.rpc('increment_usage', {
    p_user_id: userId,
    p_period_start: periodStart,
    p_analyzer_delta: meta.product === 'analyzer' ? 1 : 0,
    p_seo_delta: meta.product === 'seo_auditor' ? 1 : 0,
  })

  // Decrement credit balance if applicable
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
  plan: Plan
): Promise<string> {
  const meta = REPORT_META[reportType]
  const supabase = getServiceClient()

  // Expiry: 30 days for free/impulse, 12 months for starter+
  const expiryDays = plan === 'starter' || plan === 'custom' ? 365 : 30
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
