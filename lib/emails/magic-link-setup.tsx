export function magicLinkSetupEmail(
  magicLink: string,
  reportTypeLabel: string
): { subject: string; html: string } {
  return {
    subject: `Your ${reportTypeLabel} report is running — access your account`,
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
          <h1 style="margin:0 0 12px;font-size:28px;font-weight:700;color:#ffffff;">Your report is running</h1>
          <p style="margin:0 0 24px;font-size:16px;color:#a1a1aa;line-height:1.6;">
            We've started your <strong style="color:#ffffff;">${reportTypeLabel}</strong> report.
            We also created a Good Breeze AI account for you so you can access it when it's ready.
          </p>

          <!-- Status pill -->
          <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr>
              <td style="background:#0c2a2a;border:1px solid #1a4a4a;border-radius:12px;padding:16px 20px;">
                <p style="margin:0 0 4px;font-size:12px;color:#22d3ee;font-weight:600;letter-spacing:0.05em;">REPORT STATUS</p>
                <p style="margin:0;font-size:15px;color:#ffffff;">Processing — usually ready in a few minutes</p>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 20px;font-size:15px;color:#a1a1aa;line-height:1.6;">
            Click below to access your account. This link signs you in automatically — no password needed.
          </p>

          <a href="${magicLink}" style="display:inline-block;background:linear-gradient(135deg,#22d3ee,#3b82f6);color:#09090b;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none;">
            Access my account →
          </a>

          <p style="margin:24px 0 0;font-size:13px;color:#52525b;line-height:1.6;">
            This link expires in 1 hour and can only be used once. If it doesn't work,
            go to <a href="https://goodbreeze.ai/login" style="color:#22d3ee;text-decoration:none;">goodbreeze.ai/login</a>
            and request a new link with this email address.
          </p>
        </td></tr>

        <!-- What happens next -->
        <tr><td style="padding:32px 0 0;">
          <h2 style="margin:0 0 16px;font-size:18px;font-weight:700;color:#ffffff;">What happens next</h2>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:20px;vertical-align:top;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom:16px;">
                      <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#22d3ee;">1. Report finishes</p>
                      <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.5;">We'll email you when your PDF is ready to download.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:16px;">
                      <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#22d3ee;">2. Set a password (optional)</p>
                      <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.5;">Once logged in, you can set a password from your account settings — or keep using magic links.</p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#22d3ee;">3. Run more reports</p>
                      <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.5;">Your account includes one free report per tool. Upgrade anytime for more reports.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:32px 0 0;border-top:1px solid #27272a;margin-top:32px;">
          <p style="margin:0;font-size:13px;color:#52525b;line-height:1.6;">
            Good Breeze AI · AI Operations That Scale Your Business<br>
            <a href="https://goodbreeze.ai" style="color:#22d3ee;text-decoration:none;">goodbreeze.ai</a> ·
            <a href="https://goodbreeze.ai/unsubscribe" style="color:#52525b;text-decoration:none;">Unsubscribe</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }
}
