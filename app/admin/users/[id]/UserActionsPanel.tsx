'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  setUserRole, setPlanOverride, grantCredits, deductCredits,
  updateEmail, updatePhone, suspendAccount, unsuspendAccount, deleteAccount,
} from './actions'

interface Props {
  userId: string
  currentRole: string
  currentOverrideType: string | null
  currentOverrideUntil: string | null
  stripeCustomerId: string | null
  currentEmail: string
  currentPhone: string
  isSuspended: boolean
}

const CONFIRM_ROLES = new Set(['tester', 'admin'])

export function UserActionsPanel({
  userId,
  currentRole,
  currentOverrideType,
  currentOverrideUntil,
  stripeCustomerId,
  currentEmail,
  currentPhone,
  isSuspended,
}: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function act(fn: () => Promise<void>, successMsg = 'Saved.') {
    startTransition(async () => {
      try {
        await fn()
        setFeedback({ type: 'ok', msg: successMsg })
      } catch (e: any) {
        setFeedback({ type: 'err', msg: e.message ?? 'Something went wrong.' })
      }
    })
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    try {
      await deleteAccount(userId)
      router.push('/admin/users')
    } catch (e: any) {
      setFeedback({ type: 'err', msg: e.message ?? 'Delete failed.' })
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div className="bg-dark-700 border border-primary/20 rounded-2xl p-6 space-y-6">
      <h2 className="text-lg font-semibold text-white">Actions</h2>

      {feedback && (
        <p className={`text-sm px-3 py-2 rounded-lg ${feedback.type === 'ok' ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
          {feedback.msg}
        </p>
      )}

      {/* Role */}
      <section className="space-y-2">
        <p className="text-gray-400 text-xs uppercase tracking-wider">Role</p>
        <div className="flex gap-2 flex-wrap">
          {['user', 'tester', 'affiliate', 'admin'].map((role) => (
            <button
              key={role}
              disabled={pending || currentRole === role}
              onClick={() => {
                if (CONFIRM_ROLES.has(role)) {
                  setConfirming(role)
                } else {
                  act(() => setUserRole(userId, role))
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors border
                ${currentRole === role
                  ? 'bg-primary/20 border-primary text-primary cursor-default'
                  : 'border-primary/20 text-gray-400 hover:text-white hover:border-primary/50'}`}
            >
              {role}
            </button>
          ))}
        </div>
        {confirming && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-yellow-900/20 border border-yellow-700/40 text-sm">
            <span className="text-yellow-300">Promote to <strong className="capitalize">{confirming}</strong>?</span>
            <button
              onClick={() => { act(() => setUserRole(userId, confirming)); setConfirming(null) }}
              disabled={pending}
              className="px-3 py-1 bg-primary text-white rounded-md text-xs font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirming(null)}
              className="px-3 py-1 border border-gray-600 text-gray-400 rounded-md text-xs hover:text-white"
            >
              Cancel
            </button>
          </div>
        )}
      </section>

      {/* Plan override */}
      <section className="space-y-2">
        <p className="text-gray-400 text-xs uppercase tracking-wider">Plan Override</p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            const type = fd.get('override_type') as string || null
            const until = fd.get('override_until') as string || null
            act(() => setPlanOverride(userId, type || null, until || null))
          }}
          className="flex flex-wrap gap-2 items-end"
        >
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Type</label>
            <select
              name="override_type"
              defaultValue={currentOverrideType ?? ''}
              className="bg-dark border border-primary/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            >
              <option value="">No override</option>
              <option value="starter">Starter</option>
              <option value="impulse">Impulse</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Until</label>
            <input
              type="date"
              name="override_until"
              defaultValue={currentOverrideUntil ? currentOverrideUntil.split('T')[0] : ''}
              className="bg-dark border border-primary/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Set override
          </button>
          {currentOverrideType && (
            <button
              type="button"
              disabled={pending}
              onClick={() => act(() => setPlanOverride(userId, null, null))}
              className="px-4 py-2 border border-red-800 text-red-400 rounded-lg text-sm hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              Remove override
            </button>
          )}
        </form>
        {currentOverrideType && (
          <p className="text-xs text-yellow-400">
            Active: <strong>{currentOverrideType}</strong>
            {currentOverrideUntil && ` until ${new Date(currentOverrideUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
          </p>
        )}
      </section>

      {/* Credits */}
      <section className="space-y-2">
        <p className="text-gray-400 text-xs uppercase tracking-wider">Credits</p>
        <div className="flex gap-3 flex-wrap">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              const amount = parseInt(fd.get('grant_amount') as string, 10)
              const note = fd.get('grant_note') as string
              act(() => grantCredits(userId, amount, note))
            }}
            className="flex flex-col gap-2 w-full"
          >
            <div className="flex gap-2 items-center">
              <input
                name="grant_amount"
                type="number"
                min="1"
                max="100"
                defaultValue="1"
                className="w-20 bg-dark border border-primary/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={pending}
                className="px-4 py-2 bg-green-900/40 text-green-400 border border-green-800 rounded-lg text-sm font-medium hover:bg-green-900/60 transition-colors disabled:opacity-50"
              >
                + Grant
              </button>
            </div>
            <textarea
              name="grant_note"
              required
              placeholder="Reason for grant (required — logged to admin notes)"
              rows={2}
              className="w-full bg-dark border border-primary/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary resize-none"
            />
          </form>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              const amount = parseInt(fd.get('deduct_amount') as string, 10)
              const note = fd.get('deduct_note') as string
              act(() => deductCredits(userId, amount, note))
            }}
            className="flex flex-col gap-2 w-full"
          >
            <div className="flex gap-2 items-center">
              <input
                name="deduct_amount"
                type="number"
                min="1"
                max="100"
                defaultValue="1"
                className="w-20 bg-dark border border-primary/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={pending}
                className="px-4 py-2 bg-red-900/40 text-red-400 border border-red-800 rounded-lg text-sm font-medium hover:bg-red-900/60 transition-colors disabled:opacity-50"
              >
                − Deduct
              </button>
            </div>
            <textarea
              name="deduct_note"
              required
              placeholder="Reason for deduction (required — logged to admin notes)"
              rows={2}
              className="w-full bg-dark border border-primary/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary resize-none"
            />
          </form>
        </div>
      </section>

      {/* Email / Phone */}
      <section className="space-y-2">
        <p className="text-gray-400 text-xs uppercase tracking-wider">Email / Phone</p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            const email = fd.get('email') as string
            act(() => updateEmail(userId, email), 'Email updated.')
          }}
          className="flex gap-2 items-center"
        >
          <input
            name="email"
            type="email"
            defaultValue={currentEmail}
            className="flex-1 min-w-0 bg-dark border border-primary/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={pending}
            className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            Update email
          </button>
        </form>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            const phone = fd.get('phone') as string
            act(() => updatePhone(userId, phone), 'Phone updated.')
          }}
          className="flex gap-2 items-center"
        >
          <input
            name="phone"
            type="tel"
            defaultValue={currentPhone}
            placeholder="e.g. +1 555 000 0000"
            className="flex-1 min-w-0 bg-dark border border-primary/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary placeholder-gray-600"
          />
          <button
            type="submit"
            disabled={pending}
            className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            Update phone
          </button>
        </form>
      </section>

      {/* Account status */}
      <section className="space-y-2">
        <p className="text-gray-400 text-xs uppercase tracking-wider">Account</p>
        <div className="flex flex-wrap gap-2">
          {isSuspended ? (
            <button
              onClick={() => act(() => unsuspendAccount(userId), 'Account unsuspended.')}
              disabled={pending}
              className="px-4 py-2 bg-green-900/40 text-green-400 border border-green-800 rounded-lg text-sm font-medium hover:bg-green-900/60 transition-colors disabled:opacity-50"
            >
              Unsuspend account
            </button>
          ) : (
            <button
              onClick={() => act(() => suspendAccount(userId), 'Account suspended.')}
              disabled={pending}
              className="px-4 py-2 bg-yellow-900/40 text-yellow-400 border border-yellow-800 rounded-lg text-sm font-medium hover:bg-yellow-900/60 transition-colors disabled:opacity-50"
            >
              Suspend account
            </button>
          )}

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-4 py-2 bg-red-900/40 text-red-400 border border-red-800 rounded-lg text-sm font-medium hover:bg-red-900/60 transition-colors"
            >
              Delete account
            </button>
          ) : (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-red-900/20 border border-red-700/40 text-sm w-full">
              <span className="text-red-300 flex-1">Permanently delete this account?</span>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-3 py-1 bg-red-700 text-white rounded-md text-xs font-medium hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1 border border-gray-600 text-gray-400 rounded-md text-xs hover:text-white"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        {isSuspended && (
          <p className="text-xs text-yellow-400">Account is currently suspended.</p>
        )}
      </section>

      {/* Stripe deep link */}
      {stripeCustomerId && (
        <section className="space-y-2">
          <p className="text-gray-400 text-xs uppercase tracking-wider">Stripe</p>
          <a
            href={`https://dashboard.stripe.com/test/customers/${stripeCustomerId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm text-primary hover:underline"
          >
            View in Stripe dashboard →
          </a>
        </section>
      )}
    </div>
  )
}
