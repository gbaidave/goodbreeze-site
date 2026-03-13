export function refundProcessedEmail(data: {
  userName: string
  productLabel: string
  amountStr?: string
}): { subject: string; html: string } {
  const { userName, productLabel, amountStr } = data
  const firstName = userName ? userName.split(' ')[0] : 'there'
  const amountLine = amountStr ? ` of ${amountStr}` : ''

  return {
    subject: 'Your refund has been processed — Good Breeze AI',
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111118;border-radius:12px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">

      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:32px 40px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.08);">
        <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Good Breeze AI</p>
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:40px;">
        <p style="margin:0 0 24px;font-size:18px;font-weight:600;color:#ffffff;">Hi ${firstName},</p>
        <p style="margin:0 0 20px;font-size:15px;color:#a1a1aa;line-height:1.7;">
          Your refund${amountLine} for <strong style="color:#e4e4e7;">${productLabel}</strong> has been approved and processed.
        </p>
        <p style="margin:0 0 24px;font-size:15px;color:#a1a1aa;line-height:1.7;">
          The refund will appear on your original payment method. Timing depends on your bank or card issuer.
        </p>
        <p style="margin:0;font-size:14px;color:#a1a1aa;line-height:1.7;">
          If you have any questions, contact us at <a href="mailto:support@goodbreeze.ai" style="color:#6366f1;text-decoration:none;">support@goodbreeze.ai</a>.
        </p>
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
        <p style="margin:0;font-size:12px;color:#52525b;">Good Breeze AI &bull; goodbreeze.ai</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`,
  }
}
