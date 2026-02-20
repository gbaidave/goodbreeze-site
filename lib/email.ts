/**
 * Central email sending utility.
 * All transactional emails go through here.
 */

import { resend, FROM, FROM_NAME, REPLY_TO } from './resend'
import { welcomeEmail } from './emails/welcome'
import { paymentConfirmationEmail } from './emails/payment-confirmation'
import { paymentFailedEmail } from './emails/payment-failed'
import { magicLinkSetupEmail } from './emails/magic-link-setup'
import { reportsExhaustedEmail } from './emails/reports-exhausted'
import { supportNotificationEmail } from './emails/support-notification'

export async function sendWelcomeEmail(to: string, name: string) {
  const { subject, html } = welcomeEmail(name)
  return resend.emails.send({
    from: `${FROM_NAME} <${FROM}>`,
    to,
    replyTo: REPLY_TO,
    subject,
    html,
  })
}

export async function sendPaymentConfirmationEmail(
  to: string,
  name: string,
  plan: 'starter' | 'impulse',
  amount: string
) {
  const { subject, html } = paymentConfirmationEmail(name, plan, amount)
  return resend.emails.send({
    from: `${FROM_NAME} <${FROM}>`,
    to,
    replyTo: REPLY_TO,
    subject,
    html,
  })
}

export async function sendPaymentFailedEmail(to: string, name: string) {
  const { subject, html } = paymentFailedEmail(name)
  return resend.emails.send({
    from: `${FROM_NAME} <${FROM}>`,
    to,
    replyTo: REPLY_TO,
    subject,
    html,
  })
}

export async function sendMagicLinkSetupEmail(
  to: string,
  magicLink: string,
  reportTypeLabel: string
) {
  const { subject, html } = magicLinkSetupEmail(magicLink, reportTypeLabel)
  return resend.emails.send({
    from: `${FROM_NAME} <${FROM}>`,
    to,
    replyTo: REPLY_TO,
    subject,
    html,
  })
}

export async function sendReportsExhaustedEmail(to: string, name: string) {
  const { subject, html } = reportsExhaustedEmail(name)
  return resend.emails.send({
    from: `${FROM_NAME} <${FROM}>`,
    to,
    replyTo: REPLY_TO,
    subject,
    html,
  })
}

export async function sendSupportNotificationEmail(data: {
  userName: string
  userEmail: string
  planAtTime: string
  lastReportContext: string
  message: string
}) {
  const { subject, html } = supportNotificationEmail(data)
  return resend.emails.send({
    from: `${FROM_NAME} <${FROM}>`,
    to: process.env.SUPPORT_EMAIL || 'support@goodbreeze.ai',
    replyTo: data.userEmail, // admin can reply directly to the user
    subject,
    html,
  })
}
