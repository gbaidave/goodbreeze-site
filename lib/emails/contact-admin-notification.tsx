interface ContactAdminData {
  name: string
  email: string
  message: string
  hasAccount: boolean
  requestId?: string
}

export function contactAdminNotificationEmail(data: ContactAdminData): { subject: string; html: string } {
  const { name, email, message, hasAccount, requestId } = data
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

  const safeName = esc(name)
  const safeEmail = esc(email)
  const safeMessage = esc(message).replace(/\n/g, '<br>')

  const adminUrl = requestId
    ? `https://goodbreeze.ai/admin/support?id=${encodeURIComponent(requestId)}`
    : 'https://goodbreeze.ai/admin/support'

  return {
    subject: `[Contact] New message from ${name} (${email})`,
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
          <span style="font-size:13px;color:#71717a;margin-left:8px;">Contact Form</span>
        </td></tr>

        <!-- Main card -->
        <tr><td style="background:#18181b;border:1px solid #27272a;border-radius:16px;padding:32px;">
          <h1 style="margin:0 0 20px;font-size:20px;font-weight:700;color:#ffffff;">New contact form submission</h1>

          <!-- Sender info -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;background:#09090b;border:1px solid #27272a;border-radius:10px;padding:16px;">
            <tr>
              <td style="font-size:13px;color:#71717a;padding-bottom:8px;width:120px;vertical-align:top;">Name</td>
              <td style="font-size:13px;color:#ffffff;padding-bottom:8px;">${safeName}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#71717a;padding-bottom:8px;vertical-align:top;">Email</td>
              <td style="font-size:13px;padding-bottom:8px;">
                <a href="mailto:${safeEmail}" style="color:#22d3ee;text-decoration:none;">${safeEmail}</a>
              </td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#71717a;vertical-align:top;">Has account</td>
              <td style="font-size:13px;color:#ffffff;">${hasAccount ? 'Yes' : 'No'}</td>
            </tr>
          </table>

          <!-- Message -->
          <h2 style="margin:0 0 12px;font-size:13px;font-weight:600;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.05em;">Message</h2>
          <div style="background:#09090b;border:1px solid #27272a;border-radius:10px;padding:20px;">
            <p style="margin:0;font-size:15px;color:#ffffff;line-height:1.7;white-space:pre-wrap;">${safeMessage}</p>
          </div>

          <!-- Admin CTA -->
          <div style="margin-top:28px;">
            <a href="${adminUrl}" style="display:inline-block;background:linear-gradient(135deg,#22d3ee,#3b82f6);color:#09090b;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none;">
              View in admin panel →
            </a>
          </div>

          <p style="margin:24px 0 0;font-size:13px;color:#71717a;">
            Reply through the admin panel so the conversation stays captured in the system.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 0 0;">
          <p style="margin:0;font-size:12px;color:#3f3f46;">
            Good Breeze AI · Internal contact notification · Do not forward
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }
}
