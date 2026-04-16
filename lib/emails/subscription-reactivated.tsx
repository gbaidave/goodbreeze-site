export function subscriptionReactivatedEmail(data: {
  userName: string
  planLabel: string
  periodEndDate: string
}): { subject: string; html: string } {
  const { userName, planLabel, periodEndDate } = data
  const firstName = userName ? userName.split(' ')[0] : 'there'

  return {
    subject: `Your ${planLabel} is back on`,
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

        <!-- Main card -->
        <tr><td style="background:#18181b;border:1px solid #27272a;border-radius:16px;padding:40px;">
          <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#ffffff;">Welcome back, ${firstName}</h1>
          <p style="margin:0 0 20px;font-size:16px;color:#a1a1aa;line-height:1.6;">
            Your ${planLabel} is active again — the scheduled cancellation has been removed. Your plan will renew as usual.
          </p>

          <!-- Details panel -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:#09090b;border:1px solid #27272a;border-radius:10px;padding:16px;">
            <tr>
              <td style="font-size:13px;color:#71717a;padding-bottom:8px;width:140px;vertical-align:top;">Plan</td>
              <td style="font-size:13px;color:#ffffff;padding-bottom:8px;">${planLabel}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#71717a;vertical-align:top;">Renews</td>
              <td style="font-size:13px;color:#ffffff;">${periodEndDate}</td>
            </tr>
          </table>

          <a href="https://goodbreeze.ai/tools" style="display:inline-block;background:linear-gradient(135deg,#22d3ee,#3b82f6);color:#09090b;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none;">
            Run your next report →
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 0 0;">
          <p style="margin:0;font-size:12px;color:#3f3f46;">
            Good Breeze AI · <a href="https://goodbreeze.ai" style="color:#52525b;text-decoration:none;">goodbreeze.ai</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }
}
