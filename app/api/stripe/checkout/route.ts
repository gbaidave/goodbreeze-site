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

    // Only accept plan names — never raw priceIds from client (keeps price IDs server-side)
    const VALID_PLANS = ['starter', 'growth', 'pro', 'spark_pack', 'boost_pack'] as const
    type Plan = typeof VALID_PLANS[number]
    const planPriceMap: Record<Plan, string | undefined> = {
      starter:    process.env.STRIPE_STARTER_PLAN_PRICE_ID,
      growth:     process.env.STRIPE_GROWTH_PLAN_PRICE_ID,
      pro:        process.env.STRIPE_PRO_PLAN_PRICE_ID,
      spark_pack: process.env.STRIPE_SPARK_PACK_PRICE_ID,
      boost_pack: process.env.STRIPE_BOOST_PACK_PRICE_ID,
    }
    const plan = body.plan
    if (!plan || !VALID_PLANS.includes(plan)) {
      return NextResponse.json({ error: 'Valid plan name is required (starter, growth, pro, spark_pack, or boost_pack)' }, { status: 400 })
    }
    const priceId: string | undefined = planPriceMap[plan as Plan]
    if (!priceId) {
      return NextResponse.json({ error: 'Plan not configured' }, { status: 500 })
    }

    // 3. Get or create Stripe customer (also fetch phone for gate check)
    const { data: profile } = await supabase
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

      // Save customer ID to profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // 4. Determine if subscription or one-time
    const price = await stripe.prices.retrieve(priceId)
    const isSubscription = price.type === 'recurring'

    // 5. Create checkout session
    const ALLOWED_ORIGINS = ['https://goodbreeze.ai', 'https://goodbreeze-site.vercel.app', 'http://localhost:3000']
    const rawOrigin = request.headers.get('origin') || ''
    const origin = ALLOWED_ORIGINS.includes(rawOrigin) ? rawOrigin : 'https://goodbreeze.ai'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isSubscription ? 'subscription' : 'payment',
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
