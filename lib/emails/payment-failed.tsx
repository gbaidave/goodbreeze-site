export function paymentFailedEmail(name: string): { subject: string; html: string } {
  const firstName = name.split(' ')[0]
  return {
    subject: `Action needed — payment failed for your Good Breeze AI subscription`,
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

        <tr><td style="background:#18181b;border:1px solid #ef4444;border-radius:16px;padding:40px;">
          <p style="margin:0 0 8px;font-size:32px;">⚠️</p>
          <h1 style="margin:0 0 12px;font-size:26px;font-weight:700;color:#ffffff;">Payment failed</h1>
          <p style="margin:0 0 24px;font-size:16px;color:#a1a1aa;line-height:1.6;">
            Hey ${firstName}, we weren't able to process your payment for your Starter subscription. Please update your payment method to keep access to your reports.
          </p>
          <a href="https://goodbreeze.ai/account" style="display:inline-block;background:#ef4444;color:#ffffff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none;">
            Update payment method →
          </a>
        </td></tr>

        <tr><td style="padding:32px 0 0;">
          <p style="margin:0;font-size:13px;color:#52525b;">
            Good Breeze AI · <a href="https://goodbreeze.ai" style="color:#22d3ee;text-decoration:none;">goodbreeze.ai</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }
}
