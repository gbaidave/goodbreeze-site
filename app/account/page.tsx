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

  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  const [profileRes, subRes, creditsRes, creditHistoryRes, recentPackRes, openTicketsRes, openRefundRes, openDisputeRes, refundedPacksRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('name, email, phone, sms_ok, stripe_customer_id, role, email_preferences, notification_preferences, data_export_locked, password_last_changed_at')
      .eq('id', user.id)
      .single(),
    supabase
      .from('subscriptions')
      .select('plan, status, current_period_end, cancel_at_period_end, cancel_at, credits_remaining')
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
      .select('id, balance, product, purchased_at, source, stripe_payment_intent_id')
      .eq('user_id', user.id)
      .order('purchased_at', { ascending: false })
      .limit(20),
    // Recent credit pack with balance — for refund warning in delete modal
    supabase
      .from('credits')
      .select('id')
      .eq('user_id', user.id)
      .gt('balance', 0)
      .gte('purchased_at', fourteenDaysAgo)
      .not('product', 'in', '("free_credit","signup_credit","signup_bonus","testimonial_reward","referral_credit","admin_grant","credit_grant")')
      .limit(1)
      .maybeSingle(),
    // Open support tickets count
    supabase
      .from('support_requests')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['open', 'in_progress']),
    // Open refund request
    supabase
      .from('refund_requests')
      .select('id')
      .eq('user_id', user.id)
      .in('status', ['pending', 'in_progress'])
      .limit(1)
      .maybeSingle(),
    // Open dispute ticket
    supabase
      .from('support_requests')
      .select('id')
      .eq('user_id', user.id)
      .eq('category', 'dispute')
      .in('status', ['open', 'in_progress'])
      .limit(1)
      .maybeSingle(),
    // Refunded credit pack payment IDs — to label zeroed credits as "Refunded" vs "Used"
    supabase
      .from('refund_requests')
      .select('stripe_payment_id')
      .eq('user_id', user.id)
      .eq('status', 'refunded')
      .not('stripe_payment_id', 'is', null),
  ])

  const profile = profileRes.data
  const sub = subRes.data
  const credits = creditsRes.data ?? []
  const creditHistory = creditHistoryRes.data ?? []
  const refundedPaymentIds = new Set(
    (refundedPacksRes.data ?? []).map((r: any) => r.stripe_payment_id).filter(Boolean)
  )
  const packCredits = credits.reduce((sum, c) => sum + (c.balance ?? 0), 0)
  const creditsRemaining = sub?.credits_remaining ?? 0

  // True only if user has NO OAuth providers — pure email/password accounts.
  // A user with both 'email' and 'google' identities is treated as OAuth (no password field).
  const isEmailUser = (user.identities?.length ?? 0) > 0 &&
    !user.identities?.some(i => i.provider !== 'email')

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
      cancelAt={sub?.cancel_at ?? null}
      hasStripeCustomer={!!profile?.stripe_customer_id}
      totalCredits={packCredits}
      creditsRemaining={creditsRemaining}
      creditExpiry={credits[0]?.expires_at}
      creditHistory={creditHistory}
      refundedPaymentIds={refundedPaymentIds}
      initialEmailPrefs={{
        nudge_emails: profile?.email_preferences?.nudge_emails !== false,
        support_emails: profile?.email_preferences?.support_emails !== false,
        referral_credit: profile?.email_preferences?.referral_credit !== false,
        report_ready: profile?.email_preferences?.report_ready !== false,
        support_confirmation: profile?.email_preferences?.support_confirmation !== false,
        report_failure: profile?.email_preferences?.report_failure !== false,
        testimonial_approved: profile?.email_preferences?.testimonial_approved !== false,
        bug_updates: profile?.email_preferences?.bug_updates !== false,
      }}
      initialNotifPrefs={{
        billing_payments: profile?.notification_preferences?.billing_payments === true,
        refund_decisions: profile?.notification_preferences?.refund_decisions === true,
        account_security: profile?.notification_preferences?.account_security === true,
        nudge_emails: profile?.notification_preferences?.nudge_emails !== false,
        support_emails: profile?.notification_preferences?.support_emails !== false,
        referral_credit: profile?.notification_preferences?.referral_credit !== false,
        report_ready: profile?.notification_preferences?.report_ready !== false,
        support_confirmation: profile?.notification_preferences?.support_confirmation !== false,
        report_failure: profile?.notification_preferences?.report_failure !== false,
        testimonial_approved: profile?.notification_preferences?.testimonial_approved !== false,
        bug_updates: profile?.notification_preferences?.bug_updates !== false,
      }}
      isEmailUser={isEmailUser}
      passwordLastChangedAt={profile?.password_last_changed_at ?? null}
      dataExportLocked={profile?.data_export_locked ?? false}
      hasRecentPackCredits={!!recentPackRes.data}
      openTicketCount={openTicketsRes.count ?? 0}
      openRefundExists={!!openRefundRes.data}
      openDisputeExists={!!openDisputeRes.data}
    />
  )
}
