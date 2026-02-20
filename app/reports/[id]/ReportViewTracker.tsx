'use client'

import { useEffect } from 'react'
import { captureEvent } from '@/lib/analytics'

export function ReportViewTracker({ reportId, reportType }: { reportId: string; reportType: string }) {
  useEffect(() => {
    captureEvent('report_viewed', { reportId, reportType })
  }, [reportId, reportType])

  return null
}
