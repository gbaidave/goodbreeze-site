export function creditGrantedEmail(
  name: string,
  credits: number
): { subject: string; html: string } {
  const firstName = name.split(' ')[0]
  const subject = `You received ${credits} free credit${credits !== 1 ? 's' : ''} from Good Breeze AI`

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
          <p style="margin:0 0 8px;font-size:32px;">🎁</p>
          <h1 style="margin:0 0 12px;font-size:26px;font-weight:700;color:#ffffff;">Credits added to your account</h1>
          <p style="margin:0 0 28px;font-size:16px;color:#a1a1aa;line-height:1.6;">
            Hey ${firstName}, the Good Breeze AI team added credits to your account. They're ready to use right now.
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" style="background:#27272a;border-radius:10px;padding:20px;margin-bottom:28px;">
            <tr>
              <td style="font-size:14px;color:#a1a1aa;">Credits added</td>
              <td align="right" style="font-size:14px;font-weight:600;color:#22d3ee;">${credits} credit${credits !== 1 ? 's' : ''}</td>
            </tr>
            <tr><td colspan="2" style="padding:8px 0;"><hr style="border:none;border-top:1px solid #3f3f46;"></td></tr>
            <tr>
              <td style="font-size:14px;color:#a1a1aa;">Cost</td>
              <td align="right" style="font-size:14px;font-weight:600;color:#ffffff;">Complimentary</td>
            </tr>
          </table>

          <a href="https://goodbreeze.ai/dashboard" style="display:inline-block;background:linear-gradient(135deg,#22d3ee,#3b82f6);color:#09090b;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none;">
            Go to dashboard →
          </a>
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
