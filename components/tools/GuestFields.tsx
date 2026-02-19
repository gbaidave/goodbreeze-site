'use client'

/**
 * GuestFields — Shown on tool pages when the user is not logged in.
 *
 * Collects name, email, and optional phone before they submit a frictionless report.
 * Includes a sign-in nudge for users who may already have an account.
 */

import Link from 'next/link'

interface Props {
  /** Controlled value for the name field */
  name: string
  onNameChange: (v: string) => void

  /** Controlled value for the email field */
  email: string
  onEmailChange: (v: string) => void

  /** Controlled value for the phone field (optional) */
  phone?: string
  onPhoneChange?: (v: string) => void

  /** Whether to show the phone field */
  showPhone?: boolean

  /** Field-level errors, keyed by field name */
  errors?: Partial<Record<'name' | 'email' | 'phone', string>>
}

export function GuestFields({
  name,
  onNameChange,
  email,
  onEmailChange,
  phone = '',
  onPhoneChange,
  showPhone = false,
  errors = {},
}: Props) {
  return (
    <div className="space-y-4 border border-primary/20 rounded-2xl p-5 bg-dark-700">
      <div>
        <p className="text-sm font-semibold text-white">Where should we send your report?</p>
        <p className="text-xs text-gray-400 mt-0.5">
          We'll create a free account and email you a link to access your results.{' '}
          <Link href="/login" className="text-primary hover:underline">
            Already have an account? Sign in →
          </Link>
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {/* Name */}
        <div className="space-y-1">
          <label className="text-xs text-gray-400">Your name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Jane Smith"
            autoComplete="name"
            className={`w-full bg-dark border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors
              ${errors.name ? 'border-red-500' : 'border-primary/20'}`}
          />
          {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-xs text-gray-400">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="jane@company.com"
            autoComplete="email"
            className={`w-full bg-dark border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors
              ${errors.email ? 'border-red-500' : 'border-primary/20'}`}
          />
          {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
        </div>
      </div>

      {/* Phone (optional) */}
      {showPhone && (
        <div className="space-y-1">
          <label className="text-xs text-gray-400">Phone <span className="text-gray-600">(optional)</span></label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange?.(e.target.value)}
            placeholder="+1 555 000 0000"
            autoComplete="tel"
            className={`w-full bg-dark border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors
              ${errors.phone ? 'border-red-500' : 'border-primary/20'}`}
          />
          {errors.phone && <p className="text-xs text-red-400">{errors.phone}</p>}
        </div>
      )}

      <p className="text-xs text-gray-600">
        By submitting you agree to our{' '}
        <Link href="/terms" className="text-gray-500 hover:text-gray-300">Terms</Link>
        {' '}and{' '}
        <Link href="/privacy" className="text-gray-500 hover:text-gray-300">Privacy Policy</Link>.
      </p>
    </div>
  )
}
