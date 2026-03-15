import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'
import { resend, FROM, FROM_NAME } from '@/lib/resend'
import { passwordResetEmail } from '@/lib/emails/password-reset'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://goodbreeze.ai'
    const redirectTo = `${siteUrl}/auth/callback?returnUrl=/reset-password`

    const admin = createServiceClient()
    const { data, error: linkError } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email: user.email!,
      options: { redirectTo },
    })

    if (linkError || !data?.properties?.action_link) {
      console.error('generateLink error:', linkError)
      return NextResponse.json({ error: 'Failed to generate reset link' }, { status: 500 })
    }

    const { data: profile } = await admin
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()

    const name = profile?.name || user.email!
    const { subject, html } = passwordResetEmail(name, data.properties.action_link)

    await resend.emails.send({
      from: `${FROM_NAME} <${FROM}>`,
      to: user.email!,
      subject,
      html,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('send-password-reset error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
