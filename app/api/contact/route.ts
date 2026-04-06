/**
 * POST /api/contact
 *
 * Public contact form submission. No account required.
 * Creates a support_requests entry (category: contact_form) and initial message.
 * Sends confirmation email + bell notifications.
 *
 * Rate limited: max 5 per IP per hour.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service-client'
import { resend, FROM, FROM_NAME, stagingPrefix } from '@/lib/resend'
import { insertBellIfAllowed } from '@/lib/bell-notifications'

// In-memory rate limiter (resets on deploy — acceptable for contact form)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }
  if (entry.count >= RATE_LIMIT) return true
  entry.count++
  return false
}

const MIN_MESSAGE_LEN = 10
const MAX_MESSAGE_LEN = 2000
const MAX_NAME_LEN = 100

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? 'unknown'

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse body
    const body = await request.json()
    const name = (body.name ?? '').trim()
    const email = (body.email ?? '').trim().toLowerCase()
    const message = (body.message ?? '').trim()
    const captchaToken = body.captchaToken ?? ''

    // Validate
    if (!name || name.length > MAX_NAME_LEN) {
      return NextResponse.json({ error: 'Name is required (max 100 characters).' }, { status: 400 })
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
    }
    if (!message || message.length < MIN_MESSAGE_LEN) {
      return NextResponse.json({ error: `Message must be at least ${MIN_MESSAGE_LEN} characters.` }, { status: 400 })
    }
    if (message.length > MAX_MESSAGE_LEN) {
      return NextResponse.json({ error: `Message must be under ${MAX_MESSAGE_LEN} characters.` }, { status: 400 })
    }

    // Turnstile verification (required when secret key is set)
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY
    if (turnstileSecret && !captchaToken) {
      return NextResponse.json({ error: 'Please complete the captcha verification.' }, { status: 400 })
    }
    if (turnstileSecret && captchaToken) {
      const verifyResp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: turnstileSecret, response: captchaToken }),
      })
      const verifyData = await verifyResp.json()
      if (!verifyData.success) {
        return NextResponse.json({ error: 'Captcha verification failed. Please try again.' }, { status: 400 })
      }
    }

    // Escape user input for safe HTML email rendering
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    const safeName = esc(name)
    const safeEmail = esc(email)
    const safeMessage = esc(message)

    const svc = createServiceClient()

    // Check if email belongs to an existing user
    const { data: existingProfile } = await svc
      .from('profiles')
      .select('id, name, email')
      .eq('email', email)
      .single()

    const userId = existingProfile?.id ?? null

    // Create support request (category: contact_form)
    const { data: ticket, error: ticketError } = await svc
      .from('support_requests')
      .insert({
        user_id: userId,
        email: email,
        category: 'contact_form',
        subject: `Contact form: ${name}`,
        status: 'open',
        priority: 'normal',
        handled_by: 'pending',
      })
      .select('id')
      .single()

    if (ticketError || !ticket) {
      console.error('[contact] Failed to create support request:', ticketError)
      return NextResponse.json({ error: 'Failed to submit. Please try again.' }, { status: 500 })
    }

    // Create the initial message
    const { error: msgError } = await svc
      .from('support_messages')
      .insert({
        request_id: ticket.id,
        sender_id: userId,
        sender_role: 'user',
        message: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      })

    if (msgError) {
      console.error('[contact] Failed to create message:', msgError)
    }

    // Send confirmation email to the submitter
    try {
      await resend.emails.send({
        from: `${FROM_NAME} <${FROM}>`,
        to: email,
        replyTo: 'support@goodbreeze.ai',
        subject: stagingPrefix + 'We received your message',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #00adb5;">Thanks for reaching out, ${safeName}!</h2>
            <p>We received your message and will get back to you within 1 business day.</p>
            <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0; color: #71717a; font-size: 14px;"><strong>Your message:</strong></p>
              <p style="margin: 8px 0 0; color: #3f3f46;">${safeMessage.replace(/\n/g, '<br>')}</p>
            </div>
            <p style="color: #71717a; font-size: 14px;">If you need immediate help, you can also <a href="https://calendly.com/dave-goodbreeze/30min" style="color: #00adb5;">book a strategy call</a>.</p>
            <p style="color: #a1a1aa; font-size: 12px; margin-top: 24px;">Good Breeze AI | goodbreeze.ai</p>
          </div>
        `,
      })
    } catch (emailErr) {
      console.error('[contact] Failed to send confirmation email:', emailErr)
      // Non-blocking — the request was still created
    }

    // Bell notification to the submitter (if they have an account)
    if (userId) {
      await insertBellIfAllowed(svc, userId, {
        type: 'contact_received',
        message: 'Your contact request has been received. We will respond shortly.',
      }, 'support_emails')
    }

    // Notify support/admin: bell notification to all support+ roles
    const { data: supportUsers } = await svc
      .from('profiles')
      .select('id')
      .in('role', ['superadmin', 'admin', 'support'])

    if (supportUsers) {
      for (const su of supportUsers) {
        await insertBellIfAllowed(svc, su.id, {
          type: 'new_contact_request',
          message: `New contact request from ${name} (${email})`,
        })
      }
    }

    // Email to support inbox
    try {
      await resend.emails.send({
        from: `${FROM_NAME} <${FROM}>`,
        to: 'support@goodbreeze.ai',
        replyTo: email,
        subject: stagingPrefix + `New contact form: ${safeName}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
            <h3>New contact form submission</h3>
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>Has account:</strong> ${userId ? 'Yes' : 'No'}</p>
            <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0;">${safeMessage.replace(/\n/g, '<br>')}</p>
            </div>
            <p><a href="https://goodbreeze.ai/admin/support" style="color: #00adb5;">View in admin panel</a></p>
          </div>
        `,
      })
    } catch (emailErr) {
      console.error('[contact] Failed to send support notification email:', emailErr)
    }

    return NextResponse.json({ success: true, requestId: ticket.id })

  } catch (err) {
    console.error('[contact] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
