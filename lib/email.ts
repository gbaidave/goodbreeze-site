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

import { createServiceClient } from './supabase/service-client'
import { resend, FROM, FROM_NAME, REPLY_TO } from './resend'
import { welcomeEmail } from './emails/welcome'
import { paymentConfirmationEmail } from './emails/payment-confirmation'
import { paymentFailedEmail } from './emails/payment-failed'
import { magicLinkSetupEmail } from './emails/magic-link-setup'
import { reportsExhaustedEmail } from './emails/reports-exhausted'
import { supportNotificationEmail } from './emails/support-notification'
import { supportReplyEmail } from './emails/support-reply'
import { supportResolvedEmail } from './emails/support-resolved'
import { supportClosedEmail } from './emails/support-closed'
import { supportAdminNotificationEmail } from './emails/support-admin-notification'
import { testimonialAdminNotificationEmail } from './emails/testimonial-admin-notification'
import { securityAlertEmail } from './emails/security-alert'
import { creditGrantedEmail } from './emails/credit-granted'
import { consentConfirmationEmail } from './emails/consent-confirmation'
import { logEmail } from './email-logger'

// ─── Helpers ────────────────────────────────────────────────────────────────

type EmailPrefKey =
  | 'nudge_emails'
  | 'support_emails'
  | 'referral_credit'
  | 'report_ready'
  | 'support_confirmation'
  | 'report_failure'
  | 'testimonial_approved'

/**
 * Returns true if the user has the given email preference enabled (or if userId is missing).
 * Defaults to true when the column is absent or the preference is not explicitly set to false.
 */
async function checkEmailPref(userId: string | undefined, pref: EmailPrefKey): Promise<boolean> {
  if (!userId) return true
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('profiles')
      .select('email_preferences')
      .eq('id', userId)
      .single()
    const prefs = data?.email_preferences ?? {}
    return prefs[pref] !== false
  } catch {
    return true // default to sending on any error
  }
}

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
  plan: string,
  amount: string,
  userId?: string,
  receiptRef?: string
) {
  const { subject, html } = paymentConfirmationEmail(name, plan, amount, receiptRef)
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
  if (!await checkEmailPref(userId, 'nudge_emails')) return { data: null, error: null }
  const { subject, html } = reportsExhaustedEmail(name)
  return sendAndLog(
    () => resend.emails.send({ from: `${FROM_NAME} <${FROM}>`, to, replyTo: REPLY_TO, subject, html }),
    { userId, toEmail: to, type: 'nudge_exhausted', subject }
  )
}

export async function sendSupportReplyEmail(
  to: string,
  name: string,
  replyMessage: string,
  userId?: string
) {
  if (!await checkEmailPref(userId, 'support_emails')) return { data: null, error: null }
  const { subject, html } = supportReplyEmail(name, replyMessage)
  return sendAndLog(
    () => resend.emails.send({ from: `${FROM_NAME} <${FROM}>`, to, replyTo: REPLY_TO, subject, html }),
    { userId, toEmail: to, type: 'support_reply', subject }
  )
}

export async function sendSupportResolvedEmail(to: string, name: string, userId?: string) {
  if (!await checkEmailPref(userId, 'support_emails')) return { data: null, error: null }
  const { subject, html } = supportResolvedEmail(name)
  return sendAndLog(
    () => resend.emails.send({ from: `${FROM_NAME} <${FROM}>`, to, replyTo: REPLY_TO, subject, html }),
    { userId, toEmail: to, type: 'support_resolved', subject }
  )
}

export async function sendBugReportNotificationEmail(
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
  const bugReportEmail = process.env.BUG_REPORT_EMAIL || 'dave@goodbreeze.ai'
  return sendAndLog(
    () => resend.emails.send({
      from: `${FROM_NAME} <${FROM}>`,
      to: bugReportEmail,
      replyTo: data.userEmail,
      subject: `[Bug Report] ${subject}`,
      html,
    }),
    {
      userId,
      toEmail: bugReportEmail,
      type: 'support_confirmation',
      subject: `[Bug Report] ${subject}`,
      notifyOnFail: false,
    }
  )
}

export async function sendSupportClosedEmail(
  to: string,
  name: string,
  closeReason: string,
  userId?: string
) {
  if (!await checkEmailPref(userId, 'support_emails')) return { data: null, error: null }
  const { subject, html } = supportClosedEmail({ userName: name, closeReason })
  return sendAndLog(
    () => resend.emails.send({ from: `${FROM_NAME} <${FROM}>`, to, replyTo: REPLY_TO, subject, html }),
    { userId, toEmail: to, type: 'support_closed', subject }
  )
}

export async function sendSupportAdminNotificationEmail(
  data: {
    userName: string
    userEmail: string
    action: 'sent a follow-up on' | 'closed' | 'reopened'
    requestId: string
    message?: string
    reason?: string
  },
  userId?: string
) {
  const { subject, html } = supportAdminNotificationEmail(data)
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@goodbreeze.ai'
  return sendAndLog(
    () => resend.emails.send({
      from: `${FROM_NAME} <${FROM}>`,
      to: supportEmail,
      replyTo: data.userEmail,
      subject,
      html,
    }),
    { userId, toEmail: supportEmail, type: 'support_followup', subject, notifyOnFail: false }
  )
}

export async function sendSupportNotificationEmail(
  data: {
    userName: string
    userEmail: string
    planAtTime: string
    lastReportContext: string
    message: string
    category?: string
    subject?: string | null
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

export async function sendTestimonialAdminNotificationEmail(
  data: {
    userName: string
    userEmail: string
    type: 'written' | 'video'
    pullQuote: string
    content?: string
    videoUrl?: string
    creditsGranted: number
  },
  userId?: string
) {
  const { subject, html } = testimonialAdminNotificationEmail(data)
  const adminEmail = process.env.ADMIN_EMAIL || 'dave@goodbreeze.ai'
  return sendAndLog(
    () => resend.emails.send({
      from: `${FROM_NAME} <${FROM}>`,
      to: adminEmail,
      replyTo: data.userEmail,
      subject,
      html,
    }),
    { userId, toEmail: adminEmail, type: 'support_confirmation', subject, notifyOnFail: false }
  )
}

export async function sendCreditGrantedEmail(to: string, name: string, credits: number, userId?: string) {
  if (!await checkEmailPref(userId, 'referral_credit')) return { data: null, error: null }
  const { subject, html } = creditGrantedEmail(name, credits)
  return sendAndLog(
    () => resend.emails.send({ from: `${FROM_NAME} <${FROM}>`, to, replyTo: REPLY_TO, subject, html }),
    { userId, toEmail: to, type: 'plan_changed', subject }
  )
}

export async function sendSecurityAlertEmail(
  to: string,
  name: string,
  action: 'phone_changed',
  userId?: string
) {
  const { subject, html } = securityAlertEmail(name, action)
  return sendAndLog(
    () => resend.emails.send({ from: `${FROM_NAME} <${FROM}>`, to, replyTo: REPLY_TO, subject, html }),
    { userId, toEmail: to, type: 'security_alert', subject }
  )
}

export async function sendConsentConfirmationEmail(
  data: {
    userName: string
    userEmail: string
    ipAddress: string
    userAgent: string
    consentTextVersion: string
    consentText: string
    consentedAt: string
  },
  userId?: string
) {
  const { subject, html } = consentConfirmationEmail(data)
  return sendAndLog(
    () => resend.emails.send({ from: `${FROM_NAME} <${FROM}>`, to: data.userEmail, replyTo: REPLY_TO, subject, html }),
    { userId, toEmail: data.userEmail, type: 'security_alert', subject, notifyOnFail: false }
  )
}
