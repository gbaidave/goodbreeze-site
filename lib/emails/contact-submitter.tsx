interface ContactSubmitterData {
  name: string
  message: string
}

export function contactSubmitterEmail(data: ContactSubmitterData): { subject: string; html: string } {
  const { name, message } = data
  const firstName = name.split(' ')[0] || name
  const safeMessage = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '<br>')

  return {
    subject: `We received your message, ${firstName}`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Logo -->
        <tr><td style="padding-bottom:32px;">
          <span style="font-size:20px;font-weight:700;color:#ffffff;">Good Breeze <span style="color:#22d3ee;">AI</span></span>
        </td></tr>

        <!-- Hero -->
        <tr><td style="background:#18181b;border:1px solid #27272a;border-radius:16px;padding:40px;">
          <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#ffffff;">Thanks for reaching out, ${firstName}</h1>
          <p style="margin:0 0 20px;font-size:15px;color:#a1a1aa;line-height:1.6;">
            We received your message and will get back to you within 1 business day.
          </p>

          <!-- Message echo -->
          <h2 style="margin:24px 0 12px;font-size:13px;font-weight:600;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.05em;">Your message</h2>
          <div style="background:#09090b;border:1px solid #27272a;border-radius:10px;padding:20px;">
            <p style="margin:0;font-size:15px;color:#ffffff;line-height:1.7;white-space:pre-wrap;">${safeMessage(message)}</p>
          </div>

          <!-- CTA: book a call -->
          <p style="margin:28px 0 12px;font-size:15px;color:#a1a1aa;line-height:1.6;">
            Need something sooner? Book a free 30-minute strategy call.
          </p>
          <a href="https://calendly.com/dave-goodbreeze/30min" style="display:inline-block;background:linear-gradient(135deg,#22d3ee,#3b82f6);color:#09090b;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none;">
            Book a strategy call →
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 0 0;">
          <p style="margin:0 0 4px;font-size:12px;color:#3f3f46;">
            Good Breeze AI · <a href="https://goodbreeze.ai" style="color:#3f3f46;text-decoration:none;">goodbreeze.ai</a>
          </p>
          <p style="margin:0;font-size:12px;color:#3f3f46;">
            You're receiving this because you submitted the contact form.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }
}
