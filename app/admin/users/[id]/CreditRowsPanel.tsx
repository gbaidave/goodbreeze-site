'use client'
import { useState, useMemo } from 'react'

type CreditRow = {
  balance: number
  expires_at: string | null
  purchased_at: string
  product: string | null
}

const CREDIT_PRODUCT_LABELS: Record<string, string> = {
  spark_pack: 'Spark Pack',
  boost_pack: 'Boost Pack',
  impulse: 'Impulse Pack',
  signup_credit: 'Signup bonus',
  testimonial_reward: 'Testimonial reward',
  referral_credit: 'Referral credit',
}

export function CreditRowsPanel({ credits }: { credits: CreditRow[] }) {
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')

  const now = new Date()

  const filtered = useMemo(() => {
    return credits.filter(c => {
      if (typeFilter !== 'all' && c.product !== typeFilter) return false
      if (fromDate && new Date(c.purchased_at) < new Date(fromDate)) return false
      if (toDate) {
        const to = new Date(toDate)
        to.setHours(23, 59, 59, 999)
        if (new Date(c.purchased_at) > to) return false
      }
      return true
    })
  }, [credits, typeFilter, fromDate, toDate])

  const isExpired = (c: CreditRow) =>
    !!c.expires_at && new Date(c.expires_at) < now

  const hasFilters = typeFilter !== 'all' || !!fromDate || !!toDate

  return (
    <div className="bg-dark-700 border border-primary/20 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-primary/10 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Credit Rows ({credits.length})</h2>
        {filtered.length !== credits.length && (
          <span className="text-xs text-gray-500">Showing {filtered.length}</span>
        )}
      </div>

      {/* Filters */}
      <div className="px-4 py-2 border-b border-primary/10 flex flex-wrap gap-2 items-center">
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="text-xs bg-dark border border-primary/20 text-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:border-primary/60"
        >
          <option value="all">All types</option>
          {Object.entries(CREDIT_PRODUCT_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
          <option value="">Other</option>
        </select>

        <input
          type="date"
          value={fromDate}
          onChange={e => setFromDate(e.target.value)}
          className="text-xs bg-dark border border-primary/20 text-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:border-primary/60"
        />
        <span className="text-gray-600 text-xs">to</span>
        <input
          type="date"
          value={toDate}
          onChange={e => setToDate(e.target.value)}
          className="text-xs bg-dark border border-primary/20 text-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:border-primary/60"
        />

        {hasFilters && (
          <button
            onClick={() => { setTypeFilter('all'); setFromDate(''); setToDate('') }}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-xs px-4 py-3">No credit rows match filters.</p>
      ) : (
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-primary/10">
              <th className="text-left px-4 py-2 text-gray-400 font-medium">Source</th>
              <th className="text-left px-4 py-2 text-gray-400 font-medium">Bal</th>
              <th className="text-left px-4 py-2 text-gray-400 font-medium">Purchased</th>
              <th className="text-left px-4 py-2 text-gray-400 font-medium">Expires</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => {
              const expired = isExpired(c)
              return (
                <tr key={i} className={`border-b border-primary/10 last:border-0 ${expired ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-2 text-gray-300">
                    {CREDIT_PRODUCT_LABELS[c.product ?? ''] ?? 'Credit grant'}
                  </td>
                  <td className={`px-4 py-2 font-medium ${c.balance > 0 && !expired ? 'text-white' : 'text-gray-600'}`}>
                    {c.balance}
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    {new Date(c.purchased_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                  </td>
                  <td className="px-4 py-2">
                    {c.expires_at ? (
                      expired ? (
                        <span className="text-red-500/70">
                          Exp {new Date(c.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          {new Date(c.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                        </span>
                      )
                    ) : (
                      <span className="text-gray-700">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
