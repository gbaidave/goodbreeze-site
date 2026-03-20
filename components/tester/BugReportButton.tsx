'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { BugReportGuide } from './BugReportGuide'

const MAX_FILES = 3
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
])

const BUG_CATEGORY_OPTIONS = [
  { value: 'login_auth',        label: 'Login / Auth' },
  { value: 'account_profile',   label: 'Account / Profile' },
  { value: 'dashboard_reports', label: 'Dashboard / Reports' },
  { value: 'payments_credits',  label: 'Payments / Credits' },
  { value: 'pdf_report_content',label: 'PDF / Report Content' },
  { value: 'navigation_ui',     label: 'Navigation / UI' },
  { value: 'other',             label: 'Other' },
]

interface BugReportButtonProps {
  /** When true, the floating trigger button is hidden (page has its own trigger). */
  hideFloatingButton?: boolean
  /** Controlled open state — set by a parent page button. */
  forceOpen?: boolean
  /** Called when the modal closes (so parent can reset forceOpen). */
  onClose?: () => void
}

export function BugReportButton({ hideFloatingButton, forceOpen, onClose }: BugReportButtonProps) {
  const [role, setRole] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [importance, setImportance] = useState<'low' | 'medium' | 'high' | ''>('')
  const [bugCategory, setBugCategory] = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [categoryOpen, setCategoryOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const categoryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setCategoryOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

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

  // Sync forceOpen prop
  useEffect(() => {
    if (forceOpen) setOpen(true)
  }, [forceOpen])

  const BUG_REPORT_ROLES = ['tester', 'support', 'admin', 'superadmin']
  if (!role || !BUG_REPORT_ROLES.includes(role)) return null

  function resetForm() {
    setSubject('')
    setImportance('')
    setBugCategory('')
    setDescription('')
    setFiles([])
    setFileError('')
    setError('')
    setSubmitted(false)
  }

  function handleClose() {
    setOpen(false)
    resetForm()
    onClose?.()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError('')
    const selected = Array.from(e.target.files ?? [])
    if (files.length + selected.length > MAX_FILES) {
      setFileError(`You can attach up to ${MAX_FILES} files.`)
      return
    }
    for (const f of selected) {
      if (f.size > MAX_FILE_SIZE) {
        setFileError(`${f.name} exceeds the 5 MB limit.`)
        return
      }
      if (!ALLOWED_TYPES.has(f.type)) {
        setFileError(`${f.name} is not an allowed file type.`)
        return
      }
    }
    setFiles(prev => [...prev, ...selected])
    // Reset input so the same file can be re-added after removal
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setFileError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (subject.trim().length < 5) {
      setError('Subject must be at least 5 characters.')
      return
    }
    if (!importance) {
      setError('Please select an importance level.')
      return
    }
    if (description.trim().length < 10) {
      setError('Please describe the bug (at least 10 characters).')
      return
    }

    setSubmitting(true)
    try {
      // 1. Submit report
      const res = await fetch('/api/bug-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          description: description.trim(),
          importance,
          bug_category: bugCategory || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }

      const { messageId } = await res.json()

      // 2. Upload attachments if any
      if (files.length > 0 && messageId) {
        const formData = new FormData()
        formData.append('messageId', messageId)
        files.forEach(f => formData.append('files', f))
        await fetch('/api/support/attachments', {
          method: 'POST',
          body: formData,
        }).catch(err => console.error('Attachment upload failed:', err))
      }

      setSubmitted(true)
      setTimeout(() => {
        setOpen(false)
        resetForm()
        onClose?.()
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
      {!hideFloatingButton && (
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
      )}

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/60 backdrop-blur-sm overflow-y-auto py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl p-8 shadow-2xl"
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
                  <h3 className="text-white font-semibold mb-1">Bug report submitted.</h3>
                  <p className="text-zinc-400 text-sm">Thanks for helping improve the app!</p>
                </div>
              ) : (
                <>
                  <h3 className="text-white font-bold text-lg mb-1">Report a Bug</h3>
                  <p className="text-zinc-400 text-sm mb-5">Goes to Dave&apos;s email and the support inbox.</p>

                  <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                        Subject <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        maxLength={120}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-white rounded-xl focus:outline-none focus:border-primary transition-colors text-sm placeholder-zinc-600"
                        placeholder="Short summary of the issue"
                        required
                      />
                    </div>

                    {/* Importance */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Importance <span className="text-red-400">*</span>
                      </label>
                      <div className="flex gap-3">
                        {(['low', 'medium', 'high'] as const).map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setImportance(level)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                              importance === level
                                ? level === 'low'
                                  ? 'bg-zinc-600 border-zinc-400 text-white'
                                  : level === 'medium'
                                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                                  : 'bg-red-500/20 border-red-400 text-red-300'
                                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                            }`}
                          >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                        Category <span className="text-zinc-500 font-normal">(optional)</span>
                      </label>
                      <div ref={categoryRef} className="relative">
                        <button
                          type="button"
                          onClick={() => setCategoryOpen(v => !v)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-zinc-800 border border-zinc-700 text-sm rounded-xl hover:border-primary/60 transition-colors"
                        >
                          <span className={bugCategory ? 'text-white' : 'text-zinc-500'}>
                            {bugCategory
                              ? BUG_CATEGORY_OPTIONS.find(o => o.value === bugCategory)?.label ?? bugCategory
                              : 'Select a category'}
                          </span>
                          <svg className="w-4 h-4 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {categoryOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-[#2a2a2a] border border-primary/40 rounded-xl shadow-xl z-50 overflow-hidden">
                            <button
                              type="button"
                              onClick={() => { setBugCategory(''); setCategoryOpen(false) }}
                              className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-primary/20 transition-colors ${!bugCategory ? 'text-primary' : 'text-zinc-400'}`}
                            >
                              Select a category
                            </button>
                            {BUG_CATEGORY_OPTIONS.map(opt => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => { setBugCategory(opt.value); setCategoryOpen(false) }}
                                className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-primary/20 transition-colors ${bugCategory === opt.value ? 'text-primary' : 'text-white'}`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Guide */}
                    <BugReportGuide />

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                        Description <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={5}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-white rounded-xl focus:outline-none focus:border-primary transition-colors text-sm placeholder-zinc-600 resize-none"
                        placeholder="What happened? What did you expect? Steps to reproduce..."
                        required
                      />
                    </div>

                    {/* File attachments */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                        Attachments <span className="text-zinc-500 font-normal">(optional — up to 3 files, 5 MB each)</span>
                      </label>
                      {files.length > 0 && (
                        <ul className="mb-2 space-y-1">
                          {files.map((f, i) => (
                            <li key={i} className="flex items-center justify-between bg-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300">
                              <span className="truncate max-w-[280px]">{f.name}</span>
                              <button
                                type="button"
                                onClick={() => removeFile(i)}
                                className="text-zinc-500 hover:text-red-400 ml-2 flex-shrink-0"
                                aria-label="Remove file"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {files.length < MAX_FILES && (
                        <>
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,.pdf,.doc,.docx,.txt"
                            onChange={handleFileChange}
                            className="hidden"
                            id="bug-report-files"
                          />
                          <label
                            htmlFor="bug-report-files"
                            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 border border-dashed border-zinc-600 text-zinc-400 hover:text-white hover:border-zinc-400 rounded-xl text-sm cursor-pointer transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            Add file
                          </label>
                        </>
                      )}
                      {fileError && <p className="text-red-400 text-xs mt-1">{fileError}</p>}
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
