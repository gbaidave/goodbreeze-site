'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { isValidPhone, normalizePhone } from '@/lib/phone'
import TurnstileWidget from '@/components/auth/TurnstileWidget'

const CREDIT_PRODUCT_LABELS: Record<string, string> = {
  spark_pack: 'Spark Pack purchase',
  spark_pack_credits: 'Spark Pack purchase',
  boost_pack: 'Boost Pack purchase',
  boost_pack_credits: 'Boost Pack purchase',
  impulse: 'Impulse Pack purchase',
  impulse_pack: 'Impulse Pack purchase',
  impulse_pack_credits: 'Impulse Pack purchase',
  free_credit: 'Free credit',
  signup_credit: 'Signup bonus',
  signup_bonus: 'Signup bonus',
  testimonial_reward: 'Testimonial reward',
  referral_credit: 'Referral reward',
  admin_grant: 'Granted by admin',
  credit_grant: 'Granted by admin',
}

const CREDIT_SOURCE_LABELS: Record<string, string> = {
  signup: 'Signup bonus',
  pack: 'Credit pack purchase',
  referral: 'Referral reward',
  testimonial: 'Testimonial reward',
  admin_grant: 'Granted by admin',
  subscription: 'Subscription credit',
}

function creditRowLabel(
  product: string | null,
  source: string | null,
  balance: number,
  stripePiId: string | null,
  refundedPaymentIds: Set<string>
): string {
  // If balance is 0, determine why
  if (balance === 0) {
    // Check if this payment was refunded
    if (stripePiId && refundedPaymentIds.has(stripePiId)) {
      const packLabel = product ? (CREDIT_PRODUCT_LABELS[product] ?? null) : null
      return packLabel ? `Refunded — ${packLabel.replace(' purchase', '')}` : 'Refunded'
    }
    return 'Used on report'
  }
  // Balance > 0 — show what it's from
  if (product && CREDIT_PRODUCT_LABELS[product]) return CREDIT_PRODUCT_LABELS[product]!
  if (source && CREDIT_SOURCE_LABELS[source]) return CREDIT_SOURCE_LABELS[source]!
  if (product) return product.replace(/_/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase())
  return 'Credit added'
}

interface CreditHistoryItem {
  id: string
  balance: number
  product: string | null
  purchased_at: string
  source: string | null
  stripe_payment_intent_id: string | null
}

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
  creditHistory?: CreditHistoryItem[]
  refundedPaymentIds?: Set<string>
  initialEmailPrefs: { nudge_emails: boolean; support_emails: boolean; referral_credit: boolean; report_ready: boolean; support_confirmation: boolean; report_failure: boolean; testimonial_approved: boolean; bug_updates: boolean }
  initialNotifPrefs: { billing_payments?: boolean; refund_decisions?: boolean; account_security?: boolean; nudge_emails: boolean; support_emails: boolean; referral_credit: boolean; report_ready: boolean; support_confirmation: boolean; report_failure: boolean; testimonial_approved: boolean; bug_updates: boolean }
  isEmailUser: boolean
  dataExportLocked: boolean
  hasRecentPackCredits: boolean
  openTicketCount: number
  openRefundExists: boolean
  openDisputeExists: boolean
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
  creditHistory,
  refundedPaymentIds = new Set(),
  initialEmailPrefs,
  initialNotifPrefs,
  isEmailUser,
  dataExportLocked,
  hasRecentPackCredits,
  openTicketCount,
  openRefundExists,
  openDisputeExists,
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
  // Email preferences
  const [emailPrefsOpen, setEmailPrefsOpen] = useState(false)
  const [nudgeEmails, setNudgeEmails] = useState(initialEmailPrefs.nudge_emails)
  const [supportEmails, setSupportEmails] = useState(initialEmailPrefs.support_emails)
  const [referralCredit, setReferralCredit] = useState(initialEmailPrefs.referral_credit)
  const [reportReady, setReportReady] = useState(initialEmailPrefs.report_ready)
  const [supportConfirmation, setSupportConfirmation] = useState(initialEmailPrefs.support_confirmation)
  const [reportFailure, setReportFailure] = useState(initialEmailPrefs.report_failure)
  const [testimonialApproved, setTestimonialApproved] = useState(initialEmailPrefs.testimonial_approved)
  const [bugUpdates, setBugUpdates] = useState(initialEmailPrefs.bug_updates)
  // Push notification preferences — forced rows (email locked, push toggleable)
  const [pushBillingPayments, setPushBillingPayments] = useState(initialNotifPrefs.billing_payments ?? false)
  const [pushRefundDecisions, setPushRefundDecisions] = useState(initialNotifPrefs.refund_decisions ?? false)
  const [pushAccountSecurity, setPushAccountSecurity] = useState(initialNotifPrefs.account_security ?? false)
  // Push notification preferences
  const [pushReportReady, setPushReportReady] = useState(initialNotifPrefs.report_ready)
  const [pushNudgeEmails, setPushNudgeEmails] = useState(initialNotifPrefs.nudge_emails)
  const [pushSupportEmails, setPushSupportEmails] = useState(initialNotifPrefs.support_emails)
  const [pushSupportConfirmation, setPushSupportConfirmation] = useState(initialNotifPrefs.support_confirmation)
  const [pushReportFailure, setPushReportFailure] = useState(initialNotifPrefs.report_failure)
  const [pushReferralCredit, setPushReferralCredit] = useState(initialNotifPrefs.referral_credit)
  const [pushTestimonialApproved, setPushTestimonialApproved] = useState(initialNotifPrefs.testimonial_approved)
  const [pushBugUpdates, setPushBugUpdates] = useState(initialNotifPrefs.bug_updates)
  const [showAllCredits, setShowAllCredits] = useState(false)
  const [emailPrefsSaving, setEmailPrefsSaving] = useState(false)
  const [emailPrefsMsg, setEmailPrefsMsg] = useState('')
  // Data export
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')
  // Account deletion
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [deleteCaptchaToken, setDeleteCaptchaToken] = useState('')

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
    await fetch('/api/auth/send-password-reset', { method: 'POST' })
    setResetLoading(false)
    setResetSent(true)
  }

  async function saveEmailPrefs() {
    setEmailPrefsSaving(true)
    setEmailPrefsMsg('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('profiles')
        .update({
          email_preferences: { nudge_emails: nudgeEmails, support_emails: supportEmails, referral_credit: referralCredit, report_ready: reportReady, support_confirmation: supportConfirmation, report_failure: reportFailure, testimonial_approved: testimonialApproved, bug_updates: bugUpdates },
          notification_preferences: { billing_payments: pushBillingPayments, refund_decisions: pushRefundDecisions, account_security: pushAccountSecurity, report_ready: pushReportReady, nudge_emails: pushNudgeEmails, support_emails: pushSupportEmails, support_confirmation: pushSupportConfirmation, report_failure: pushReportFailure, referral_credit: pushReferralCredit, testimonial_approved: pushTestimonialApproved, bug_updates: pushBugUpdates },
        })
        .eq('id', user.id)
      if (error) throw error
      setEmailPrefsMsg('Saved!')
    } catch {
      setEmailPrefsMsg('Failed to save. Try again.')
    } finally {
      setEmailPrefsSaving(false)
    }
  }

  async function downloadData() {
    setExporting(true)
    setExportError('')
    try {
      const res = await fetch('/api/account/export')
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (data.error === 'DATA_EXPORT_LOCKED') {
          setExportError('LOCKED')
        } else {
          setExportError('Export failed. Please try again.')
        }
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const dateStr = new Date().toISOString().split('T')[0]
      a.href = url
      a.download = `goodbreeze-data-export-${dateStr}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      setExportError('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  async function deleteAccount() {
    setDeleting(true)
    setDeleteError('')
    try {
      // Verify password client-side for email/password users before calling the delete API.
      // Server-side signInWithPassword is unreliable (CAPTCHA context, session mismatches),
      // so we verify here where we have the full auth context.
      if (isEmailUser) {
        const supabase = createClient()
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password: deletePassword,
          options: deleteCaptchaToken ? { captchaToken: deleteCaptchaToken } : undefined,
        })
        if (authError) {
          setDeleteCaptchaToken('')
          setDeleteError('Incorrect password. Please try again.')
          return
        }
      }
      const body: Record<string, string> = {}
      if (isEmailUser) body.password = deletePassword
      const res = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setDeleteError(data.message || 'Deletion failed. Please try again.')
        return
      }
      // Sign out and redirect
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch {
      setDeleteError('Deletion failed. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const isPrivileged = role === 'superadmin' || role === 'admin' || role === 'support' || role === 'tester'

  const planLabel =
    role === 'superadmin' ? 'Superadmin' :
    role === 'admin' ? 'Admin' :
    role === 'support' ? 'Support' :
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

          {/* Autofill trap — prevents browser from filling real phone/password fields */}
          <input type="text" aria-hidden="true" tabIndex={-1} autoComplete="username" className="sr-only" readOnly />
          <input type="password" aria-hidden="true" tabIndex={-1} autoComplete="current-password" className="sr-only" readOnly />

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
                <p className="text-xs text-gray-500 mt-0.5">Full access. No billing required.</p>
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
                      {creditsRemaining + totalCredits} credit{creditsRemaining + totalCredits !== 1 ? 's' : ''} remaining
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Resets to plan cap each billing period</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-white font-medium">
                      {totalCredits > 0
                        ? `${totalCredits} credit${totalCredits !== 1 ? 's' : ''} remaining`
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
                  href="/reports"
                  className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Run a report →
                </Link>
              )}
            </div>
          )}

          {/* Credit history */}
          {!isPrivileged && creditHistory && creditHistory.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Credit history</p>
              <div className="divide-y divide-primary/10 border border-gray-800 rounded-xl overflow-hidden">
                {(showAllCredits ? creditHistory : creditHistory.slice(0, 5)).map((c) => (
                  <div key={c.id} className="flex items-center justify-between px-4 py-2.5">
                    <div>
                      <p className="text-sm text-white">
                        {creditRowLabel(c.product, c.source, c.balance, c.stripe_payment_intent_id ?? null, refundedPaymentIds)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(c.purchased_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </p>
                    </div>
                    <span className={`text-sm font-medium ${c.balance > 0 ? 'text-white' : 'text-gray-500'}`}>
                      {c.balance > 0 ? `${c.balance} remaining` : ''}
                    </span>
                  </div>
                ))}
              </div>
              {!showAllCredits && creditHistory.length > 5 && (
                <button
                  onClick={() => setShowAllCredits(true)}
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Show all ({creditHistory.length})
                </button>
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
              <p className="text-xs text-center text-gray-600">
                <a href="/refund-policy" className="hover:text-gray-400 underline transition-colors">Refund policy</a>
                {' · '}
                <a href="/support" className="hover:text-gray-400 underline transition-colors">Request a refund</a>
              </p>
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
                View plans, starting at $20/month
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

        {/* Notifications Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-dark-700 border border-primary/20 rounded-2xl overflow-hidden"
        >
          <button
            type="button"
            onClick={() => setEmailPrefsOpen(!emailPrefsOpen)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
          >
            <h2 className="text-lg font-semibold text-white">Notifications</h2>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${emailPrefsOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {emailPrefsOpen && (
            <div className="px-6 pb-6 border-t border-gray-800 pt-4">
              <p className="text-sm text-gray-500 mb-4">
                Mandatory notifications (account, billing, security) are always sent.
              </p>

              {/* Notification preferences table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500 uppercase tracking-wide w-full">Type</th>
                      <th className="text-center py-2 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Email</th>
                      <th className="text-center py-2 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Push</th>
                      <th className="text-center py-2 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap">
                        SMS
                        <span className="block text-[10px] text-gray-600 font-normal normal-case tracking-normal">Coming soon</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {/* Forced-on rows — email always sent (locked), push is toggleable */}
                    {([
                      { label: 'Billing & payments',  desc: 'Payment confirmations and receipts.',                      push: pushBillingPayments, setPush: setPushBillingPayments },
                      { label: 'Refund decisions',     desc: 'When your refund request is approved or denied.',          push: pushRefundDecisions, setPush: setPushRefundDecisions },
                      { label: 'Account security',     desc: 'Security alerts such as phone number changes.',            push: pushAccountSecurity, setPush: setPushAccountSecurity },
                    ]).map((row) => (
                      <tr key={row.label}>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-1.5">
                            <p className="text-white font-medium text-sm">{row.label}</p>
                            <span className="text-[10px] font-medium text-gray-500 border border-gray-700 rounded px-1">Required</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{row.desc}</p>
                        </td>
                        <td className="text-center px-4">
                          <input type="checkbox" checked disabled className="w-4 h-4 opacity-60 cursor-not-allowed" />
                        </td>
                        <td className="text-center px-4">
                          <input
                            type="checkbox"
                            checked={row.push}
                            onChange={(e) => row.setPush(e.target.checked)}
                            className="w-4 h-4 accent-primary cursor-pointer"
                          />
                        </td>
                        <td className="text-center px-4">
                          <input type="checkbox" checked={false} disabled className="w-4 h-4 opacity-30 cursor-not-allowed" />
                        </td>
                      </tr>
                    ))}
                    {/* Divider */}
                    <tr><td colSpan={4} className="py-1" /></tr>
                    {/* Toggleable rows */}
                    {([
                      { key: 'report_ready',        label: 'Report delivery',       desc: 'When your report is ready to view.',                           email: reportReady,         setEmail: setReportReady,         push: pushReportReady,         setPush: setPushReportReady },
                      { key: 'nudge_emails',        label: 'Credit reminders',      desc: 'When credits are running low or exhausted.',                   email: nudgeEmails,         setEmail: setNudgeEmails,         push: pushNudgeEmails,         setPush: setPushNudgeEmails },
                      { key: 'support_emails',      label: 'Support updates',       desc: 'When a support request gets a reply, is resolved, or closed.', email: supportEmails,       setEmail: setSupportEmails,       push: pushSupportEmails,       setPush: setPushSupportEmails },
                      { key: 'support_confirmation',label: 'Request confirmation',  desc: 'Confirmation when you submit a support request.',              email: supportConfirmation, setEmail: setSupportConfirmation, push: pushSupportConfirmation, setPush: setPushSupportConfirmation },
                      { key: 'report_failure',      label: 'Report failure alerts', desc: 'When a report fails and needs attention.',                     email: reportFailure,       setEmail: setReportFailure,       push: pushReportFailure,       setPush: setPushReportFailure },
                      { key: 'referral_credit',     label: 'Referral credits',      desc: 'When you earn credits for referring someone.',                 email: referralCredit,      setEmail: setReferralCredit,      push: pushReferralCredit,      setPush: setPushReferralCredit },
                      { key: 'testimonial_approved',label: 'Testimonial approval',  desc: 'When your testimonial is approved and reward is added.',       email: testimonialApproved, setEmail: setTestimonialApproved, push: pushTestimonialApproved, setPush: setPushTestimonialApproved },
                      { key: 'bug_updates',         label: 'Bug report updates',    desc: 'When your bug report gets a reply or status change.',          email: bugUpdates,          setEmail: setBugUpdates,          push: pushBugUpdates,          setPush: setPushBugUpdates },
                    ] as { key: string; label: string; desc: string; email: boolean; setEmail: (v: boolean) => void; push: boolean; setPush: (v: boolean) => void }[]).map((row) => (
                      <tr key={row.key}>
                        <td className="py-3 pr-4">
                          <p className="text-white font-medium text-sm">{row.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{row.desc}</p>
                        </td>
                        <td className="text-center px-4">
                          <input
                            type="checkbox"
                            checked={row.email}
                            onChange={(e) => row.setEmail(e.target.checked)}
                            className="w-4 h-4 accent-primary cursor-pointer"
                          />
                        </td>
                        <td className="text-center px-4">
                          <input
                            type="checkbox"
                            checked={row.push}
                            onChange={(e) => row.setPush(e.target.checked)}
                            className="w-4 h-4 accent-primary cursor-pointer"
                          />
                        </td>
                        <td className="text-center px-4">
                          <input
                            type="checkbox"
                            checked={false}
                            disabled
                            className="w-4 h-4 opacity-30 cursor-not-allowed"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={saveEmailPrefs}
                  disabled={emailPrefsSaving}
                  className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent-blue text-white text-sm font-medium rounded-xl disabled:opacity-40 hover:shadow-lg hover:shadow-primary/20 transition-all"
                >
                  {emailPrefsSaving ? 'Saving…' : 'Save preferences'}
                </button>
                {emailPrefsMsg && (
                  <p className={`text-sm ${emailPrefsMsg === 'Saved!' ? 'text-green-400' : 'text-red-400'}`}>
                    {emailPrefsMsg}
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Your Data Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-700 border border-primary/20 rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-white">Your Data</h2>
          <p className="text-sm text-gray-400">
            Download a copy of all data associated with your account — profile, reports, credits, support history, and referrals.
          </p>
          {exportError === 'LOCKED' || dataExportLocked ? (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3">
              <p className="text-sm text-yellow-400">
                Data export is locked.{' '}
                <a href="/support" className="underline hover:text-yellow-300 transition-colors">Contact support</a>
                {' '}to request access.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={downloadData}
                disabled={exporting}
                className="px-5 py-2.5 border border-primary/30 text-primary text-sm font-medium rounded-xl hover:bg-primary/10 transition-colors disabled:opacity-40"
              >
                {exporting ? 'Preparing download…' : 'Download my data'}
              </button>
              {exportError && <p className="text-xs text-red-400">{exportError}</p>}
            </div>
          )}
        </motion.div>

        {/* Danger Zone Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-dark-700 border border-red-500/30 rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
          <p className="text-sm text-gray-400">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button
            onClick={() => { setShowDeleteModal(true); setDeleteError(''); setDeletePassword(''); setDeleteConfirmText('') }}
            className="px-5 py-2.5 bg-red-500/10 border border-red-500/40 text-red-400 text-sm font-medium rounded-xl hover:bg-red-500/20 transition-colors"
          >
            Delete account
          </button>
        </motion.div>

        {/* Delete account modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-[#111118] border border-red-500/30 rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl">
              <div>
                <h3 className="text-lg font-semibold text-white">Permanently delete your account?</h3>
                <p className="text-sm text-gray-500 mt-1">This cannot be undone.</p>
              </div>

              {/* What gets deleted */}
              <ul className="space-y-1.5 text-sm text-gray-400">
                <li className="flex gap-2"><span className="text-red-400 mt-0.5">✕</span> Your profile, email, and login credentials</li>
                <li className="flex gap-2"><span className="text-red-400 mt-0.5">✕</span> All reports you&apos;ve generated</li>
                <li className="flex gap-2"><span className="text-red-400 mt-0.5">✕</span> Your credits and referral history</li>
                {(status === 'active' || status === 'trialing') && isSubscription && (
                  <li className="flex gap-2"><span className="text-red-400 mt-0.5">✕</span> Your <strong className="text-white">{planLabel}</strong> subscription — cancelled immediately</li>
                )}
              </ul>

              {/* Credit pack refund nudge */}
              {hasRecentPackCredits && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 text-sm text-yellow-400">
                  You have unused report credits from a recent purchase. If you may be eligible for a refund,{' '}
                  <a href="/support?category=refund" className="underline hover:text-yellow-300 transition-colors">submit a refund request</a>
                  {' '}before deleting.
                </div>
              )}

              {/* Subscription refund nudge */}
              {(status === 'active' || status === 'trialing') && isSubscription && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 text-sm text-yellow-400">
                  Your <strong className="text-white">{planLabel}</strong> subscription will be cancelled immediately. If you may be eligible for a refund,{' '}
                  <a href="/support?category=refund" className="underline hover:text-yellow-300 transition-colors">submit a refund request</a>
                  {' '}before deleting.
                </div>
              )}

              {/* Open refund/dispute block */}
              {(openRefundExists || openDisputeExists) && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
                  You have an open {openDisputeExists ? 'dispute' : 'refund request'}. Please wait for it to be resolved before deleting your account.
                </div>
              )}

              {/* Open support ticket warning */}
              {openTicketCount > 0 && (
                <div className="bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-400">
                  You have <strong className="text-white">{openTicketCount}</strong> open support request{openTicketCount !== 1 ? 's' : ''}.
                  {' '}Check your <a href="/support" className="underline hover:text-gray-300 transition-colors">support history</a> and make sure nothing critical needs resolution — everything will be permanently deleted and unrecoverable.
                </div>
              )}

              {/* Download nudge */}
              <div className="text-sm text-gray-500">
                {dataExportLocked
                  ? <span className="text-yellow-500">Data export is locked — <a href="/support" className="underline hover:text-yellow-400 transition-colors">contact support</a> to unlock before deleting.</span>
                  : <button type="button" onClick={downloadData} disabled={exporting} className="text-primary underline hover:text-primary/80 transition-colors disabled:opacity-40">{exporting ? 'Preparing…' : 'Download your data first →'}</button>
                }
              </div>

              {/* Password field — email/password users only */}
              {isEmailUser && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Confirm your password</label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="Your current password"
                    className="w-full bg-dark border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500/60 transition-colors"
                  />
                  <TurnstileWidget
                    onVerify={setDeleteCaptchaToken}
                    onError={() => setDeleteCaptchaToken('')}
                  />
                </div>
              )}

              {/* Type DELETE to confirm */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  Type <span className="font-mono text-white">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  autoComplete="off"
                  placeholder="DELETE"
                  className="w-full bg-dark border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500/60 transition-colors font-mono"
                />
              </div>

              {deleteError && <p className="text-sm text-red-400">{deleteError}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={deleteAccount}
                  disabled={
                    deleting ||
                    openRefundExists ||
                    openDisputeExists ||
                    deleteConfirmText !== 'DELETE' ||
                    (isEmailUser && !deletePassword) ||
                    (isEmailUser && !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !deleteCaptchaToken)
                  }
                  className="flex-1 py-2.5 bg-red-500/20 border border-red-500/40 text-red-400 text-sm font-semibold rounded-xl hover:bg-red-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting…' : 'Delete my account'}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 py-2.5 border border-gray-700 text-gray-400 text-sm rounded-xl hover:border-gray-500 transition-colors disabled:opacity-40"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

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
