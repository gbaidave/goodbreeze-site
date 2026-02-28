/**
 * Admin notification email sent when a user submits a testimonial.
 * Goes to ADMIN_EMAIL (or dave@goodbreeze.ai) immediately on submission.
 */

interface TestimonialAdminNotificationData {
  userName: string
  userEmail: string
  type: 'written' | 'video'
  pullQuote: string
  content?: string    // written testimonials
  videoUrl?: string   // video testimonials
  creditsGranted: number
}

export function testimonialAdminNotificationEmail(
  data: TestimonialAdminNotificationData
): { subject: string; html: string } {
  const { userName, userEmail, type, pullQuote, content, videoUrl, creditsGranted } = data

  const typeLabel = type === 'written' ? 'Written' : 'Video'
  const creditLabel = creditsGranted === 1 ? '1 credit' : `${creditsGranted} credits`

  const bodySection = type === 'written' && content
    ? `<h2 style="margin:20px 0 8px;font-size:13px;font-weight:600;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.05em;">Testimonial</h2>
       <div style="background:#09090b;border:1px solid #27272a;border-radius:10px;padding:16px;">
         <p style="margin:0;font-size:14px;color:#ffffff;line-height:1.7;white-space:pre-wrap;">${content}</p>
       </div>`
    : type === 'video' && videoUrl
    ? `<h2 style="margin:20px 0 8px;font-size:13px;font-weight:600;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.05em;">Video link</h2>
       <div style="background:#09090b;border:1px solid #27272a;border-radius:10px;padding:16px;">
         <a href="${videoUrl}" style="color:#22d3ee;text-decoration:none;font-size:14px;">${videoUrl}</a>
       </div>`
    : ''

  return {
    subject: `[Testimonial] ${userName} submitted a ${type} testimonial`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Logo -->
        <tr><td style="padding-bottom:24px;">
          <span style="font-size:18px;font-weight:700;color:#ffffff;">Good Breeze <span style="color:#22d3ee;">AI</span></span>
          <span style="font-size:13px;color:#71717a;margin-left:8px;">New Testimonial</span>
        </td></tr>

        <!-- Main card -->
        <tr><td style="background:#18181b;border:1px solid #27272a;border-radius:16px;padding:32px;">
          <h1 style="margin:0 0 20px;font-size:20px;font-weight:700;color:#ffffff;">New ${typeLabel} Testimonial</h1>

          <!-- User info -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:0;background:#09090b;border:1px solid #27272a;border-radius:10px;padding:16px;">
            <tr>
              <td style="font-size:13px;color:#71717a;padding-bottom:8px;width:100px;vertical-align:top;">Name</td>
              <td style="font-size:13px;color:#ffffff;padding-bottom:8px;">${userName}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#71717a;padding-bottom:8px;vertical-align:top;">Email</td>
              <td style="font-size:13px;padding-bottom:8px;">
                <a href="mailto:${userEmail}" style="color:#22d3ee;text-decoration:none;">${userEmail}</a>
              </td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#71717a;padding-bottom:8px;vertical-align:top;">Type</td>
              <td style="font-size:13px;color:#ffffff;padding-bottom:8px;">${typeLabel}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#71717a;vertical-align:top;">Credits</td>
              <td style="font-size:13px;color:#22d3ee;">${creditLabel} granted</td>
            </tr>
          </table>

          <!-- Pull quote -->
          <h2 style="margin:20px 0 8px;font-size:13px;font-weight:600;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.05em;">Headline (pull quote)</h2>
          <div style="background:#09090b;border:1px solid #27272a;border-radius:10px;padding:16px;">
            <p style="margin:0;font-size:15px;font-weight:600;color:#ffffff;">"${pullQuote}"</p>
          </div>

          ${bodySection}

          <!-- CTA -->
          <p style="margin:24px 0 0;font-size:13px;color:#71717a;">
            Review and publish via the admin panel.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 0 0;">
          <p style="margin:0;font-size:12px;color:#3f3f46;">
            Good Breeze AI · Internal notification · Do not forward
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }
}
