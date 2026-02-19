'use client'

import { useState, useTransition } from 'react'
import { setUserRole, setPlanOverride, grantCredits, deductCredits } from './actions'

interface Props {
  userId: string
  currentRole: string
  currentOverrideType: string | null
  currentOverrideUntil: string | null
  stripeCustomerId: string | null
}

export function UserActionsPanel({
  userId,
  currentRole,
  currentOverrideType,
  currentOverrideUntil,
  stripeCustomerId,
}: Props) {
  const [pending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  function act(fn: () => Promise<void>) {
    startTransition(async () => {
      try {
        await fn()
        setFeedback({ type: 'ok', msg: 'Saved.' })
      } catch (e: any) {
        setFeedback({ type: 'err', msg: e.message ?? 'Something went wrong.' })
      }
    })
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
              onClick={() => act(() => setUserRole(userId, role))}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors border
                ${currentRole === role
                  ? 'bg-primary/20 border-primary text-primary cursor-default'
                  : 'border-primary/20 text-gray-400 hover:text-white hover:border-primary/50'}`}
            >
              {role}
            </button>
          ))}
        </div>
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
              act(() => grantCredits(userId, amount))
            }}
            className="flex gap-2 items-center"
          >
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
          </form>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              const amount = parseInt(fd.get('deduct_amount') as string, 10)
              act(() => deductCredits(userId, amount))
            }}
            className="flex gap-2 items-center"
          >
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
          </form>
        </div>
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
