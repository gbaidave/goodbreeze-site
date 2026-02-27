'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'

const SUBSCRIPTION_PLANS = ['starter', 'growth', 'pro']

export function CreditsPill() {
  const { user, loading } = useAuth()
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return

    async function fetchCredits() {
      const supabase = createClient()

      const [subRes, packRes] = await Promise.all([
        supabase
          .from('subscriptions')
          .select('credits_remaining, plan')
          .eq('user_id', user!.id)
          .in('status', ['active', 'trialing'])
          .order('created_at', { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from('credits')
          .select('balance')
          .eq('user_id', user!.id)
          .gt('balance', 0),
      ])

      const sub = subRes.data
      const isSubscription = sub && SUBSCRIPTION_PLANS.includes(sub.plan)
      const subscriptionCredits = isSubscription ? (sub.credits_remaining ?? 0) : 0
      const packCredits = (packRes.data ?? []).reduce(
        (sum: number, c: { balance: number }) => sum + (c.balance ?? 0),
        0
      )
      setCredits(subscriptionCredits + packCredits)
    }

    fetchCredits()
  }, [user])

  if (loading || !user || credits === null) return null

  const isLow = credits <= 5

  return (
    <Link
      href="/pricing"
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
        isLow
          ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
      }`}
    >
      <svg
        className="w-3.5 h-3.5 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span suppressHydrationWarning>{credits}</span>
    </Link>
  )
}
