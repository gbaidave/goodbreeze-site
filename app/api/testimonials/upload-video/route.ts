/**
 * POST /api/testimonials/upload-video
 *
 * 1. Validates auth, file type, and file size
 * 2. Checks the file's SHA-256 hash against VirusTotal's database
 * 3. Creates a Google Drive resumable upload session
 * 4. Returns the session URL — browser uploads directly to Google (bypasses Vercel size limits)
 *
 * Body: { filename: string, fileType: string, fileSize: number, sha256: string }
 * Returns: { uploadUrl: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_TYPES = new Set([
  'video/mp4', 'video/quicktime', 'video/x-msvideo',
  'video/x-matroska', 'video/webm',
])
const MAX_BYTES = 250 * 1024 * 1024 // 250MB

const EXT_MAP: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/x-msvideo': 'avi',
  'video/x-matroska': 'mkv',
  'video/webm': 'webm',
}

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN!,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) throw new Error('Failed to get Google access token')
  const data = await res.json()
  return data.access_token
}

async function checkVirusTotal(sha256: string): Promise<{ clean: boolean; reason?: string }> {
  try {
    const res = await fetch(`https://www.virustotal.com/api/v3/files/${sha256}`, {
      headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY! },
    })
    // 404 = not in database = unknown file = allow
    if (res.status === 404) return { clean: true }
    // Any other error = don't block the upload
    if (!res.ok) return { clean: true }
    const data = await res.json()
    const stats = data?.data?.attributes?.last_analysis_stats
    if (!stats) return { clean: true }
    const malicious = (stats.malicious ?? 0) + (stats.suspicious ?? 0)
    if (malicious > 0) return { clean: false, reason: 'File flagged by security scan.' }
    return { clean: true }
  } catch {
    return { clean: true }
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  let body: { filename?: string; fileType?: string; fileSize?: number; sha256?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { filename, fileType, fileSize, sha256 } = body

  if (!filename || !fileType || !fileSize || !sha256) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.has(fileType)) {
    return NextResponse.json(
      { error: 'Invalid file type. Allowed: MP4, MOV, AVI, MKV, WebM.' },
      { status: 400 }
    )
  }
  if (fileSize > MAX_BYTES) {
    return NextResponse.json(
      { error: 'File too large. Maximum size is 250MB.' },
      { status: 400 }
    )
  }
  if (!/^[a-f0-9]{64}$/.test(sha256)) {
    return NextResponse.json({ error: 'Invalid file hash.' }, { status: 400 })
  }

  // VirusTotal hash check
  const vtResult = await checkVirusTotal(sha256)
  if (!vtResult.clean) {
    return NextResponse.json(
      { error: vtResult.reason ?? 'File rejected by security scan.' },
      { status: 400 }
    )
  }

  // Get OAuth access token via refresh token
  let accessToken: string
  try {
    accessToken = await getAccessToken()
  } catch {
    return NextResponse.json({ error: 'Upload service unavailable.' }, { status: 503 })
  }

  const ext = EXT_MAP[fileType] ?? 'mp4'
  const safeName = `testimonial-${user.id}-${Date.now()}.${ext}`

  // Create GDrive resumable upload session
  // Include Origin so Google enables CORS for the browser's direct PUT to the session URL
  const origin = request.headers.get('origin') ?? 'https://goodbreeze-site.vercel.app'
  const initRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': fileType,
        'X-Upload-Content-Length': String(fileSize),
        'Origin': origin,
      },
      body: JSON.stringify({
        name: safeName,
        parents: [process.env.TESTIMONIAL_VIDEOS_FOLDER_ID!],
      }),
    }
  )

  if (!initRes.ok) {
    console.error('GDrive session init failed:', await initRes.text())
    return NextResponse.json({ error: 'Failed to initialize upload. Please try again.' }, { status: 500 })
  }

  const uploadUrl = initRes.headers.get('Location')
  if (!uploadUrl) {
    return NextResponse.json({ error: 'Failed to create upload session.' }, { status: 500 })
  }

  return NextResponse.json({ uploadUrl })
}
