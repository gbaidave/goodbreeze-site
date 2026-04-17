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
import { createServiceClient } from '@/lib/supabase/service-client'

// Report type → human-readable label for the filename
const REPORT_TYPE_LABELS: Record<string, string> = {
  'RPT-H2H':   'Head to Head Analysis',
  'RPT-T3C':   'Top 3 Competitors',
  'RPT-CP':    'Competitive Position',
  'RPT-AISEO': 'AI SEO Optimizer',
  'RPT-LP':    'Landing Page Optimizer',
  'RPT-KR':    'Keyword Research',
  'RPT-AUDIT': 'SEO Audit',
  'RPT-COMP':  'SEO Comprehensive',
  'RPT-BPR':   'Business Presence Report',
}

function extractDomain(url: string | undefined): string {
  if (!url) return ''
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}

function buildIdentifier(reportType: string, inputData: Record<string, unknown>): string {
  const url = inputData.url as string | undefined
  const targetWebsite = inputData.targetWebsite as string | undefined
  const competitor1Website = inputData.competitor1Website as string | undefined
  const competitor1 = inputData.competitor1 as string | undefined
  const company = inputData.company as string | undefined
  const focusKeyword = inputData.focusKeyword as string | undefined

  const domain = inputData.domain as string | undefined

  switch (reportType) {
    case 'RPT-H2H': {
      const target = extractDomain(targetWebsite) || company || 'Target'
      const comp = competitor1 || extractDomain(competitor1Website) || 'Competitor'
      return `${target} vs ${comp}`
    }
    case 'RPT-T3C':
    case 'RPT-CP':
      return extractDomain(targetWebsite) || company || ''
    case 'RPT-KR':
      return focusKeyword || extractDomain(url) || ''
    case 'RPT-BPR':
      return domain || extractDomain(url) || company || ''
    default: // RPT-AISEO, RPT-LP, RPT-AUDIT, RPT-COMP
      return extractDomain(url) || company || ''
  }
}

function buildFilename(reportType: string, createdAt: string, inputData: Record<string, unknown>): string {
  const label = REPORT_TYPE_LABELS[reportType] ?? reportType
  const identifier = buildIdentifier(reportType, inputData)
  const date = new Date(createdAt).toISOString().split('T')[0] // YYYY-MM-DD
  return identifier
    ? `Good Breeze AI - ${label} - ${identifier} - ${date}.pdf`
    : `Good Breeze AI - ${label} - ${date}.pdf`
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

  // https://n8n.goodbreeze.ai/webhook/pdf-download?fileId={FILE_ID}
  // n8n proxy stores the GDrive file ID in the fileId query param
  const fileIdMatch = url.match(/[?&]fileId=([a-zA-Z0-9_-]+)/)
  if (fileIdMatch) return fileIdMatch[1]

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

    // Check if requester is an admin — admins can download any user's report
    const svc = createServiceClient()
    const { data: profile } = await svc.from('profiles').select('role').eq('id', user.id).single()
    const isAdmin = ['superadmin', 'admin'].includes(profile?.role ?? '')

    const reportQuery = isAdmin
      ? svc.from('reports').select('id, status, pdf_url, report_type, created_at, input_data').eq('id', id)
      : supabase.from('reports').select('id, status, pdf_url, report_type, created_at, input_data').eq('id', id).eq('user_id', user.id)

    const { data: report, error } = await reportQuery.single()

    if (error || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    if (!report.pdf_url) {
      return NextResponse.json({ error: 'PDF not available' }, { status: 404 })
    }

    // Determine the download URL.
    // If pdf_url is an n8n proxy URL, use it directly — the proxy has
    // authenticated GDrive access and returns the actual PDF binary.
    // For legacy GDrive viewer links, extract file ID and use direct download.
    const isN8nProxy = report.pdf_url.includes('/webhook/pdf-download')
    let downloadUrl: string

    if (isN8nProxy) {
      // n8n proxy already handles GDrive auth — use as-is
      downloadUrl = report.pdf_url
    } else {
      const fileId = extractGdriveFileId(report.pdf_url)
      downloadUrl = fileId
        ? `https://drive.google.com/uc?export=download&id=${fileId}`
        : report.pdf_url
    }

    const upstream = await fetch(downloadUrl, { redirect: 'follow' })

    if (!upstream.ok) {
      return NextResponse.json({ error: 'Failed to fetch PDF' }, { status: 502 })
    }

    const filename = buildFilename(report.report_type, report.created_at, (report.input_data as Record<string, unknown>) ?? {})

    // ?view=1 → inline (for in-browser iframe); default → attachment (triggers download)
    const url = new URL(request.url)
    const inline = url.searchParams.get('view') === '1'
    const disposition = inline
      ? `inline; filename="${filename}"`
      : `attachment; filename="${filename}"`

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': disposition,
        'Cache-Control': 'private, max-age=3600',
      },
    })

  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
