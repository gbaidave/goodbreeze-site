/**
 * POST /api/testimonials
 *
 * Authenticated endpoint for submitting a testimonial.
 * One submission per type (written | video) per user.
 *
 * Credits granted immediately on submission:
 *   written → 1 free report credit
 *   video   → 5 free report credits
 *
 * CA consent waiver must be accepted before submission is recorded.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'

const CREDIT_AMOUNTS: Record<string, number> = {
  written: 1,
  video: 5,
}

const VALID_VIDEO_HOSTS = ['loom.com', 'youtube.com', 'youtu.be', 'drive.google.com']

function isValidVideoUrl(url: string): boolean {
  try {
    const u = new URL(url)
    if (!['http:', 'https:'].includes(u.protocol)) return false
    const host = u.hostname.replace('www.', '')
    return VALID_VIDEO_HOSTS.includes(host)
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHENTICATED' },
        { status: 401 }
      )
    }

    // 2. Parse and validate input
    const body = await request.json()
    const { type, content, video_url, pull_quote, ca_consent } = body

    if (!type || !['written', 'video'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid submission type', code: 'INVALID_TYPE' },
        { status: 400 }
      )
    }

    if (!pull_quote || pull_quote.trim().length < 2) {
      return NextResponse.json(
        { error: 'A headline is required (2-3 words describing your result)', code: 'INVALID_PULL_QUOTE' },
        { status: 400 }
      )
    }

    if (pull_quote.length > 80) {
      return NextResponse.json(
        { error: 'Headline is too long (80 characters max)', code: 'INVALID_PULL_QUOTE' },
        { status: 400 }
      )
    }

    if (!ca_consent) {
      return NextResponse.json(
        { error: 'You must accept the consent terms to submit', code: 'CONSENT_REQUIRED' },
        { status: 400 }
      )
    }

    if (type === 'written') {
      if (!content || content.trim().length < 30) {
        return NextResponse.json(
          { error: 'Please write at least 30 characters describing your experience', code: 'CONTENT_TOO_SHORT' },
          { status: 400 }
        )
      }
      if (content.length > 2000) {
        return NextResponse.json(
          { error: 'Testimonial is too long (2000 characters max)', code: 'CONTENT_TOO_LONG' },
          { status: 400 }
        )
      }
    }

    if (type === 'video') {
      if (!video_url || !isValidVideoUrl(video_url)) {
        return NextResponse.json(
          { error: 'Please enter a valid Loom, YouTube, or Google Drive link', code: 'INVALID_VIDEO_URL' },
          { status: 400 }
        )
      }
    }

    // 3. Check if user already submitted this type
    const serviceSupabase = createServiceClient()

    const { data: existing } = await serviceSupabase
      .from('testimonials')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', type)
      .single()

    if (existing) {
      return NextResponse.json(
        {
          error: `You've already submitted a ${type} testimonial. Thank you!`,
          code: 'ALREADY_SUBMITTED',
        },
        { status: 409 }
      )
    }

    const creditsToGrant = CREDIT_AMOUNTS[type]

    // 4. Insert testimonial
    const { error: insertError } = await serviceSupabase
      .from('testimonials')
      .insert({
        user_id: user.id,
        type,
        content: type === 'written' ? content.trim() : null,
        video_url: type === 'video' ? video_url.trim() : null,
        pull_quote: pull_quote.trim(),
        ca_consent: true,
        status: 'pending',
        credits_granted: creditsToGrant,
      })

    if (insertError) {
      // Unique constraint hit = race condition duplicate
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: `You've already submitted a ${type} testimonial. Thank you!`, code: 'ALREADY_SUBMITTED' },
          { status: 409 }
        )
      }
      console.error('Testimonial insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save testimonial. Please try again.', code: 'INSERT_FAILED' },
        { status: 500 }
      )
    }

    // 5. Grant credits immediately (product=null means usable on any report type)
    const { error: creditError } = await serviceSupabase
      .from('credits')
      .insert({
        user_id: user.id,
        balance: creditsToGrant,
        product: null,
        expires_at: null,
      })

    if (creditError) {
      console.error('Testimonial credit grant error:', creditError)
      // Don't fail the request — testimonial is saved; credits can be manually granted
    }

    // 6. Notify the user
    const creditLabel = creditsToGrant === 1 ? '1 free report credit' : `${creditsToGrant} free report credits`
    await serviceSupabase.from('notifications').insert({
      user_id: user.id,
      type: 'testimonial_credit',
      message: `Thank you for your ${type} testimonial! You earned ${creditLabel}.`,
    })

    return NextResponse.json({
      success: true,
      creditsGranted: creditsToGrant,
      message: `Testimonial submitted! ${creditsToGrant} free report credit${creditsToGrant !== 1 ? 's' : ''} added to your account.`,
    })

  } catch (error) {
    console.error('Testimonial route error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
