/**
 * GET /ref/[code]
 *
 * Referral landing route. Sets a cookie and redirects to /signup?ref=[code]
 * so the referral code survives the email confirmation redirect.
 */

import { NextResponse, type NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const origin = new URL(request.url).origin

  const response = NextResponse.redirect(`${origin}/signup?ref=${encodeURIComponent(code)}`)

  // Cookie survives email confirmation redirect (7 days, httpOnly)
  response.cookies.set('gbai_ref', code, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  })

  return response
}
