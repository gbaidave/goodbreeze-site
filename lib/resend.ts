import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

export const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@goodbreeze.ai'
export const FROM_NAME = 'Good Breeze AI'
export const REPLY_TO = 'dave@goodbreeze.ai'
