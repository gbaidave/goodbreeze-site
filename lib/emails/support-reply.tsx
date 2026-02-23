export function supportReplyEmail(
  name: string,
  replyMessage: string,
): { subject: string; html: string } {
  return {
    subject: `Good Breeze AI — Reply to your support request`,
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
          <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#ffffff;">We replied to your support request</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#71717a;">Hi ${name}, here's our response:</p>

          <!-- Reply message -->
          <div style="background:#09090b;border:1px solid #27272a;border-radius:10px;padding:20px;margin-bottom:24px;">
            <p style="margin:0;font-size:15px;color:#ffffff;line-height:1.7;white-space:pre-wrap;">${replyMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
          </div>

          <!-- CTA -->
          <p style="margin:0;font-size:13px;color:#71717a;line-height:1.6;">
            If you have follow-up questions, sign in to your dashboard and submit a new request, or reply to this email.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 0 0;">
          <p style="margin:0;font-size:12px;color:#3f3f46;">
            Good Breeze AI · <a href="https://goodbreeze.ai/support" style="color:#52525b;text-decoration:none;">Support Center</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }
}
