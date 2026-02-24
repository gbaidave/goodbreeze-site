'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'

/**
 * Shows a logged-in user's credit balance with a link to buy more.
 * Renders nothing for guests or while loading.
 */
export function CreditsDisplay() {
  const { user, loading: authLoading } = useAuth()
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('credits')
      .select('balance')
      .eq('user_id', user.id)
      .gt('balance', 0)
      .then(({ data }) => {
        const total = (data ?? []).reduce((sum, c) => sum + ((c.balance as number) ?? 0), 0)
        setCredits(total)
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
