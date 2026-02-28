export function paymentConfirmationEmail(
  name: string,
  plan: string,
  amount: string
): { subject: string; html: string } {
  const firstName = name.split(' ')[0]

  const SUBSCRIPTION_PLANS: Record<string, { label: string; reports: string; price: string }> = {
    starter: { label: 'Starter Plan', reports: '25 reports/month', price: '$20/month' },
    growth:  { label: 'Growth Plan',  reports: '40 reports/month', price: '$30/month' },
    pro:     { label: 'Pro Plan',     reports: '50 reports/month', price: '$40/month' },
  }

  const PACK_PLANS: Record<string, { label: string; credits: string }> = {
    'Spark Pack': { label: 'Spark Pack', credits: '3 reports' },
    'Boost Pack': { label: 'Boost Pack', credits: '10 reports' },
  }

  const sub = SUBSCRIPTION_PLANS[plan]
  const pack = PACK_PLANS[plan]

  const isSubscription = !!sub
  const planLabel = sub?.label ?? pack?.label ?? plan
  const reportsLine = sub?.reports ?? pack?.credits ?? 'Credits added'
  const priceLine = sub?.price ?? amount

  const subject = isSubscription
    ? `You're on ${planLabel}. Your reports are ready.`
    : `Payment confirmed. Your reports are ready.`

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
              <td style="font-size:14px;color:#a1a1aa;">Plan</td>
              <td align="right" style="font-size:14px;font-weight:600;color:#ffffff;">${planLabel}</td>
            </tr>
            <tr><td colspan="2" style="padding:8px 0;"><hr style="border:none;border-top:1px solid #3f3f46;"></td></tr>
            <tr>
              <td style="font-size:14px;color:#a1a1aa;">${isSubscription ? 'Reports' : 'Credits added'}</td>
              <td align="right" style="font-size:14px;font-weight:600;color:#22d3ee;">${reportsLine}</td>
            </tr>
            <tr><td colspan="2" style="padding:8px 0;"><hr style="border:none;border-top:1px solid #3f3f46;"></td></tr>
            <tr>
              <td style="font-size:14px;color:#a1a1aa;">Amount charged</td>
              <td align="right" style="font-size:14px;font-weight:600;color:#ffffff;">${amount}</td>
            </tr>
          </table>

          <a href="https://goodbreeze.ai/dashboard" style="display:inline-block;background:linear-gradient(135deg,#22d3ee,#3b82f6);color:#09090b;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none;">
            Go to dashboard →
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
