interface SupportClosedData {
  userName: string
  closeReason: string
}

export function supportClosedEmail(data: SupportClosedData): { subject: string; html: string } {
  const { userName, closeReason } = data
  return {
    subject: 'Good Breeze AI — Your support request has been closed',
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
          <span style="font-size:13px;color:#71717a;margin-left:8px;">Support</span>
        </td></tr>

        <!-- Main card -->
        <tr><td style="background:#18181b;border:1px solid #27272a;border-radius:16px;padding:32px;">
          <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#ffffff;">Your support request has been closed</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#71717a;">Hi ${userName},</p>

          <p style="margin:0 0 20px;font-size:15px;color:#a1a1aa;line-height:1.6;">
            We've closed your support request. Here's the reason from our team:
          </p>

          <!-- Reason box -->
          <div style="background:#09090b;border:1px solid #27272a;border-radius:10px;padding:20px;margin-bottom:24px;">
            <p style="margin:0;font-size:15px;color:#ffffff;line-height:1.7;white-space:pre-wrap;">${closeReason}</p>
          </div>

          <p style="margin:0 0 24px;font-size:14px;color:#71717a;line-height:1.6;">
            If your issue isn't resolved or you have additional questions, you can reopen this request from your dashboard or submit a new one.
          </p>

          <!-- CTA -->
          <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://goodbreeze.ai'}/support"
             style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#22d3ee,#3b82f6);color:#ffffff;font-weight:600;font-size:14px;text-decoration:none;border-radius:999px;">
            View your support requests
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 0 0;">
          <p style="margin:0;font-size:12px;color:#3f3f46;">Good Breeze AI · goodbreeze.ai</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }
}
