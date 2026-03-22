/**
 * GET /api/support/refundable-purchases
 *
 * Returns the authenticated user's refundable purchases with per-product
 * eligibility flags and ineligibility reasons. Used by the support form
 * purchase selector when category = 'refund'.
 *
 * Eligibility rules:
 * - Pack: credits_used_from_this_pack === 0 AND within 14 days of purchase
 * - Plan: credits_used_this_cycle === 0 AND within 14 days of current_period_start
 * - Ineligible purchases are still returned — flagged so user understands why
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'

const PLAN_MONTHLY_CAPS: Record<string, number> = {
  starter: 25,
  growth:  40,
  pro:     50,
}

const REFUND_WINDOW_DAYS = 14

export async function GET(request: NextRequest) {
  try {
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

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const svc = createServiceClient()
    const now = new Date()
    const purchases: RefundablePurchase[] = []

    // ── 1. Active subscription ─────────────────────────────────────────────
    const { data: sub } = await svc
      .from('subscriptions')
      .select('plan, status, stripe_subscription_id, stripe_customer_id, credits_remaining, current_period_start, current_period_end, cancel_at_period_end')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (sub && sub.plan && PLAN_MONTHLY_CAPS[sub.plan]) {
      const planCap = PLAN_MONTHLY_CAPS[sub.plan]
      const creditsUsed = planCap - (sub.credits_remaining ?? 0)
      const periodStart = sub.current_period_start ? new Date(sub.current_period_start) : null
      const daysSincePeriodStart = periodStart
        ? (now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)
        : null
      const withinWindow = daysSincePeriodStart !== null && daysSincePeriodStart <= REFUND_WINDOW_DAYS

      const ineligibilityReasons: string[] = []
      if (creditsUsed > 0) ineligibilityReasons.push('Credits have been used this billing cycle')
      if (!withinWindow) ineligibilityReasons.push(
        daysSincePeriodStart !== null
          ? `Outside ${REFUND_WINDOW_DAYS}-day refund window (${Math.floor(daysSincePeriodStart)} days into billing cycle)`
          : 'Billing period information unavailable'
      )

      const planLabel = sub.plan.charAt(0).toUpperCase() + sub.plan.slice(1) + ' Plan'
      const periodStartFormatted = periodStart
        ? periodStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Unknown'

      purchases.push({
        productId: sub.stripe_subscription_id ?? '',
        productType: 'subscription',
        productLabel: planLabel,
        displayLabel: `${planLabel} — billing cycle started ${periodStartFormatted}`,
        purchaseDate: sub.current_period_start ?? null,
        amountCents: null, // fetched from Stripe invoice at processing time
        creditsUsed,
        isEligible: ineligibilityReasons.length === 0,
        ineligibilityReasons,
        cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
        // If outside window, let user know they can cancel instead
        cancelNote: !withinWindow
          ? 'You can cancel your plan to stop future charges. Access continues until the end of your billing period.'
          : null,
      })
    }

    // ── 2. Credit packs ────────────────────────────────────────────────────
    const { data: packRows } = await svc
      .from('credits')
      .select('id, balance, product, source, purchased_at, expires_at')
      .eq('user_id', user.id)
      .eq('source', 'pack')
      .order('purchased_at', { ascending: false })

    if (packRows && packRows.length > 0) {
      // For each pack row, count how many reports used credits from it
      const packIds = packRows.map(r => r.id)
      const { data: usageRows } = await svc
        .from('reports')
        .select('credit_row_id')
        .eq('user_id', user.id)
        .in('credit_row_id', packIds)

      const usageByPack: Record<string, number> = {}
      for (const row of (usageRows ?? [])) {
        if (row.credit_row_id) {
          usageByPack[row.credit_row_id] = (usageByPack[row.credit_row_id] ?? 0) + 1
        }
      }

      for (const pack of packRows) {
        const creditsUsed = usageByPack[pack.id] ?? 0
        const purchaseDate = pack.purchased_at ? new Date(pack.purchased_at) : null
        const daysSincePurchase = purchaseDate
          ? (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
          : null
        const withinWindow = daysSincePurchase !== null && daysSincePurchase <= REFUND_WINDOW_DAYS

        const ineligibilityReasons: string[] = []
        if (creditsUsed > 0) ineligibilityReasons.push('Credits from this pack have been used')
        if (!withinWindow) ineligibilityReasons.push(
          daysSincePurchase !== null
            ? `Outside ${REFUND_WINDOW_DAYS}-day refund window (purchased ${Math.floor(daysSincePurchase)} days ago)`
            : 'Purchase date unavailable'
        )

        const productName = pack.product
          ? pack.product.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
          : 'Credit Pack'
        const purchaseDateFormatted = purchaseDate
          ? purchaseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'Unknown date'

        purchases.push({
          productId: pack.id, // credits row ID — used to look up stripe PI at processing time
          productType: 'credit_pack',
          productLabel: productName,
          displayLabel: `${productName} — purchased ${purchaseDateFormatted}`,
          purchaseDate: pack.purchased_at ?? null,
          amountCents: null, // fetched from Stripe PI at processing time
          creditsUsed,
          isEligible: ineligibilityReasons.length === 0,
          ineligibilityReasons,
          cancelAtPeriodEnd: false,
          cancelNote: null,
        })
      }
    }

    return NextResponse.json({ purchases })
  } catch (err) {
    console.error('refundable-purchases error:', err)
    return NextResponse.json({ error: 'Failed to load purchases.' }, { status: 500 })
  }
}

export interface RefundablePurchase {
  productId: string            // stripe_subscription_id | credits row UUID
  productType: 'subscription' | 'credit_pack'
  productLabel: string         // e.g. "Starter Plan"
  displayLabel: string         // e.g. "Starter Plan — billing cycle started Mar 1, 2026"
  purchaseDate: string | null
  amountCents: number | null   // null = looked up at processing time
  creditsUsed: number
  isEligible: boolean
  ineligibilityReasons: string[]
  cancelAtPeriodEnd: boolean
  cancelNote: string | null    // shown when plan is outside window
}
