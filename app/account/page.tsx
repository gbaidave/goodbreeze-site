import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AccountClient from './AccountClient'

export const metadata = { title: 'Account Settings | Good Breeze AI' }

export default async function AccountPage() {
  const supabase = await createClient()

  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'] = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Supabase error — treat as unauthenticated
  }
  if (!user) redirect('/login')

  const [profileRes, subRes, creditsRes, creditHistoryRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('name, email, phone, sms_ok, stripe_customer_id, role, email_preferences')
      .eq('id', user.id)
      .single(),
    supabase
      .from('subscriptions')
      .select('plan, status, current_period_end, cancel_at_period_end, credits_remaining')
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
    supabase
      .from('credits')
      .select('id, balance, product, purchased_at')
      .eq('user_id', user.id)
      .order('purchased_at', { ascending: false })
      .limit(20),
  ])

  const profile = profileRes.data
  const sub = subRes.data
  const credits = creditsRes.data ?? []
  const creditHistory = creditHistoryRes.data ?? []
  const packCredits = credits.reduce((sum, c) => sum + (c.balance ?? 0), 0)
  const creditsRemaining = sub?.credits_remaining ?? 0

  return (
    <AccountClient
      initialName={profile?.name || ''}
      initialPhone={profile?.phone || ''}
      initialSmsOk={profile?.sms_ok ?? false}
      email={user.email || profile?.email || ''}
      role={profile?.role ?? 'user'}
      plan={sub?.plan ?? 'free'}
      status={sub?.status}
      currentPeriodEnd={sub?.current_period_end}
      cancelAtPeriodEnd={sub?.cancel_at_period_end ?? false}
      hasStripeCustomer={!!profile?.stripe_customer_id}
      totalCredits={packCredits}
      creditsRemaining={creditsRemaining}
      creditExpiry={credits[0]?.expires_at}
      creditHistory={creditHistory}
      initialEmailPrefs={{
        nudge_emails: profile?.email_preferences?.nudge_emails !== false,
        support_emails: profile?.email_preferences?.support_emails !== false,
        referral_credit: profile?.email_preferences?.referral_credit !== false,
        report_ready: profile?.email_preferences?.report_ready !== false,
        support_confirmation: profile?.email_preferences?.support_confirmation !== false,
        report_failure: profile?.email_preferences?.report_failure !== false,
        testimonial_approved: profile?.email_preferences?.testimonial_approved !== false,
      }}
    />
  )
}
