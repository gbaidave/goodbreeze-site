'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

const REJECTION_REASONS = [
  { value: 'not_enough_detail',  label: 'Not enough detail' },
  { value: 'no_gbai_mention',    label: 'Doesn\u2019t mention Good Breeze AI' },
  { value: 'video_quality',      label: 'Video quality issue' },
  { value: 'too_short',          label: 'Too short' },
  { value: 'not_a_fit',          label: 'Not a fit' },
  { value: 'duplicate',          label: 'Duplicate submission' },
  { value: 'policy_violation',   label: 'Policy violation' },
  { value: 'other',              label: 'Other' },
]

export function RejectPanel({ testimonialId }: { testimonialId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleReject(reason: string) {
    setSubmitting(true)
    setOpen(false)
    const formData = new FormData()
    formData.append('id', testimonialId)
    formData.append('status', 'rejected')
    formData.append('rejection_reason', reason)
    await fetch('/api/admin/testimonials', { method: 'POST', body: formData })
    setSubmitting(false)
    router.refresh()
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={submitting}
        className="px-4 py-2 text-sm bg-red-900/20 border border-red-900/40 text-red-400 rounded-xl hover:bg-red-900/30 transition-colors disabled:opacity-50"
      >
        {submitting ? 'Rejecting\u2026' : 'Reject'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 w-64 bg-[#2a2a2a] border-2 border-primary/50 rounded-lg shadow-2xl shadow-primary/30 overflow-hidden z-20"
          >
            <p className="px-4 py-2 text-xs text-gray-500 border-b border-primary/20">Select rejection reason</p>
            {REJECTION_REASONS.map((r) => (
              <button
                key={r.value}
                onClick={() => handleReject(r.value)}
                className="block w-full text-left px-4 py-3 text-white font-medium hover:bg-primary/30 transition-all duration-200"
              >
                {r.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
