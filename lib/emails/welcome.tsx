export function welcomeEmail(name: string): { subject: string; html: string } {
  const firstName = name.split(' ')[0]
  return {
    subject: `Welcome to Good Breeze AI, ${firstName}`,
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
          <h1 style="margin:0 0 12px;font-size:28px;font-weight:700;color:#ffffff;">Welcome, ${firstName} 👋</h1>
          <p style="margin:0 0 24px;font-size:16px;color:#a1a1aa;line-height:1.6;">
            You're in. Your Good Breeze AI account is ready and your first report is on us.
          </p>

          <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr>
              <td style="background:#1d1d1f;border:1px solid #27272a;border-radius:12px;padding:20px 24px;margin-bottom:12px;">
                <p style="margin:0 0 4px;font-size:13px;color:#71717a;font-weight:500;">YOUR FREE REPORT</p>
                <p style="margin:0;font-size:15px;color:#ffffff;">Run any free report — Head to Head Analyzer or AI SEO Optimizer. No credit card needed.</p>
              </td>
            </tr>
          </table>

          <a href="https://goodbreeze.ai/tools" style="display:inline-block;background:linear-gradient(135deg,#22d3ee,#3b82f6);color:#09090b;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none;">
            Run your first report →
          </a>
        </td></tr>

        <!-- What you can do -->
        <tr><td style="padding:32px 0 0;">
          <h2 style="margin:0 0 16px;font-size:18px;font-weight:700;color:#ffffff;">What you can do with Good Breeze AI</h2>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:20px;width:48%;vertical-align:top;">
                <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#22d3ee;">Competitive Analyzer</p>
                <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.5;">AI-generated head-to-head, top 3 competitor, and market position reports.</p>
              </td>
              <td style="width:4%;"></td>
              <td style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:20px;width:48%;vertical-align:top;">
                <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#22d3ee;">SEO Auditor</p>
                <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.5;">Technical audits, keyword research, landing page optimization, and AI SEO recommendations.</p>
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
