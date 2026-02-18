import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AccountClient from './AccountClient'

export const metadata = { title: 'Account Settings — Good Breeze AI' }

export default async function AccountPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileRes, subRes, creditsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('name, email, stripe_customer_id')
      .eq('id', user.id)
      .single(),
    supabase
      .from('subscriptions')
      .select('plan, status, current_period_end, cancel_at_period_end')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing', 'past_due'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('credits')
      .select('balance, expires_at')
      .eq('user_id', user.id)
      .gt('balance', 0)
      .order('purchased_at', { ascending: true }),
  ])

  const profile = profileRes.data
  const sub = subRes.data
  const credits = creditsRes.data ?? []
  const totalCredits = credits.reduce((sum, c) => sum + (c.balance ?? 0), 0)

  return (
    <AccountClient
      initialName={profile?.name || ''}
      email={profile?.email || user.email || ''}
      plan={sub?.plan ?? 'free'}
      status={sub?.status}
      currentPeriodEnd={sub?.current_period_end}
      cancelAtPeriodEnd={sub?.cancel_at_period_end ?? false}
      hasStripeCustomer={!!profile?.stripe_customer_id}
      totalCredits={totalCredits}
      creditExpiry={credits[0]?.expires_at}
    />
  )
}
