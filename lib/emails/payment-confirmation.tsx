export interface PaymentConfirmationEmailProps {
  name: string
  productName: string
  productType: 'subscription_plan' | 'credit_pack'
  amountStr: string          // e.g. "$20.00"
  creditsGranted: number     // credits delivered by this purchase (plan monthly allowance OR pack size)
  receiptRef?: string
}

export function paymentConfirmationEmail(props: PaymentConfirmationEmailProps): { subject: string; html: string } {
  const { name, productName, productType, amountStr, creditsGranted, receiptRef } = props
  const firstName = name.split(' ')[0]
  const isSubscription = productType === 'subscription_plan'
  const creditsLine = isSubscription
    ? `${creditsGranted} credits/month`
    : `${creditsGranted} credit${creditsGranted === 1 ? '' : 's'}`

  const receiptNum = receiptRef ? receiptRef.slice(-8).toUpperCase() : null
  const subject = receiptNum
    ? `Your receipt from Good Breeze AI #${receiptNum}`
    : isSubscription
      ? `You're on ${productName}. Your credits are ready.`
      : `Payment confirmed. Your credits are ready.`

  return {
    subject,
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
          <p style="margin:0 0 8px;font-size:32px;">✅</p>
          <h1 style="margin:0 0 12px;font-size:26px;font-weight:700;color:#ffffff;">Payment confirmed</h1>
          <p style="margin:0 0 28px;font-size:16px;color:#a1a1aa;line-height:1.6;">
            Hey ${firstName}, thanks for your purchase. Here's what you got:
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" style="background:#27272a;border-radius:10px;padding:20px;margin-bottom:28px;">
            <tr>
              <td style="font-size:14px;color:#a1a1aa;">${isSubscription ? 'Plan' : 'Purchase'}</td>
              <td align="right" style="font-size:14px;font-weight:600;color:#ffffff;">${productName}</td>
            </tr>
            <tr><td colspan="2" style="padding:8px 0;"><hr style="border:none;border-top:1px solid #3f3f46;"></td></tr>
            <tr>
              <td style="font-size:14px;color:#a1a1aa;">${isSubscription ? 'Credits' : 'Credits added'}</td>
              <td align="right" style="font-size:14px;font-weight:600;color:#22d3ee;">${creditsLine}</td>
            </tr>
            <tr><td colspan="2" style="padding:8px 0;"><hr style="border:none;border-top:1px solid #3f3f46;"></td></tr>
            <tr>
              <td style="font-size:14px;color:#a1a1aa;">Amount charged</td>
              <td align="right" style="font-size:14px;font-weight:600;color:#ffffff;">${amountStr}</td>
            </tr>
          </table>

          <a href="https://goodbreeze.ai/dashboard" style="display:inline-block;background:linear-gradient(135deg,#22d3ee,#3b82f6);color:#09090b;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none;">
            Go to dashboard →
          </a>
        </td></tr>

        <tr><td style="padding:32px 0 0;border-top:1px solid #27272a;">
          <p style="margin:0 0 8px;font-size:13px;color:#52525b;line-height:1.6;">
            Good Breeze AI · AI Operations That Scale Your Business<br>
            <a href="https://goodbreeze.ai" style="color:#22d3ee;text-decoration:none;">goodbreeze.ai</a> ·
            <a href="https://goodbreeze.ai/unsubscribe" style="color:#52525b;text-decoration:none;">Unsubscribe</a>
          </p>
          <p style="margin:0;font-size:12px;color:#3f3f46;line-height:1.6;">
            View our <a href="https://goodbreeze.ai/refund-policy" style="color:#3f3f46;text-decoration:underline;">Refund Policy</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }
}
