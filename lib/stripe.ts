import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover',
})

/**
 * @deprecated Stripe Price IDs live in the `products` catalog (`stripe_price_id` column).
 * Use `getCatalogItem(sku).stripePriceId` via `lib/catalog.ts` instead.
 * Retained only for incidental imports during the 2026-04-16 catalog migration.
 * Will be removed after Sprint 4.
 */
export const PRICES = {
  starter:    process.env.STRIPE_STARTER_PLAN_PRICE_ID!,
  growth:     process.env.STRIPE_GROWTH_PLAN_PRICE_ID!,
  pro:        process.env.STRIPE_PRO_PLAN_PRICE_ID!,
  spark_pack: process.env.STRIPE_SPARK_PACK_PRICE_ID!,
  boost_pack: process.env.STRIPE_BOOST_PACK_PRICE_ID!,
}
