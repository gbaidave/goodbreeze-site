import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ReportViewTracker } from './ReportViewTracker'

// ============================================================================
// Constants
// ============================================================================

const REPORT_TYPE_LABELS: Record<string, string> = {
  h2h:               'Head to Head Analysis',
  t3c:               'Top 3 Competitors',
  cp:                'Competitive Position',
  ai_seo:            'AI SEO Optimizer',
  landing_page:      'Landing Page Optimizer',
  keyword_research:  'Keyword Research',
  seo_audit:         'SEO Audit',
  seo_comprehensive: 'SEO Comprehensive',
  multi_page:        'Multi-Page Audit',
}

// ============================================================================
// GDrive URL helpers
// ============================================================================

function getGDriveFileId(url: string): string | null {
  const match = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

function getGDriveEmbedUrl(url: string): string | null {
  const fileId = getGDriveFileId(url)
  return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null
}

function getGDriveDownloadUrl(url: string): string | null {
  const fileId = getGDriveFileId(url)
  return fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : null
}

// ============================================================================
// Expiry helpers
// ============================================================================

function daysRemaining(expiresAt: string | null, createdAt: string): number | null {
  const effectiveExpiry = expiresAt
    ? new Date(expiresAt)
    : new Date(new Date(createdAt).getTime() + 30 * 24 * 60 * 60 * 1000)
  const ms = effectiveExpiry.getTime() - Date.now()
  // Old reports (null expires_at) past the 30-day fallback window: no badge, not expired
  if (!expiresAt && ms <= 0) return null
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

// ============================================================================
// Page
// ============================================================================

export default async function ReportViewerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Auth
  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'] = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {}
  if (!user) redirect(`/login?redirectTo=/reports/${id}`)

  // Fetch report (ownership enforced by eq user_id)
  const { data: report, error } = await supabase
    .from('reports')
    .select('id, report_type, status, created_at, pdf_url, expires_at, input_data')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !report) return notFound()

  const label = REPORT_TYPE_LABELS[report.report_type] ?? report.report_type
  const days = daysRemaining(report.expires_at, report.created_at)
  const isExpired = days !== null && days === 0

  // Expired report
  if (isExpired) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-6">
        <div className="max-w-lg w-full p-10 rounded-2xl bg-dark-700 border border-gray-700 text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Report Expired</h2>
          <p className="text-gray-400 mb-6">
            This {label} report has expired. Run a new one to get fresh insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/tools" className="px-6 py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg transition-all">
              Run New Report
            </Link>
            <Link href="/dashboard" className="px-6 py-3 border border-gray-700 text-gray-400 rounded-full hover:border-gray-500 transition-all">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Still processing
  if (report.status !== 'complete') {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-6">
        <div className="max-w-lg w-full p-10 rounded-2xl bg-dark-700 border border-primary/20 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Your report is being generated</h2>
          <p className="text-gray-400 mb-6">
            You&apos;ll receive the PDF by email when it&apos;s ready. This usually takes 2–8 minutes depending on the report type.
          </p>
          <Link href="/dashboard" className="px-6 py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg transition-all">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Failed
  if (report.status === 'failed') {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-6">
        <div className="max-w-lg w-full p-10 rounded-2xl bg-dark-700 border border-red-500/30 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Report Generation Failed</h2>
          <p className="text-gray-400 mb-6">
            Something went wrong generating your {label} report. If you didn&apos;t receive an email with your PDF, please contact support.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/tools" className="px-6 py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg transition-all">
              Try Again
            </Link>
            <Link href="/dashboard" className="px-6 py-3 border border-gray-700 text-gray-400 rounded-full hover:border-gray-500 transition-all">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Complete — show PDF viewer
  const embedUrl = report.pdf_url ? getGDriveEmbedUrl(report.pdf_url) : null
  const downloadUrl = report.pdf_url ? getGDriveDownloadUrl(report.pdf_url) : null

  return (
    <div className="min-h-screen bg-dark">
      <ReportViewTracker reportId={report.id} reportType={report.report_type} />
      {/* Header bar */}
      <div className="border-b border-primary/10 bg-dark-800/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <Link href="/dashboard" className="text-gray-500 hover:text-primary text-sm transition-colors">
              ← Dashboard
            </Link>
            <h1 className="text-lg font-bold text-white mt-1">{label}</h1>
            <p className="text-gray-500 text-xs">
              Generated {new Date(report.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Expiry badge */}
            {days !== null && days > 0 && days <= 7 && (
              <span className="text-xs px-3 py-1.5 rounded-full bg-orange-900/40 text-orange-400 border border-orange-800">
                Expires in {days} day{days !== 1 ? 's' : ''}
              </span>
            )}
            {days !== null && days > 7 && (
              <span className="text-xs px-3 py-1.5 rounded-full bg-green-900/40 text-green-400 border border-green-800">
                {days} days remaining
              </span>
            )}

            {/* Download button */}
            {downloadUrl && (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-primary/40 text-primary text-sm font-medium rounded-lg hover:bg-primary/10 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </a>
            )}

            {/* Run another */}
            <Link
              href="/tools"
              className="px-4 py-2 bg-gradient-to-r from-primary to-accent-blue text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              Run Another
            </Link>
          </div>
        </div>
      </div>

      {/* PDF Embed */}
      {embedUrl ? (
        <div className="w-full" style={{ height: 'calc(100vh - 90px)' }}>
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            title={label}
            allow="autoplay"
          />
        </div>
      ) : (
        // Fallback if pdf_url isn't a GDrive URL
        <div className="max-w-2xl mx-auto py-24 px-6 text-center">
          <p className="text-gray-400 mb-6">
            Your report is ready. The in-browser viewer isn&apos;t available for this file type.
          </p>
          {report.pdf_url && (
            <a
              href={report.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg transition-all"
            >
              Open Report PDF →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
