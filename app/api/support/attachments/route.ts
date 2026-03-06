/**
 * POST /api/support/attachments
 *
 * Upload files attached to a support message.
 * Validates auth, message ownership, file count, size, and MIME type.
 * Uploads to Supabase Storage bucket 'support-attachments' at {userId}/{messageId}/{filename}.
 * Inserts a row into support_attachments for each file.
 *
 * Body: multipart/form-data with:
 *   messageId: string (UUID of the support_messages row)
 *   files: File[] (up to 3, 5MB each)
 *
 * Returns: { attachments: Array<{ id, file_name, storage_path }> }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service-client'

const MAX_FILES = 3
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
])

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 })
  }

  const messageId = formData.get('messageId')
  if (!messageId || typeof messageId !== 'string' || !/^[0-9a-f-]{36}$/.test(messageId)) {
    return NextResponse.json({ error: 'Invalid message ID.' }, { status: 400 })
  }

  const svc = createServiceClient()

  // Verify the message belongs to a ticket owned by this user
  const { data: msg } = await svc
    .from('support_messages')
    .select('id, request_id, support_requests!inner(user_id)')
    .eq('id', messageId)
    .single()

  if (!msg) {
    return NextResponse.json({ error: 'Message not found.' }, { status: 404 })
  }

  const ticketOwnerId = (msg as any).support_requests?.user_id
  if (ticketOwnerId !== user.id) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403 })
  }

  const files = formData.getAll('files') as File[]
  if (!files.length) {
    return NextResponse.json({ error: 'No files provided.' }, { status: 400 })
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `Maximum ${MAX_FILES} files per message.` }, { status: 400 })
  }

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `File "${file.name}" exceeds 5MB limit.` }, { status: 400 })
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `File type "${file.type}" is not allowed. Accepted: images, PDF, Word docs, plain text.` },
        { status: 400 }
      )
    }
  }

  const uploaded: Array<{ id: string; file_name: string; storage_path: string }> = []

  for (const file of files) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200)
    const storagePath = `${user.id}/${messageId}/${Date.now()}-${safeName}`

    const buffer = await file.arrayBuffer()

    const { error: uploadError } = await svc.storage
      .from('support-attachments')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Support attachment upload error:', uploadError)
      return NextResponse.json({ error: `Failed to upload "${file.name}". Please try again.` }, { status: 500 })
    }

    const { data: row, error: insertError } = await svc
      .from('support_attachments')
      .insert({
        message_id: messageId,
        uploaded_by: user.id,
        storage_path: storagePath,
        file_name: file.name.slice(0, 255),
        file_size: file.size,
        mime_type: file.type,
      })
      .select('id, file_name, storage_path')
      .single()

    if (insertError || !row) {
      console.error('Support attachment DB insert error:', insertError)
      // Clean up the uploaded file
      await svc.storage.from('support-attachments').remove([storagePath])
      return NextResponse.json({ error: `Failed to save attachment "${file.name}".` }, { status: 500 })
    }

    uploaded.push(row)
  }

  return NextResponse.json({ attachments: uploaded })
}
