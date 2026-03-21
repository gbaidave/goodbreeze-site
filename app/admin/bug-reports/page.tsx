import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service-client'
import { canDo } from '@/lib/permissions'
import { BugReportsTable } from './BugReportsTable'

export default async function AdminBugReportsPage() {
  // Authenticate actor
  const supabaseAuth = await createClient()
  const { data: { user: actor } } = await supabaseAuth.auth.getUser()

  const svc = createServiceClient()

  const { data: actorProfile } = actor
    ? await svc.from('profiles').select('role').eq('id', actor.id).single()
    : { data: null }
  const actorRole = actorProfile?.role ?? 'support'

  if (!canDo(actorRole, 'view_bug_reports')) {
    redirect('/dashboard')
  }

  // Load admin/support users for assignee display
  const { data: adminUsers } = await svc
    .from('profiles')
    .select('id, name, email')
    .in('role', ['superadmin', 'admin', 'support', 'tester'])
    .order('name', { ascending: true })

  // Load all bug reports — client handles all filtering
  const { data: requests } = await svc
    .from('support_requests')
    .select('id, user_id, email, plan_at_time, last_report_context, message, status, category, assigned_to, assignee_id, created_at, subject, importance, priority, bug_number, bug_category')
    .eq('category', 'bug_report')
    .order('created_at', { ascending: false })
    .limit(500)

  // Load messages for all requests
  const requestIds = requests?.map((r) => r.id) ?? []
  const { data: allMessages } = requestIds.length
    ? await svc
        .from('support_messages')
        .select('id, request_id, sender_role, message, created_at')
        .in('request_id', requestIds)
        .order('created_at', { ascending: true })
    : { data: [] }

  // Load attachments for all messages
  const messageIds = (allMessages ?? []).map((m) => m.id)
  const { data: allAttachments } = messageIds.length
    ? await svc
        .from('support_attachments')
        .select('id, message_id, file_name, file_size, mime_type')
        .in('message_id', messageIds)
    : { data: [] }

  const attachmentsByMessage: Record<string, any[]> = {}
  for (const att of allAttachments ?? []) {
    if (!attachmentsByMessage[att.message_id]) attachmentsByMessage[att.message_id] = []
    attachmentsByMessage[att.message_id]!.push(att)
  }

  // Group messages by request_id
  const messagesByRequest: Record<string, any[]> = {}
  for (const msg of allMessages ?? []) {
    if (!messagesByRequest[msg.request_id]) messagesByRequest[msg.request_id] = []
    messagesByRequest[msg.request_id]!.push({
      ...msg,
      attachments: attachmentsByMessage[msg.id] ?? [],
    })
  }

  // Merge messages into rows
  const rows = (requests ?? []).map((r) => ({
    ...r,
    messages: messagesByRequest[r.id] ?? [],
  }))

  return (
    <div className="p-8">
      <BugReportsTable
        initialRows={rows}
        adminUsers={(adminUsers ?? []) as { id: string; name: string; email?: string }[]}
        actorRole={actorRole}
        actorUserId={actor?.id ?? ''}
      />
    </div>
  )
}
