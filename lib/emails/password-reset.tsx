/**
 * Password reset email sent from the account settings Security section.
 * Triggered server-side via /api/auth/send-password-reset to bypass CAPTCHA
 * requirement on Supabase's /recover endpoint.
 */

export function passwordResetEmail(
  name: string,
  resetLink: string
): { subject: string; html: string } {
  const firstName = name.split(' ')[0]

  return {
    subject: 'Reset your Good Breeze AI password',
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
          <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#ffffff;">Reset your password</h1>
          <p style="margin:0 0 28px;font-size:16px;color:#a1a1aa;line-height:1.6;">
            Hi ${firstName}, click the button below to reset your password. This link expires in 1 hour.
          </p>

          <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#22d3ee,#3b82f6);color:#09090b;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none;">
            Reset password →
          </a>

          <div style="background:#27272a;border-radius:10px;padding:20px;margin-top:28px;">
            <p style="margin:0;font-size:14px;color:#a1a1aa;line-height:1.6;">
              If you did not request a password reset, you can safely ignore this email.
              Your password will not change.
            </p>
          </div>
        </td></tr>

        <tr><td style="padding:32px 0 0;border-top:1px solid #27272a;">
          <p style="margin:0;font-size:13px;color:#52525b;line-height:1.6;">
            Good Breeze AI · AI Operations That Scale Your Business<br>
            <a href="https://goodbreeze.ai" style="color:#22d3ee;text-decoration:none;">goodbreeze.ai</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }
}
