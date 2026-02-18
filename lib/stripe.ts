import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover',
})

export const PRICES = {
  starter: process.env.STRIPE_STARTER_PRICE_ID!,
  impulse: process.env.STRIPE_IMPULSE_PRICE_ID!,
}
