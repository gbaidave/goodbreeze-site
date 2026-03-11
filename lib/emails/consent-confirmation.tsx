export function consentConfirmationEmail(data: {
  userName: string
  userEmail: string
  ipAddress: string
  userAgent: string
  consentTextVersion: string
  consentText: string
  consentedAt: string  // ISO string
}): { subject: string; html: string } {
  const { userName, userEmail, ipAddress, userAgent, consentTextVersion, consentText, consentedAt } = data
  const firstName = userName.split(' ')[0]

  // Format date in a clear, human-readable way
  const date = new Date(consentedAt)
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'America/Los_Angeles',
  })
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
    timeZone: 'America/Los_Angeles',
  })

  // Escape consent text for HTML display (preserve line breaks)
  const consentHtml = consentText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .split('\n\n')
    .map((p: string) => `<p style="margin:0 0 12px;font-size:13px;color:#a1a1aa;line-height:1.7;">${p.replace(/\n/g, '<br>')}</p>`)
    .join('')

  return {
    subject: `Your Good Breeze AI Media Release Confirmation`,
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

        <!-- Header card -->
        <tr><td style="background:#18181b;border:1px solid #27272a;border-radius:16px;padding:40px;">
          <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#22d3ee;text-transform:uppercase;letter-spacing:0.05em;">Media Release Confirmation</p>
          <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#ffffff;">Thanks for sharing your story, ${firstName}.</h1>
          <p style="margin:0;font-size:15px;color:#a1a1aa;line-height:1.6;">
            This email confirms that you electronically signed the Good Breeze AI Media Release Authorization.
            Keep it for your records — it's your copy of what you agreed to.
          </p>
        </td></tr>

        <!-- Signing details -->
        <tr><td style="padding-top:24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;">
            <tr><td style="padding:20px 24px;border-bottom:1px solid #27272a;">
              <p style="margin:0;font-size:12px;font-weight:600;color:#ffffff;text-transform:uppercase;letter-spacing:0.05em;">Signing Record</p>
            </td></tr>
            <tr><td style="padding:20px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:6px 0;width:140px;vertical-align:top;">
                    <span style="font-size:12px;color:#52525b;">Name</span>
                  </td>
                  <td style="padding:6px 0;">
                    <span style="font-size:12px;color:#e4e4e7;">${userName}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;vertical-align:top;">
                    <span style="font-size:12px;color:#52525b;">Email</span>
                  </td>
                  <td style="padding:6px 0;">
                    <span style="font-size:12px;color:#e4e4e7;">${userEmail}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;vertical-align:top;">
                    <span style="font-size:12px;color:#52525b;">Date</span>
                  </td>
                  <td style="padding:6px 0;">
                    <span style="font-size:12px;color:#e4e4e7;">${formattedDate}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;vertical-align:top;">
                    <span style="font-size:12px;color:#52525b;">Time</span>
                  </td>
                  <td style="padding:6px 0;">
                    <span style="font-size:12px;color:#e4e4e7;">${formattedTime}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;vertical-align:top;">
                    <span style="font-size:12px;color:#52525b;">IP Address</span>
                  </td>
                  <td style="padding:6px 0;">
                    <span style="font-size:12px;color:#e4e4e7;font-family:monospace;">${ipAddress || 'Not recorded'}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;vertical-align:top;">
                    <span style="font-size:12px;color:#52525b;">Browser</span>
                  </td>
                  <td style="padding:6px 0;">
                    <span style="font-size:12px;color:#e4e4e7;font-family:monospace;">${(userAgent || 'Not recorded').slice(0, 80)}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;vertical-align:top;">
                    <span style="font-size:12px;color:#52525b;">Release Version</span>
                  </td>
                  <td style="padding:6px 0;">
                    <span style="font-size:12px;color:#e4e4e7;">${consentTextVersion}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;vertical-align:top;">
                    <span style="font-size:12px;color:#52525b;">Method</span>
                  </td>
                  <td style="padding:6px 0;">
                    <span style="font-size:12px;color:#e4e4e7;">Electronic checkbox on goodbreeze.ai/testimonials/submit</span>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <!-- Full consent text -->
        <tr><td style="padding-top:24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;">
            <tr><td style="padding:20px 24px;border-bottom:1px solid #27272a;">
              <p style="margin:0;font-size:12px;font-weight:600;color:#ffffff;text-transform:uppercase;letter-spacing:0.05em;">Media Release Authorization — ${consentTextVersion}</p>
            </td></tr>
            <tr><td style="padding:20px 24px;">
              ${consentHtml}
            </td></tr>
          </table>
        </td></tr>

        <!-- Revocation note -->
        <tr><td style="padding-top:24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#18181b;border:1px solid #27272a;border-radius:16px;padding:20px 24px;">
            <tr><td>
              <p style="margin:0 0 8px;font-size:13px;color:#a1a1aa;line-height:1.6;">
                <strong style="color:#e4e4e7;">Need a fresh copy?</strong> File a support request at
                <a href="https://goodbreeze.ai/support" style="color:#22d3ee;text-decoration:none;">goodbreeze.ai/support</a>
                and we'll resend this confirmation.
              </p>
              <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.6;">
                <strong style="color:#e4e4e7;">Want to revoke?</strong> Send a written notice to
                <a href="mailto:support@goodbreeze.ai" style="color:#22d3ee;text-decoration:none;">support@goodbreeze.ai</a>.
                Revocation won't affect content already published.
              </p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:32px 0 0;">
          <p style="margin:0;font-size:12px;color:#52525b;line-height:1.6;">
            Good Breeze AI LLC · AI Operations That Scale Your Business<br>
            <a href="https://goodbreeze.ai" style="color:#22d3ee;text-decoration:none;">goodbreeze.ai</a> ·
            <a href="https://goodbreeze.ai/privacy" style="color:#52525b;text-decoration:none;">Privacy Policy</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }
}
