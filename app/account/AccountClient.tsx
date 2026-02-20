'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { isValidPhone, normalizePhone } from '@/lib/phone'

interface Props {
  initialName: string
  initialPhone: string
  initialSmsOk: boolean
  email: string
  plan: string
  status?: string
  currentPeriodEnd?: string
  cancelAtPeriodEnd: boolean
  hasStripeCustomer: boolean
  totalCredits: number
  creditExpiry?: string
}

export default function AccountClient({
  initialName,
  initialPhone,
  initialSmsOk,
  email,
  plan,
  status,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  hasStripeCustomer,
  totalCredits,
  creditExpiry,
}: Props) {
  const [name, setName] = useState(initialName)
  const [phone, setPhone] = useState(initialPhone)
  const [smsOk, setSmsOk] = useState(initialSmsOk)
  const [phoneError, setPhoneError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [portalLoading, setPortalLoading] = useState(false)

  const hasChanges = name !== initialName || phone !== initialPhone || smsOk !== initialSmsOk

  async function saveProfile() {
    setPhoneError('')
    if (phone.trim() && !isValidPhone(phone)) {
      setPhoneError('Enter a valid phone number (e.g. +1 555 000 0000)')
      return
    }
    setSaving(true)
    setSaveMsg('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const updates: Record<string, unknown> = { name, sms_ok: smsOk }
      if (phone.trim()) updates.phone = normalizePhone(phone)
      else updates.phone = null
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
      if (error) throw error
      setSaveMsg('Saved!')
    } catch {
      setSaveMsg('Failed to save. Try again.')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMsg(''), 3000)
    }
  }

  async function openBillingPortal() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Could not open billing portal. Try again.')
      }
    } catch {
      alert('Could not open billing portal. Try again.')
    } finally {
      setPortalLoading(false)
    }
  }

  const planLabel =
    plan === 'starter' ? 'Starter' :
    plan === 'impulse' ? 'Impulse' : 'Free'

  const isPaid = plan === 'starter' || plan === 'impulse'

  return (
    <div className="min-h-screen bg-dark py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Account Settings</h1>
          <p className="text-gray-400 mt-1">Manage your profile and subscription.</p>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-700 border border-primary/20 rounded-2xl p-6 space-y-5"
        >
          <h2 className="text-lg font-semibold text-white">Profile</h2>

          {/* Name */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-dark border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary transition-colors text-sm"
              placeholder="Your name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full bg-dark/50 border border-gray-800 text-gray-500 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
            />
            <p className="text-xs text-gray-600 mt-1">
              Email is managed through your login provider and cannot be changed here.
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Phone <span className="text-gray-600">(optional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setPhoneError('') }}
              placeholder="+1 555 000 0000"
              autoComplete="tel"
              className={`w-full bg-dark border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors
                ${phoneError ? 'border-red-500' : 'border-gray-700'}`}
            />
            {phoneError
              ? <p className="text-xs text-red-400 mt-1">{phoneError}</p>
              : <p className="text-xs text-gray-600 mt-1">Used for account identification and future SMS notifications.</p>
            }
          </div>

          {/* SMS opt-in */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={smsOk}
              onChange={(e) => setSmsOk(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm text-gray-400">
              Send me SMS notifications (e.g. when reports are ready). Opt out any time.
            </span>
          </label>

          {/* Save button */}
          <div className="flex items-center gap-3">
            <button
              onClick={saveProfile}
              disabled={saving || !hasChanges}
              className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent-blue text-white text-sm font-medium rounded-xl disabled:opacity-40 hover:shadow-lg hover:shadow-primary/20 transition-all"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {saveMsg && (
              <p className={`text-sm ${saveMsg === 'Saved!' ? 'text-green-400' : 'text-red-400'}`}>
                {saveMsg}
              </p>
            )}
          </div>
        </motion.div>

        {/* Plan & Billing Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-700 border border-primary/20 rounded-2xl p-6 space-y-5"
        >
          <h2 className="text-lg font-semibold text-white">Plan & Billing</h2>

          {/* Current plan */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">{planLabel} Plan</p>
              {status && status !== 'active' && status !== 'trialing' && (
                <p className="text-xs text-yellow-400 mt-0.5 capitalize">{status.replace('_', ' ')}</p>
              )}
              {currentPeriodEnd && plan === 'starter' && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {cancelAtPeriodEnd ? 'Cancels on' : 'Renews'}{' '}
                  {new Date(currentPeriodEnd).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric',
                  })}
                </p>
              )}
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
              plan === 'starter'
                ? 'bg-primary/10 text-primary border-primary/30'
                : plan === 'impulse'
                ? 'bg-accent-blue/10 text-accent-blue border-accent-blue/30'
                : 'bg-gray-800 text-gray-400 border-gray-700'
            }`}>
              {planLabel}
            </span>
          </div>

          {/* Credit balance — show for non-starter users who have credits */}
          {totalCredits > 0 && plan !== 'starter' && (
            <div className="bg-dark/50 border border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-white font-medium">
                  {totalCredits} report credit{totalCredits !== 1 ? 's' : ''} remaining
                </p>
                {creditExpiry && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Expires {new Date(creditExpiry).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                )}
              </div>
              <Link
                href="/tools"
                className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Use credits →
              </Link>
            </div>
          )}

          {/* Billing portal — for users with a Stripe customer on paid plans */}
          {hasStripeCustomer && isPaid && (
            <button
              onClick={openBillingPortal}
              disabled={portalLoading}
              className="w-full py-3 border border-primary/30 text-primary text-sm font-medium rounded-xl hover:bg-primary/10 transition-colors disabled:opacity-40"
            >
              {portalLoading ? 'Opening…' : 'Manage billing, invoices & payment method →'}
            </button>
          )}

          {/* Upgrade CTAs — for free users */}
          {plan === 'free' && (
            <div className="space-y-2.5">
              <Link
                href="/pricing"
                className="block w-full py-3 text-center bg-gradient-to-r from-primary to-accent-blue text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all"
              >
                Upgrade to Starter — $20/month
              </Link>
              <Link
                href="/pricing"
                className="block w-full py-3 text-center border border-gray-700 text-gray-400 text-sm rounded-xl hover:border-gray-500 hover:text-gray-300 transition-colors"
              >
                View all plans
              </Link>
            </div>
          )}

          {/* Buy more credits — for users on free without a subscription */}
          {plan === 'free' && totalCredits === 0 && (
            <p className="text-xs text-gray-600 text-center -mt-1">
              Or{' '}
              <Link href="/pricing" className="text-primary hover:underline">
                buy a credit pack ($10 for 3 reports)
              </Link>{' '}
              with no subscription required.
            </p>
          )}
        </motion.div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              ← Back to dashboard
            </Link>
            <Link
              href="/support"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Get help
            </Link>
          </div>
          <SignOutButton />
        </div>

      </div>
    </div>
  )
}

function SignOutButton() {
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-40"
    >
      {loading ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
