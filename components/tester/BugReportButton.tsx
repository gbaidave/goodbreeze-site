'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

export function BugReportButton() {
  const [role, setRole] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.role) setRole(data.role)
        })
    })
  }, [])

  if (role !== 'tester') return null

  function handleClose() {
    setOpen(false)
    setError('')
    if (submitted) {
      setSubmitted(false)
      setTitle('')
      setDescription('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (description.trim().length < 10) {
      setError('Please describe the bug (at least 10 characters).')
      return
    }
    setSubmitting(true)
    try {
      const message = title.trim()
        ? `[Bug Report] ${title.trim()}\n\n${description.trim()}`
        : `[Bug Report]\n\n${description.trim()}`
      const res = await fetch('/api/bug-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }
      setSubmitted(true)
      setTimeout(() => {
        setOpen(false)
        setSubmitted(false)
        setTitle('')
        setDescription('')
      }, 3000)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-zinc-800 border border-zinc-600 text-zinc-400 hover:text-white hover:border-zinc-400 rounded-full text-sm font-medium shadow-lg transition-all"
        aria-label="Report a bug"
      >
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        Bug
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-8 shadow-2xl"
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {submitted ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold mb-1">Bug report sent</h3>
                  <p className="text-zinc-400 text-sm">Dave has been notified. Thanks!</p>
                </div>
              ) : (
                <>
                  <h3 className="text-white font-bold text-lg mb-1">Report a Bug</h3>
                  <p className="text-zinc-400 text-sm mb-5">Goes to Dave&apos;s email and the support inbox.</p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                        Title <span className="text-zinc-500 font-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-white rounded-xl focus:outline-none focus:border-primary transition-colors text-sm placeholder-zinc-600"
                        placeholder="Short summary of the issue"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description *</label>
                      <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={5}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-white rounded-xl focus:outline-none focus:border-primary transition-colors text-sm placeholder-zinc-600 resize-none"
                        placeholder="What happened? What did you expect? Steps to reproduce..."
                        required
                      />
                    </div>
                    {error && <p className="text-red-400 text-xs">{error}</p>}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-60"
                    >
                      {submitting ? 'Sending...' : 'Send Bug Report'}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
