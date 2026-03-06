/**
 * GET /api/support/attachments/[id]
 *
 * Generates a short-lived signed URL for a support attachment and redirects.
 * User must own the ticket the attachment belongs to, or be admin/tester.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service-client'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const svc = createServiceClient()

  // Load attachment + its ticket owner
  const { data: attachment } = await svc
    .from('support_attachments')
    .select('id, storage_path, file_name, support_messages!inner(request_id, support_requests!inner(user_id))')
    .eq('id', id)
    .single()

  if (!attachment) {
    return NextResponse.json({ error: 'Attachment not found.' }, { status: 404 })
  }

  const ticketOwnerId = (attachment as any).support_messages?.support_requests?.user_id

  // Check if user is admin/tester
  const { data: profile } = await svc
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin' || profile?.role === 'tester'

  if (!isAdmin && ticketOwnerId !== user.id) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403 })
  }

  // Generate a 1-hour signed URL
  const { data: signedData, error: signError } = await svc.storage
    .from('support-attachments')
    .createSignedUrl(attachment.storage_path, 3600)

  if (signError || !signedData?.signedUrl) {
    console.error('Signed URL error:', signError)
    return NextResponse.json({ error: 'Could not generate download link.' }, { status: 500 })
  }

  return NextResponse.redirect(signedData.signedUrl)
}
