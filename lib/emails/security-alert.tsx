/**
 * Security alert email sent to the user when sensitive account info changes.
 * Currently used for: phone number update.
 */

type SecurityAlertAction = 'phone_changed'

const ACTION_LABELS: Record<SecurityAlertAction, { title: string; description: string }> = {
  phone_changed: {
    title: 'Your phone number was updated',
    description: 'The phone number on your Good Breeze AI account was just updated.',
  },
}

export function securityAlertEmail(
  name: string,
  action: SecurityAlertAction
): { subject: string; html: string } {
  const firstName = name.split(' ')[0]
  const { title, description } = ACTION_LABELS[action]

  return {
    subject: `Security notice: ${title.toLowerCase()}`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <tr><td style="padding-bottom:32px;">
          <span style="font-size:20px;font-weight:700;color:#ffffff;">Good Breeze <span style="color:#22d3ee;">AI</span></span>
        </td></tr>

        <tr><td style="background:#18181b;border:1px solid #27272a;border-radius:16px;padding:40px;">
          <p style="margin:0 0 8px;font-size:28px;">🔒</p>
          <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#ffffff;">${title}</h1>
          <p style="margin:0 0 28px;font-size:16px;color:#a1a1aa;line-height:1.6;">
            Hi ${firstName}, ${description}
          </p>

          <div style="background:#27272a;border-radius:10px;padding:20px;margin-bottom:28px;">
            <p style="margin:0;font-size:14px;color:#a1a1aa;line-height:1.6;">
              If you made this change, no further action is needed.
            </p>
            <p style="margin:12px 0 0;font-size:14px;color:#a1a1aa;line-height:1.6;">
              If you did <strong style="color:#ffffff;">not</strong> make this change, please contact us immediately at
              <a href="mailto:support@goodbreeze.ai" style="color:#22d3ee;text-decoration:none;">support@goodbreeze.ai</a>.
            </p>
          </div>

          <a href="https://goodbreeze.ai/account" style="display:inline-block;background:linear-gradient(135deg,#22d3ee,#3b82f6);color:#09090b;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none;">
            Review account settings →
          </a>
        </td></tr>

        <tr><td style="padding:32px 0 0;border-top:1px solid #27272a;">
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
