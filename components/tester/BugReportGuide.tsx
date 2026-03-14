'use client'

import { useState } from 'react'

export function BugReportGuide() {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-medium text-zinc-300">What to include in your report</span>
        <svg className={`w-4 h-4 text-zinc-500 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 text-sm text-zinc-400 border-t border-zinc-700/60 pt-3">
          <p>The more detail you give, the faster it gets fixed. Try to include:</p>
          <ul className="space-y-1.5 pl-4 list-disc marker:text-zinc-600">
            <li><span className="text-zinc-300">What you did</span> — the steps you took, starting from which page you were on</li>
            <li><span className="text-zinc-300">What you expected</span> — what should have happened</li>
            <li><span className="text-zinc-300">What actually happened</span> — what the app did instead (copy any error messages exactly)</li>
            <li><span className="text-zinc-300">Does it happen every time?</span> — or only sometimes</li>
            <li><span className="text-zinc-300">Your browser and device</span> — e.g. Chrome on Windows, Safari on iPhone (if relevant)</li>
          </ul>
          <p className="text-zinc-500">Screenshots or recordings are always helpful — attach them below.</p>
        </div>
      )}
    </div>
  )
}
