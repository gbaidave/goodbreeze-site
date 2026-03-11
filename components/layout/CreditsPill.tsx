'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'

const SUBSCRIPTION_PLANS = ['starter', 'growth', 'pro']
const UNLIMITED_ROLES = ['tester', 'admin', 'superadmin', 'support']

export function CreditsPill() {
  const { user, loading } = useAuth()
  const [credits, setCredits] = useState<number | null>(null)
  const [unlimited, setUnlimited] = useState(false)

  async function fetchCredits() {
    if (!user) return
    const supabase = createClient()

    const [profileRes, subRes, packRes] = await Promise.all([
      supabase.from('profiles').select('role').eq('id', user.id).single(),
      supabase
        .from('subscriptions')
        .select('credits_remaining, plan')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('credits')
        .select('balance')
        .eq('user_id', user.id)
        .gt('balance', 0),
    ])

    if (profileRes.data && UNLIMITED_ROLES.includes(profileRes.data.role)) {
      setUnlimited(true)
      setCredits(0)
      return
    }

    setUnlimited(false)
    const sub = subRes.data
    const isSubscription = sub && SUBSCRIPTION_PLANS.includes(sub.plan)
    const subscriptionCredits = isSubscription ? (sub.credits_remaining ?? 0) : 0
    const packCredits = (packRes.data ?? []).reduce(
      (sum: number, c: { balance: number }) => sum + (c.balance ?? 0),
      0
    )
    setCredits(subscriptionCredits + packCredits)
  }

  // Fetch on mount, poll every 60s, and refresh on window focus
  useEffect(() => {
    if (!user) return
    fetchCredits()
    const interval = setInterval(fetchCredits, 60000)
    const onFocus = () => fetchCredits()
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  if (loading || !user || (credits === null && !unlimited)) return null

  if (unlimited) {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-zinc-800 text-zinc-300">
        Credits · ∞
      </span>
    )
  }

  const isLow = (credits ?? 0) <= 5

  return (
    <Link
      href="/pricing"
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
        isLow
          ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
      }`}
    >
      <span suppressHydrationWarning>Credits · {credits}</span>
    </Link>
  )
}
