/**
 * Central email sending utility.
 * All transactional emails go through here.
 *
 * Every function:
 * 1. Builds subject + html from the relevant template
 * 2. Sends via Resend
 * 3. Logs the result (success or failure) to email_logs via logEmail()
 *    — fire-and-forget so logging never blocks the email response
 * 4. On failure with a known userId, logEmail() also writes an email_failed notification
 */

import { resend, FROM, FROM_NAME, REPLY_TO } from './resend'
import { welcomeEmail } from './emails/welcome'
import { paymentConfirmationEmail } from './emails/payment-confirmation'
import { paymentFailedEmail } from './emails/payment-failed'
import { magicLinkSetupEmail } from './emails/magic-link-setup'
import { reportsExhaustedEmail } from './emails/reports-exhausted'
import { supportNotificationEmail } from './emails/support-notification'
import { logEmail } from './email-logger'

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Wraps a resend.emails.send() call with logging.
 * Returns the raw Resend result { data, error }.
 * Handles both API-level errors (result.error) and thrown exceptions (network etc).
 */
async function sendAndLog(
  sendFn: () => Promise<{ data: any; error: any }>,
  logBase: Omit<Parameters<typeof logEmail>[0], 'status' | 'resendId' | 'error'>
): Promise<{ data: any; error: any }> {
  let result: { data: any; error: any }
  try {
    result = await sendFn()
  } catch (err: any) {
    void logEmail({ ...logBase, status: 'failed', error: err?.message ?? 'Unknown error' })
    throw err
  }
  void logEmail({
    ...logBase,
    status: result.error ? 'failed' : 'sent',
    error: result.error?.message,
    resendId: result.data?.id,
  })
  return result
}

// ─── Send functions ──────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string, userId?: string) {
  const { subject, html } = welcomeEmail(name)
  return sendAndLog(
    () => resend.emails.send({ from: `${FROM_NAME} <${FROM}>`, to, replyTo: REPLY_TO, subject, html }),
    { userId, toEmail: to, type: 'welcome', subject }
  )
}

export async function sendPaymentConfirmationEmail(
  to: string,
  name: string,
  plan: 'starter' | 'impulse',
  amount: string,
  userId?: string
) {
  const { subject, html } = paymentConfirmationEmail(name, plan, amount)
  return sendAndLog(
    () => resend.emails.send({ from: `${FROM_NAME} <${FROM}>`, to, replyTo: REPLY_TO, subject, html }),
    { userId, toEmail: to, type: 'plan_changed', subject }
  )
}

export async function sendPaymentFailedEmail(to: string, name: string, userId?: string) {
  const { subject, html } = paymentFailedEmail(name)
  return sendAndLog(
    () => resend.emails.send({ from: `${FROM_NAME} <${FROM}>`, to, replyTo: REPLY_TO, subject, html }),
    { userId, toEmail: to, type: 'plan_changed', subject }
  )
}

export async function sendMagicLinkSetupEmail(
  to: string,
  magicLink: string,
  reportTypeLabel: string,
  userId?: string
) {
  const { subject, html } = magicLinkSetupEmail(magicLink, reportTypeLabel)
  return sendAndLog(
    () => resend.emails.send({ from: `${FROM_NAME} <${FROM}>`, to, replyTo: REPLY_TO, subject, html }),
    { userId, toEmail: to, type: 'magic_link', subject }
  )
}

export async function sendReportsExhaustedEmail(to: string, name: string, userId?: string) {
  const { subject, html } = reportsExhaustedEmail(name)
  return sendAndLog(
    () => resend.emails.send({ from: `${FROM_NAME} <${FROM}>`, to, replyTo: REPLY_TO, subject, html }),
    { userId, toEmail: to, type: 'nudge_exhausted', subject }
  )
}

export async function sendSupportNotificationEmail(
  data: {
    userName: string
    userEmail: string
    planAtTime: string
    lastReportContext: string
    message: string
  },
  userId?: string
) {
  const { subject, html } = supportNotificationEmail(data)
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@goodbreeze.ai'
  return sendAndLog(
    () => resend.emails.send({
      from: `${FROM_NAME} <${FROM}>`,
      to: supportEmail,
      replyTo: data.userEmail,
      subject,
      html,
    }),
    {
      userId,
      toEmail: supportEmail,
      type: 'support_confirmation',
      subject,
      notifyOnFail: false, // admin-only email — don't notify the user if it fails
    }
  )
}
