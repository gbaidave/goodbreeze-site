/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe Checkout Session for a given price.
 * Redirects user to Stripe hosted checkout page.
 *
 * Body: { priceId: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/service-client'
import { getCatalogItem } from '@/lib/catalog'

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
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 2. Parse request
    const body = await request.json()

    // Only accept plan SKUs — never raw priceIds from client (keeps price IDs server-side)
    // Resolve plan → Stripe Price ID + type via catalog (source of truth).
    const plan = body.plan
    if (!plan || typeof plan !== 'string') {
      return NextResponse.json({ error: 'Valid plan name is required' }, { status: 400 })
    }

    const catalogItem = await getCatalogItem(plan)
    if (!catalogItem || !catalogItem.active) {
      return NextResponse.json({ error: 'Plan not found or inactive in catalog' }, { status: 400 })
    }
    if (!catalogItem.stripePriceId) {
      return NextResponse.json({ error: 'Plan not configured (missing Stripe Price ID in catalog)' }, { status: 500 })
    }
    if (catalogItem.productType !== 'subscription_plan' && catalogItem.productType !== 'credit_pack') {
      return NextResponse.json({ error: 'Product is not sellable via checkout' }, { status: 400 })
    }

    const priceId = catalogItem.stripePriceId
    const isSubscriptionPlan = catalogItem.productType === 'subscription_plan'

    // Subscription plans require explicit acknowledgment of the credit reset policy
    if (isSubscriptionPlan && body.acknowledged !== true) {
      return NextResponse.json(
        { error: 'You must acknowledge the credit reset policy before subscribing.', code: 'ACK_REQUIRED' },
        { status: 400 }
      )
    }

    // 3. Get or create Stripe customer (also fetch phone for gate check)
    // Use service client to ensure phone is always readable regardless of RLS policy on the column
    const svc = createServiceClient()
    const { data: profile } = await svc
      .from('profiles')
      .select('stripe_customer_id, name, email, phone')
      .eq('id', user.id)
      .single()

    // Phone gate: require phone before any Stripe checkout
    const hasPhone = profile?.phone && (profile.phone as string).trim().length > 0
    if (!hasPhone) {
      return NextResponse.json(
        { error: 'Add a phone number to your account before upgrading.', code: 'PHONE_REQUIRED' },
        { status: 400 }
      )
    }

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email || user.email!,
        name: profile?.name || undefined,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id

      // Save customer ID to profile — use service client to bypass RLS on this column
      const svc = createServiceClient()
      await svc
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // 4. Save subscription acknowledgment (consent audit trail)
    if (isSubscriptionPlan) {
      const svc = createServiceClient()
      // Plan monthly credits stored in credits_granted (price_credits is per-use for reports only)
      const creditsPerPeriod = catalogItem.creditsGranted ?? 0
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
      await svc.from('subscription_acknowledgments').insert({
        user_id: user.id,
        plan,
        credits_per_period: creditsPerPeriod,
        ip_address: ip,
      })
      // Non-fatal: if this fails we still proceed — Stripe is the payment authority
    }

    // 5. Create checkout session (mode determined by catalog product_type)
    const ALLOWED_ORIGINS = ['https://goodbreeze.ai', 'https://staging.goodbreeze.ai', 'https://goodbreeze-site.vercel.app', 'http://localhost:3000']
    const rawOrigin = request.headers.get('origin') || ''
    const origin = ALLOWED_ORIGINS.includes(rawOrigin) ? rawOrigin : 'https://goodbreeze.ai'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isSubscriptionPlan ? 'subscription' : 'payment',
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/dashboard?checkout=cancelled`,
      metadata: {
        supabase_user_id: user.id,
        price_id: priceId,
      },
    })

    return NextResponse.json({ url: session.url })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
