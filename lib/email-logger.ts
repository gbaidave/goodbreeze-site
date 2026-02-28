/**
 * Central email logging utility.
 * Called by lib/email.ts after every Resend send attempt.
 *
 * Writes to email_logs table (audit trail + admin visibility).
 * On failure with a known userId, writes an email_failed notification
 * so the user sees it in the dashboard notification bell.
 *
 * This function never throws — logging failures are console.error only.
 */

import { createServiceClient } from './supabase/service-client'

export type EmailType =
  | 'report_ready'
  | 'magic_link'
  | 'nudge_exhausted'
  | 'support_confirmation'
  | 'support_reply'
  | 'support_resolved'
  | 'support_closed'
  | 'support_followup'
  | 'referral_credit'
  | 'testimonial_credit'
  | 'welcome'
  | 'plan_changed'
  | 'security_alert'

interface LogEmailParams {
  userId?: string         // undefined = no user association (e.g. internal admin emails)
  toEmail: string
  type: EmailType
  subject: string
  resendId?: string       // Resend message ID, present on success
  status: 'sent' | 'failed'
  error?: string          // error message if status = 'failed'
  notifyOnFail?: boolean  // default true when userId is provided; set false for admin-only emails
}

export async function logEmail(params: LogEmailParams): Promise<void> {
  try {
    const svc = createServiceClient()
    const { userId, toEmail, type, subject, resendId, status, error, notifyOnFail } = params

    // Write log row
    await svc.from('email_logs').insert({
      user_id: userId ?? null,
      to_email: toEmail,
      type,
      subject,
      status,
      error: error ?? null,
      resend_id: resendId ?? null,
    })

    // Write in-app notification if email failed and user is known
    if (status === 'failed' && userId && notifyOnFail !== false) {
      await svc.from('notifications').insert({
        user_id: userId,
        type: 'email_failed',
        message:
          'One of your Good Breeze AI emails failed to deliver. If you were expecting something, please contact support.',
      })
    }
  } catch (logErr) {
    // Logging must never crash the caller
    console.error('[email-logger] Failed to log email:', logErr)
  }
}
