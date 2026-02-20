import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SupportForm from './SupportForm'

export const metadata = {
  title: 'Get Help — Good Breeze AI',
}

export default async function SupportPage() {
  const supabase = await createClient()

  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'] = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // treat as unauthenticated
  }
  if (!user) redirect('/login')

  const [profileRes, subRes, lastReportRes] = await Promise.all([
    supabase.from('profiles').select('name, email').eq('id', user.id).single(),
    supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('reports')
      .select('report_type, status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
  ])

  const profile = profileRes.data
  const plan = subRes.data?.plan || 'free'
  const lastReport = lastReportRes.data

  const userName = profile?.name || user.email!.split('@')[0]
  const userEmail = profile?.email || user.email!
  const lastReportContext = lastReport
    ? `${lastReport.report_type} (${lastReport.status})`
    : null

  return (
    <SupportForm
      userName={userName}
      userEmail={userEmail}
      plan={plan}
      lastReportContext={lastReportContext}
    />
  )
}
