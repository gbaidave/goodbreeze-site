'use client'

import { useState } from 'react'
import { isValidPhone } from '@/lib/phone'

interface Props {
  /** Called after the phone number has been saved successfully. Use this to re-submit the original request. */
  onPhoneSaved: () => void
}

/**
 * Inline prompt shown on tool forms and pricing when the backend returns
 * code: 'PHONE_REQUIRED'. The user enters their phone, we save it to their
 * profile, then call onPhoneSaved so the parent can retry the request.
 */
export function PhoneGatePrompt({ onPhoneSaved }: Props) {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setError('')
    if (!phone.trim()) {
      setError('Enter your phone number to continue.')
      return
    }
    if (!isValidPhone(phone)) {
      setError('Enter a valid phone number (e.g. +1 555 000 0000)')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/account/save-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to save phone number. Please try again.')
        return
      }
      onPhoneSaved()
    } catch {
      setError('Failed to save phone number. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-3">
      <div>
        <p className="text-amber-300 font-semibold text-sm">Phone number required</p>
        <p className="text-gray-400 text-sm mt-1">
          Add a phone number to your account to verify your identity and secure your account.
        </p>
      </div>
      <div className="flex gap-2">
        <input
          type="tel"
          value={phone}
          onChange={e => { setPhone(e.target.value); setError('') }}
          placeholder="+1 555 000 0000"
          autoComplete="tel"
          className="flex-1 px-4 py-2.5 bg-dark border border-gray-700 text-white rounded-xl focus:outline-none focus:border-primary transition-colors text-sm placeholder-gray-600"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !phone.trim()}
          className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent-blue text-white text-sm font-semibold rounded-xl disabled:opacity-40 hover:shadow-lg hover:shadow-primary/20 transition-all whitespace-nowrap"
        >
          {saving ? 'Saving…' : 'Save & Continue'}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <p className="text-xs text-gray-600">
        You can also update this in{' '}
        <a href="/account" className="text-primary hover:text-primary/80 transition-colors">
          Account Settings
        </a>.
      </p>
    </div>
  )
}
