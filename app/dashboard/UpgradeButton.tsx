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

  async function handleClick() {
    setLoading(true)
    captureEvent('upgrade_cta_clicked', { label })
    try {
      captureEvent('checkout_started', { label, plan })
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (err) {
      console.error('Checkout error:', err)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={className}
    >
      {loading ? 'Redirecting...' : label}
    </button>
  )
}
