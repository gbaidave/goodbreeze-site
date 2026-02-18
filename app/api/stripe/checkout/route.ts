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

    // Accept either a raw priceId or a plan name (keeps price IDs server-side)
    const planPriceMap: Record<string, string | undefined> = {
      starter: process.env.STRIPE_STARTER_PRICE_ID,
      impulse: process.env.STRIPE_IMPULSE_PRICE_ID,
    }
    const priceId: string | undefined = body.priceId ?? planPriceMap[body.plan]

    if (!priceId) {
      return NextResponse.json({ error: 'priceId or valid plan name is required' }, { status: 400 })
    }

    // 3. Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, name, email')
      .eq('id', user.id)
      .single()

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
    const origin = request.headers.get('origin') || 'https://goodbreeze.ai'

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
