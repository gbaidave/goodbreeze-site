export const REPORT_TYPE_LABELS: Record<string, string> = {
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

export const REPORT_TYPE_URLS: Record<string, string> = {
  'RPT-H2H':   '/reports/competitive-analyzer',
  'RPT-T3C':   '/reports/competitive-analyzer',
  'RPT-CP':    '/reports/competitive-analyzer',
  'RPT-AISEO': '/reports/ai-seo',
  'RPT-LP':    '/reports/landing-page-optimizer',
  'RPT-KR':    '/reports/keyword-research',
  'RPT-AUDIT': '/reports/seo-audit',
  'RPT-COMP':  '/reports/seo-comprehensive',
  'RPT-BPR':   '/reports/business-presence',
}

export function labelFor(reportType: string | null | undefined): string {
  if (!reportType) return ''
  return REPORT_TYPE_LABELS[reportType] ?? reportType
}
