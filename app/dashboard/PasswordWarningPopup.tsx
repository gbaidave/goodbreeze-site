'use client'

import { useState } from 'react'

interface Props {
  daysUntilExpiry: number
  expiryDate: string
}

export function PasswordWarningPopup({ daysUntilExpiry, expiryDate }: Props) {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-700 border border-amber-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold">Password expires on {expiryDate}</h3>
            <p className="text-gray-400 text-sm mt-1">
              You have {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''} left. Update your password before it expires to avoid being locked out.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="/expired-password"
                onClick={() => setVisible(false)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm rounded-xl transition-colors"
              >
                Update password
              </a>
              <button
                onClick={() => setVisible(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Remind me later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
