import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service-client'

const VALID_STATUSES = ['pending', 'approved', 'rejected'] as const

export async function POST(request: NextRequest) {
  // Verify admin session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Parse form body
  const body = await request.formData()
  const id = body.get('id') as string
  const status = body.get('status') as string

  if (!id || !VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const serviceClient = createServiceClient()
  const { error } = await serviceClient
    .from('testimonials')
    .update({ status })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Redirect back to testimonials page (form POST → redirect)
  const referer = request.headers.get('referer') ?? '/admin/testimonials'
  return NextResponse.redirect(new URL(referer, request.url))
}
