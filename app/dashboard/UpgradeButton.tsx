'use client'

import { useState } from 'react'
import { captureEvent } from '@/lib/analytics'

interface UpgradeButtonProps {
  plan: string
  label: string
  className?: string
}

export function UpgradeButton({ plan, label, className }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleClick() {
    setLoading(true)
    setError('')
    captureEvent('upgrade_cta_clicked', { label })
    try {
      captureEvent('checkout_started', { label, plan })
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (data.code === 'PHONE_REQUIRED') {
        setError('A phone number is required before purchasing. Add one in account settings.')
      } else {
        setError(data.error ?? 'Something went wrong. Please try again.')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className={className}
      >
        {loading ? 'Redirecting...' : label}
      </button>
      {error && (
        <p className="text-xs text-red-400 mt-1.5">{error}</p>
      )}
    </div>
  )
}
