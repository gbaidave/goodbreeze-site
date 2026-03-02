/**
 * GET /api/reports/[id]/download
 *
 * Proxies the PDF from Google Drive so the browser receives it with a
 * descriptive Content-Disposition filename instead of "pdf-download.pdf".
 *
 * Auth: user must be signed in and own the report.
 * The `download` attribute on a cross-origin <a> is ignored by browsers,
 * so this server-side proxy is the only reliable way to set the filename.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Report type → human-readable label for the filename
const REPORT_TYPE_LABELS: Record<string, string> = {
  h2h:               'Head to Head Analysis',
  t3c:               'Top 3 Competitors',
  cp:                'Competitive Position',
  ai_seo:            'AI SEO Optimizer',
  landing_page:      'Landing Page Optimizer',
  keyword_research:  'Keyword Research',
  seo_audit:         'SEO Audit',
  seo_comprehensive: 'SEO Comprehensive',
}

function buildFilename(reportType: string, createdAt: string): string {
  const label = REPORT_TYPE_LABELS[reportType] ?? reportType
  const date = new Date(createdAt).toISOString().split('T')[0] // YYYY-MM-DD
  return `Good Breeze AI - ${label} - ${date}.pdf`
}

/** Extract the Google Drive file ID from various GDrive URL formats. */
function extractGdriveFileId(url: string): string | null {
  // https://drive.google.com/file/d/{FILE_ID}/view
  const viewMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (viewMatch) return viewMatch[1]

  // https://drive.google.com/open?id={FILE_ID}
  // https://drive.google.com/uc?id={FILE_ID}&export=download
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (idMatch) return idMatch[1]

  return null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 })
    }

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
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { data: report, error } = await supabase
      .from('reports')
      .select('id, status, pdf_url, report_type, created_at')
      .eq('id', id)
      .eq('user_id', user.id) // ownership check
      .single()

    if (error || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    if (!report.pdf_url) {
      return NextResponse.json({ error: 'PDF not available' }, { status: 404 })
    }

    const fileId = extractGdriveFileId(report.pdf_url)
    if (!fileId) {
      // Fallback: redirect to the raw URL if we can't parse the file ID
      return NextResponse.redirect(report.pdf_url)
    }

    // Fetch the PDF from Google Drive (direct download URL)
    const downloadUrl = `https://drive.google.com/uc?id=${fileId}&export=download&confirm=t`
    const upstream = await fetch(downloadUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      redirect: 'follow',
    })

    if (!upstream.ok) {
      return NextResponse.json({ error: 'Failed to fetch PDF' }, { status: 502 })
    }

    const filename = buildFilename(report.report_type, report.created_at)

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    })

  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
