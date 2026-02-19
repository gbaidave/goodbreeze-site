/**
 * Central email sending utility.
 * All transactional emails go through here.
 */

import { resend, FROM, FROM_NAME, REPLY_TO } from './resend'
import { welcomeEmail } from './emails/welcome'
import { paymentConfirmationEmail } from './emails/payment-confirmation'
import { paymentFailedEmail } from './emails/payment-failed'
import { magicLinkSetupEmail } from './emails/magic-link-setup'

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
