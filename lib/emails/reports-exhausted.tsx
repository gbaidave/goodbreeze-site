export interface ExhaustedEmailPlan {
  name: string          // e.g. "Starter Plan"
  creditsGranted: number // monthly allowance
  priceUsdCents: number  // monthly price in cents
}

export interface ExhaustedEmailPack {
  name: string          // e.g. "Boost Pack"
  creditsGranted: number
  priceUsdCents: number
}

export interface ReportsExhaustedEmailProps {
  name: string
  plans: ExhaustedEmailPlan[]  // active subscription plans, display order already applied
  packs: ExhaustedEmailPack[]  // active credit packs, display order already applied
}

function formatUsd(cents: number): string {
  return `$${Math.round(cents / 100)}`
}

export function reportsExhaustedEmail(props: ReportsExhaustedEmailProps): { subject: string; html: string } {
  const { name, plans, packs } = props
  const firstName = name.split(' ')[0]

  // Plans card summary
  const minPlanPriceCents = plans.length ? Math.min(...plans.map(p => p.priceUsdCents)) : 0
  const minPlanPrice = minPlanPriceCents ? formatUsd(minPlanPriceCents) : ''
  const minCredits = plans.length ? Math.min(...plans.map(p => p.creditsGranted)) : 0
  const maxCredits = plans.length ? Math.max(...plans.map(p => p.creditsGranted)) : 0
  const planNames = plans.map(p => p.name.replace(/\s+Plan$/i, '')).join(' / ')
  const creditsRange = minCredits === maxCredits ? `${minCredits}` : `${minCredits} to ${maxCredits}`

  // Pack card: feature the highest-credit active pack (best value message)
  const featuredPack = packs.length
    ? [...packs].sort((a, b) => b.creditsGranted - a.creditsGranted)[0]
    : null

  const plansBlock = plans.length ? `
            <tr>
              <td style="background:#1d1d1f;border:1px solid #27272a;border-radius:12px;padding:20px 24px;margin-bottom:12px;">
                <p style="margin:0 0 4px;font-size:13px;color:#22d3ee;font-weight:600;">MONTHLY PLANS${minPlanPrice ? ` from ${minPlanPrice}/month` : ''}</p>
                <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#ffffff;">${planNames}</p>
                <p style="margin:0;font-size:14px;color:#a1a1aa;line-height:1.5;">${creditsRange} reports per month across all tools. Pick the plan that fits your volume.</p>
              </td>
            </tr>
            <tr><td style="height:8px;"></td></tr>` : ''

  const packBlock = featuredPack ? `
            <tr>
              <td style="background:#1d1d1f;border:1px solid #27272a;border-radius:12px;padding:20px 24px;">
                <p style="margin:0 0 4px;font-size:13px;color:#71717a;font-weight:600;">FLEXIBLE, ${formatUsd(featuredPack.priceUsdCents)} one-time</p>
                <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#ffffff;">${featuredPack.creditsGranted}-Credit Pack</p>
                <p style="margin:0;font-size:14px;color:#a1a1aa;line-height:1.5;">Pay once, use when you need them. No subscription required.</p>
              </td>
            </tr>` : ''

  return {
    subject: `Your Good Breeze AI credits are done. Here's what's next.`,
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
          <h1 style="margin:0 0 12px;font-size:28px;font-weight:700;color:#ffffff;">You're out of credits, ${firstName}</h1>
          <p style="margin:0 0 24px;font-size:16px;color:#a1a1aa;line-height:1.6;">
            You've used your credits. Here's how to get more.
          </p>

          <!-- Options -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">${plansBlock}${packBlock}
          </table>

          <a href="https://goodbreeze.ai/pricing" style="display:inline-block;background:linear-gradient(135deg,#22d3ee,#3b82f6);color:#09090b;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none;">
            See pricing options →
          </a>
        </td></tr>

        <!-- Free credit options -->
        <tr><td style="padding:28px 0 0;">
          <h2 style="margin:0 0 4px;font-size:16px;font-weight:700;color:#ffffff;">Or earn credits</h2>
          <p style="margin:0 0 16px;font-size:14px;color:#71717a;">Two easy ways to get more credits:</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:20px;width:48%;vertical-align:top;">
                <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#22d3ee;">Refer a friend</p>
                <p style="margin:0 0 12px;font-size:13px;color:#a1a1aa;line-height:1.5;">Share your referral link. Earn 3 credits for every person who signs up.</p>
                <a href="https://goodbreeze.ai/dashboard" style="font-size:13px;color:#22d3ee;text-decoration:none;">Get your link →</a>
              </td>
              <td style="width:4%;"></td>
              <td style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:20px;width:48%;vertical-align:top;">
                <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#22d3ee;">Share your experience</p>
                <p style="margin:0 0 12px;font-size:13px;color:#a1a1aa;line-height:1.5;">Written testimonial = 1 credit. Video testimonial = 5 credits. Takes 5 minutes.</p>
                <a href="https://goodbreeze.ai/testimonials/submit" style="font-size:13px;color:#22d3ee;text-decoration:none;">Submit now →</a>
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
