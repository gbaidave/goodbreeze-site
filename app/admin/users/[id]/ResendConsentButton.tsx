'use client'

import { useState } from 'react'

interface Props {
  userId: string
  consentId: string
}

export function ResendConsentButton({ userId, consentId }: Props) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleResend() {
    setState('sending')
    try {
      const res = await fetch(`/api/admin/users/${userId}/resend-consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consent_id: consentId }),
      })
      if (res.ok) {
        setState('sent')
      } else {
        setState('error')
      }
    } catch {
      setState('error')
    }
  }

  if (state === 'sent') {
    return <span className="text-green-400 text-xs">Sent</span>
  }

  return (
    <button
      onClick={handleResend}
      disabled={state === 'sending'}
      className="text-xs text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
    >
      {state === 'sending' ? 'Sending…' : state === 'error' ? 'Failed — retry' : 'Resend confirmation email'}
    </button>
  )
}
