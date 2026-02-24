'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'

/**
 * Shows a logged-in user's total credit balance (subscription + pack credits).
 * Renders nothing for guests, admins/testers, or while loading.
 */
export function CreditsDisplay() {
  const { user, loading: authLoading } = useAuth()
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()

    Promise.all([
      supabase
        .from('credits')
        .select('balance')
        .eq('user_id', user.id)
        .gt('balance', 0),
      supabase
        .from('subscriptions')
        .select('plan, credits_remaining')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .limit(1)
        .maybeSingle(),
    ]).then(([creditsRes, subRes]) => {
      const packTotal = (creditsRes.data ?? []).reduce(
        (sum, c) => sum + ((c.balance as number) ?? 0), 0
      )
      const subPlan = subRes.data?.plan ?? 'free'
      const isSubscription = ['starter', 'growth', 'pro'].includes(subPlan)
      const subCredits = isSubscription ? (subRes.data?.credits_remaining ?? 0) : 0
      setCredits(packTotal + subCredits)
    })
  }, [user])

  if (authLoading || !user || credits === null) return null

  return (
    <p className="text-sm text-gray-400">
      {credits === 0 ? (
        <>No credits remaining. <Link href="/pricing" className="text-primary hover:text-primary/80 transition-colors">Add more →</Link></>
      ) : (
        <>{credits} credit{credits !== 1 ? 's' : ''} available. <Link href="/pricing" className="text-primary hover:text-primary/80 transition-colors">Add more →</Link></>
      )}
    </p>
  )
}
