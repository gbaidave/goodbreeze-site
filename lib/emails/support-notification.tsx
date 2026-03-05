const CATEGORY_LABELS: Record<string, string> = {
  account_access: 'Account Access',
  report_issue:   'Report Issue',
  billing:        'Billing',
  refund:         'Refund Request',
  dispute:        'Dispute',
  help:           'General Help',
  feedback:       'Feedback',
}

interface SupportEmailData {
  userName: string
  userEmail: string
  planAtTime: string
  lastReportContext: string
  message: string
  category?: string
  subject?: string | null
}

export function supportNotificationEmail(data: SupportEmailData): { subject: string; html: string } {
  const { userName, userEmail, planAtTime, lastReportContext, message, category, subject } = data
  const categoryLabel = category ? (CATEGORY_LABELS[category] ?? category) : null
  const isDispute = category === 'dispute'
  return {
    subject: categoryLabel
      ? `[Support] ${isDispute ? '🚨 ' : ''}${categoryLabel} from ${userName} (${userEmail})`
      : `[Support] New request from ${userName} (${userEmail})`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Logo -->
        <tr><td style="padding-bottom:24px;">
          <span style="font-size:18px;font-weight:700;color:#ffffff;">Good Breeze <span style="color:#22d3ee;">AI</span></span>
          <span style="font-size:13px;color:#71717a;margin-left:8px;">Support Request</span>
        </td></tr>

        <!-- Main card -->
        <tr><td style="background:#18181b;border:1px solid #27272a;border-radius:16px;padding:32px;">
          <h1 style="margin:0 0 20px;font-size:20px;font-weight:700;color:#ffffff;">${isDispute ? '🚨 ' : ''}New support request${categoryLabel ? `: ${categoryLabel}` : ''}</h1>
          ${subject ? `<p style="margin:0 0 20px;font-size:15px;color:#e4e4e7;"><strong>Subject:</strong> ${subject}</p>` : ''}

          <!-- User info -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;background:#09090b;border:1px solid #27272a;border-radius:10px;padding:16px;">
            <tr>
              <td style="font-size:13px;color:#71717a;padding-bottom:8px;width:120px;vertical-align:top;">Name</td>
              <td style="font-size:13px;color:#ffffff;padding-bottom:8px;">${userName}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#71717a;padding-bottom:8px;vertical-align:top;">Email</td>
              <td style="font-size:13px;padding-bottom:8px;">
                <a href="mailto:${userEmail}" style="color:#22d3ee;text-decoration:none;">${userEmail}</a>
              </td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#71717a;padding-bottom:8px;vertical-align:top;">Plan</td>
              <td style="font-size:13px;color:#ffffff;padding-bottom:8px;text-transform:capitalize;">${planAtTime}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#71717a;vertical-align:top;">Last report</td>
              <td style="font-size:13px;color:#ffffff;">${lastReportContext}</td>
            </tr>
          </table>

          <!-- Message -->
          <h2 style="margin:0 0 12px;font-size:15px;font-weight:600;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.05em;">Message</h2>
          <div style="background:#09090b;border:1px solid #27272a;border-radius:10px;padding:20px;">
            <p style="margin:0;font-size:15px;color:#ffffff;line-height:1.7;white-space:pre-wrap;">${message}</p>
          </div>

          <!-- Reply CTA -->
          <p style="margin:24px 0 0;font-size:13px;color:#71717a;">
            Reply through the admin panel — do not reply to this email directly, as replies won't be captured in the system. This message was submitted through the Good Breeze AI support form.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 0 0;">
          <p style="margin:0;font-size:12px;color:#3f3f46;">
            Good Breeze AI · Internal support notification · Do not forward
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }
}
