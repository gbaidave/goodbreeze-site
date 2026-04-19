export interface FailureReport {
  id: string
  user_name: string | null
  user_email: string
  report_type: string
  created_at: string
  status: string
  n8n_execution_id: string | null
  input_data: Record<string, unknown> | null
  admin_failure_notes: string | null
  credit_refunded?: boolean
}

export function generateFailurePacket(report: FailureReport): string {
  const inputStr = report.input_data
    ? JSON.stringify(report.input_data, null, 2)
    : '(not available)'

  const n8nBase = process.env.NEXT_PUBLIC_N8N_UI_BASE_URL ?? 'https://internal.goodbreeze.ai'
  const n8nLink = report.n8n_execution_id
    ? `${n8nBase}/executions/${report.n8n_execution_id}`
    : '(not available)'

  const failedAt = new Date(report.created_at).toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return `=== REPORT FAILURE — PASTE TO CLAUDE CODE ===
Report ID:    ${report.id}
User:         ${report.user_name ?? '—'} | ${report.user_email}
Report type:  ${report.report_type}
Failed at:    ${failedAt} PT
Failure type: ${report.status}
n8n Execution ID: ${report.n8n_execution_id ?? '(not available)'}
n8n Link:     ${n8nLink}
Input data:
${inputStr}
Credit refunded: ${report.credit_refunded ? 'yes' : 'unknown'}
Admin notes:  ${report.admin_failure_notes ?? 'none'}

CLAUDE INSTRUCTIONS:
1. Open the n8n execution link above and find the error node/message
2. Identify root cause (API failure, timeout, bad input, blocked site, etc.)
3. If systemic: propose a workflow or code fix and implement it
4. If one-off: draft a support reply for Dave to send to the user
5. When resolved, update admin_failure_status to 'resolved'
==============================================`
}
