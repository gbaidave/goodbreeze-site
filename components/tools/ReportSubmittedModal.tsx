'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface ReportSubmittedModalProps {
  heading: string
  body: React.ReactNode
  detail?: string
  isGuest?: boolean
  onRunAnother: () => void
}

export function ReportSubmittedModal({
  heading,
  body,
  detail,
  isGuest,
  onRunAnother,
}: ReportSubmittedModalProps) {
  const router = useRouter()

  function handleClose() {
    router.push(isGuest ? '/login' : '/dashboard')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative max-w-lg w-full p-10 rounded-2xl bg-dark-700 border border-primary text-center shadow-2xl"
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
