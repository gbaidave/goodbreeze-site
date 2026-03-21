'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface ReportSubmittedModalProps {
  heading: string
  body: React.ReactNode
  detail?: string
  isGuest?: boolean
  reportId?: string
  onRunAnother: () => void
}

export function ReportSubmittedModal({
  heading,
  body,
  detail,
  isGuest,
  reportId,
  onRunAnother,
}: ReportSubmittedModalProps) {
  const router = useRouter()
  const [blocked, setBlocked] = useState(false)
  const [failed, setFailed] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  // Poll report status while modal is open — switch to blocked/failed state when n8n reports back
  useEffect(() => {
    if (!reportId || isGuest) return
    let stopped = false
    const POLL_INTERVAL = 3000
    const MAX_POLLS = 200 // ~10 minutes — matches n8n workflow timeout

    async function poll(count: number) {
      if (stopped || count >= MAX_POLLS) return
      try {
        const res = await fetch(`/api/reports/${reportId}/status`)
        if (res.ok) {
          const data = await res.json()
          if (data.status === 'failed_site_blocked') {
            setBlocked(true)
            return
          }
          if (data.status === 'failed') {
            setFailed(true)
            return
          }
          // Stop polling on complete — user already sees the modal
          if (data.status === 'complete') return
        }
      } catch {
        // ignore fetch errors — keep polling
      }
      setTimeout(() => poll(count + 1), POLL_INTERVAL)
    }

    setTimeout(() => poll(0), POLL_INTERVAL)
    return () => { stopped = true }
  }, [reportId, isGuest])

  async function handleCancel() {
    if (!reportId) { onRunAnother(); return }
    setCancelling(true)
    try {
      await fetch(`/api/reports/${reportId}`, { method: 'DELETE' })
    } catch { /* ignore */ }
    setCancelling(false)
    onRunAnother()
  }

  function handleClose() {
    router.push(isGuest ? '/login' : '/dashboard')
  }

  if (failed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative max-w-lg w-full p-10 rounded-2xl bg-zinc-900 border border-red-500/40 text-center shadow-2xl"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Report failed to generate</h2>
          <p className="text-gray-400 mb-2">
            Something went wrong while generating your report. Your credit has been refunded automatically.
          </p>
          <p className="text-gray-500 text-sm">Check your dashboard for details, or contact support if this keeps happening.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <button
              onClick={onRunAnother}
              className="px-6 py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              Try Again
            </button>
            <button
              onClick={handleClose}
              className="px-6 py-3 border border-primary/40 text-gray-300 rounded-full hover:border-primary hover:text-white transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (blocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative max-w-lg w-full p-10 rounded-2xl bg-zinc-900 border border-amber-500/40 text-center shadow-2xl"
        >
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">This site blocked our analysis</h2>
          <p className="text-gray-400 mb-2">
            The website prevented us from running the report. This sometimes happens with sites that block automated tools.
            Your credit has been refunded automatically.
          </p>
          <p className="text-gray-500 text-sm">Try a different URL, or check your dashboard for details.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="px-6 py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50"
            >
              {cancelling ? 'Cancelling…' : 'Try a Different URL'}
            </button>
            <button
              onClick={handleClose}
              className="px-6 py-3 border border-primary/40 text-gray-300 rounded-full hover:border-primary hover:text-white transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative max-w-lg w-full p-10 rounded-2xl bg-zinc-900 border border-primary text-center shadow-2xl"
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">{heading}</h2>
        <p className="text-gray-400 mb-2">{body}</p>
        {detail && <p className="text-gray-500 text-sm">{detail}</p>}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            {isGuest ? 'Sign in to your account' : 'Go to Dashboard'}
          </button>
          <button
            onClick={onRunAnother}
            className="px-6 py-3 border border-primary/40 text-gray-300 rounded-full hover:border-primary hover:text-white transition-all"
          >
            Run Another Report
          </button>
        </div>
      </motion.div>
    </div>
  )
}
