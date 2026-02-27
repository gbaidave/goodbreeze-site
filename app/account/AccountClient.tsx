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
  role: string
  plan: string
  status?: string
  currentPeriodEnd?: string
  cancelAtPeriodEnd: boolean
  hasStripeCustomer: boolean
  totalCredits: number    // pack credits (credits table)
  creditsRemaining: number  // subscription credits (subscriptions.credits_remaining)
  creditExpiry?: string
}

export default function AccountClient({
  initialName,
  initialPhone,
  initialSmsOk,
  email,
  role,
  plan,
  status,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  hasStripeCustomer,
  totalCredits,
  creditsRemaining,
  creditExpiry,
}: Props) {
  const [name, setName] = useState(initialName)
  const [phone, setPhone] = useState(initialPhone)
  const [smsOk, setSmsOk] = useState(initialSmsOk)
  const [phoneError, setPhoneError] = useState('')
  const [phonePassword, setPhonePassword] = useState('')
  const [phonePasswordError, setPhonePasswordError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [portalLoading, setPortalLoading] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  // Email change
  const [newEmail, setNewEmail] = useState(email)
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailMsg, setEmailMsg] = useState('')
  const [emailError, setEmailError] = useState('')

  const hasChanges = name !== initialName || phone !== initialPhone || smsOk !== initialSmsOk
  const phoneChanged = phone !== initialPhone

  async function saveProfile() {
    setPhoneError('')
    setPhonePasswordError('')
    if (phone.trim() && !isValidPhone(phone)) {
      setPhoneError('Enter a valid phone number (e.g. +1 555 000 0000)')
      return
    }
    if (phoneChanged && !phonePassword) {
      setPhonePasswordError('Enter your current password to change your phone number.')
      return
    }
    setSaving(true)
    setSaveMsg('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Save name + sms_ok directly (no dedup concerns)
      const { error } = await supabase
        .from('profiles')
        .update({ name, sms_ok: smsOk })
        .eq('id', user.id)
      if (error) throw error

      // Save phone via server route (runs dedup check + password verification)
      if (phoneChanged) {
        const res = await fetch('/api/account/save-phone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: phone.trim(), currentPassword: phonePassword }),
        })
        const data = await res.json()
        if (!res.ok) {
          if (data.code === 'PHONE_DUPLICATE') {
            setPhoneError(data.error)
          } else if (data.code === 'WRONG_PASSWORD') {
            setPhonePasswordError('Current password is incorrect.')
          } else {
            throw new Error(data.error || 'Phone save failed')
          }
          return
        }
        setPhonePassword('')
      }

      setSaveMsg('Saved!')
    } catch {
      setSaveMsg('Failed to save. Try again.')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMsg(''), 3000)
    }
  }

  async function saveEmail() {
    setEmailError('')
    setEmailMsg('')
    if (!newEmail || !newEmail.includes('@')) {
      setEmailError('Enter a valid email address.')
      return
    }
    if (newEmail === email) {
      setEmailError('This is already your current email.')
      return
    }
    setEmailSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ email: newEmail })
      if (error) {
        setEmailError(error.message)
        return
      }
      setEmailMsg('Confirmation emails sent. Check both your old and new inbox and click the links in each to complete the change.')
    } catch {
      setEmailError('Failed to request email change. Try again.')
    } finally {
      setEmailSaving(false)
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

  async function sendPasswordReset() {
    setResetLoading(true)
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?returnUrl=/reset-password`,
    })
    setResetLoading(false)
    setResetSent(true)
  }

  const isPrivileged = role === 'admin' || role === 'tester'

  const planLabel =
    role === 'admin' ? 'Admin' :
    role === 'tester' ? 'Tester' :
    plan === 'starter' ? 'Starter' :
    plan === 'growth' ? 'Growth' :
    plan === 'pro' ? 'Pro' :
    plan === 'spark_pack' ? 'Spark Pack' :
    plan === 'boost_pack' ? 'Boost Pack' :
    plan === 'impulse' ? 'Impulse' : 'Free'

  const isSubscription = plan === 'starter' || plan === 'growth' || plan === 'pro'
  const isPaid = isSubscription || plan === 'impulse' || plan === 'spark_pack' || plan === 'boost_pack'

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
              value={newEmail}
              onChange={(e) => { setNewEmail(e.target.value); setEmailError(''); setEmailMsg('') }}
              className="w-full bg-dark border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary transition-colors text-sm"
              placeholder="your@email.com"
            />
            {emailError && <p className="text-xs text-red-400 mt-1">{emailError}</p>}
            {emailMsg && <p className="text-xs text-green-400 mt-1">{emailMsg}</p>}
            {newEmail !== email && !emailMsg && (
              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={saveEmail}
                  disabled={emailSaving}
                  className="px-4 py-1.5 bg-gradient-to-r from-primary to-accent-blue text-white text-xs font-medium rounded-lg disabled:opacity-40 hover:shadow-lg hover:shadow-primary/20 transition-all"
                >
                  {emailSaving ? 'Sending…' : 'Change email'}
                </button>
                <button
                  onClick={() => { setNewEmail(email); setEmailError(''); setEmailMsg('') }}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
            <p className="text-xs text-gray-600 mt-1">
              Both your old and new email must confirm the change.
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

          {/* Current password — required only when changing phone */}
          {phoneChanged && (
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Current password <span className="text-gray-600">(required to change phone)</span></label>
              <input
                type="password"
                value={phonePassword}
                onChange={(e) => { setPhonePassword(e.target.value); setPhonePasswordError('') }}
                autoComplete="current-password"
                className={`w-full bg-dark border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors
                  ${phonePasswordError ? 'border-red-500' : 'border-gray-700'}`}
                placeholder="Your current password"
              />
              {phonePasswordError && <p className="text-xs text-red-400 mt-1">{phonePasswordError}</p>}
            </div>
          )}

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
              <p className="text-white font-medium">
                {isPrivileged ? `${planLabel} Account` : `${planLabel} Plan`}
              </p>
              {isPrivileged && (
                <p className="text-xs text-gray-500 mt-0.5">Full access — no billing required.</p>
              )}
              {!isPrivileged && status && status !== 'active' && status !== 'trialing' && (
                <p className="text-xs text-yellow-400 mt-0.5 capitalize">{status.replace('_', ' ')}</p>
              )}
              {!isPrivileged && currentPeriodEnd && isSubscription && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {cancelAtPeriodEnd ? 'Cancels on' : 'Renews'}{' '}
                  {new Date(currentPeriodEnd).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric',
                  })}
                </p>
              )}
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
              isPrivileged
                ? 'bg-primary/10 text-primary border-primary/30'
                : plan === 'starter'
                ? 'bg-primary/10 text-primary border-primary/30'
                : plan === 'impulse'
                ? 'bg-accent-blue/10 text-accent-blue border-accent-blue/30'
                : 'bg-gray-800 text-gray-400 border-gray-700'
            }`}>
              {planLabel}
            </span>
          </div>

          {/* Credit balance — show for all non-privileged users */}
          {!isPrivileged && (
            <div className="bg-dark/50 border border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                {isSubscription ? (
                  <>
                    <p className="text-sm text-white font-medium">
                      {creditsRemaining + totalCredits} report credit{creditsRemaining + totalCredits !== 1 ? 's' : ''} remaining
                    </p>
                    {totalCredits > 0 ? (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {creditsRemaining} plan + {totalCredits} pack — resets each billing period
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-0.5">Resets to plan cap each billing period</p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-sm text-white font-medium">
                      {totalCredits > 0
                        ? `${totalCredits} report credit${totalCredits !== 1 ? 's' : ''} remaining`
                        : 'No credits remaining'}
                    </p>
                    {totalCredits > 0 && creditExpiry && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Expires {new Date(creditExpiry).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </p>
                    )}
                    {totalCredits === 0 && (
                      <p className="text-xs text-gray-500 mt-0.5">Buy credits or earn them via referrals.</p>
                    )}
                  </>
                )}
              </div>
              {!isSubscription && totalCredits === 0 ? (
                <Link
                  href="/pricing"
                  className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Buy credits →
                </Link>
              ) : (
                <Link
                  href="/tools"
                  className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Run a report →
                </Link>
              )}
            </div>
          )}

          {/* Billing portal — for all users with a Stripe customer ID */}
          {!isPrivileged && hasStripeCustomer && (
            <div className="space-y-2">
              <button
                onClick={openBillingPortal}
                disabled={portalLoading}
                className="w-full py-3 border border-primary/30 text-primary text-sm font-medium rounded-xl hover:bg-primary/10 transition-colors disabled:opacity-40"
              >
                {portalLoading ? 'Opening…' : 'Manage billing, invoices & payment method →'}
              </button>
              {isSubscription && !cancelAtPeriodEnd && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full py-2.5 text-sm text-gray-500 hover:text-red-400 transition-colors"
                >
                  Cancel subscription
                </button>
              )}
              {cancelAtPeriodEnd && currentPeriodEnd && (
                <p className="text-xs text-yellow-400 text-center">
                  Cancellation scheduled. Access until {new Date(currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
                </p>
              )}
            </div>
          )}

          {/* Cancel confirm dialog */}
          {showCancelConfirm && (
            <div className="bg-dark/80 border border-red-500/30 rounded-xl p-5 space-y-4">
              <p className="text-white font-semibold text-sm">Cancel your {planLabel} plan?</p>
              <p className="text-gray-400 text-sm">
                You&apos;ll keep full access until{' '}
                {currentPeriodEnd
                  ? new Date(currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                  : 'the end of your billing period'}
                . Your subscription won&apos;t renew after that.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowCancelConfirm(false); openBillingPortal() }}
                  disabled={portalLoading}
                  className="flex-1 py-2.5 bg-red-500/20 border border-red-500/40 text-red-400 text-sm font-medium rounded-xl hover:bg-red-500/30 transition-colors disabled:opacity-40"
                >
                  Yes, cancel my plan
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-2.5 border border-gray-700 text-gray-400 text-sm rounded-xl hover:border-gray-500 transition-colors"
                >
                  Keep my plan
                </button>
              </div>
            </div>
          )}

          {/* Upgrade CTAs — for free users only */}
          {!isPrivileged && plan === 'free' && (
            <div className="space-y-2.5">
              <Link
                href="/pricing"
                className="block w-full py-3 text-center bg-gradient-to-r from-primary to-accent-blue text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all"
              >
                View plans — from $20/month
              </Link>
              <Link
                href="/pricing"
                className="block w-full py-3 text-center border border-gray-700 text-gray-400 text-sm rounded-xl hover:border-gray-500 hover:text-gray-300 transition-colors"
              >
                Or get a credit pack (no subscription)
              </Link>
            </div>
          )}
        </motion.div>

        {/* Security Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-700 border border-primary/20 rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-white">Security</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white font-medium">Password</p>
              <p className="text-xs text-gray-500 mt-0.5">Send a reset link to {email}</p>
            </div>
            {resetSent ? (
              <p className="text-sm text-green-400">Reset link sent!</p>
            ) : (
              <button
                onClick={sendPasswordReset}
                disabled={resetLoading}
                className="px-4 py-2 text-sm border border-primary/30 text-primary rounded-xl hover:bg-primary/10 transition-colors disabled:opacity-40"
              >
                {resetLoading ? 'Sending…' : 'Send reset link'}
              </button>
            )}
          </div>
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
