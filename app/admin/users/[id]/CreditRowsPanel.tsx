'use client'
import { useState, useMemo, useRef, useEffect } from 'react'

type CreditRow = {
  balance: number
  expires_at: string | null
  purchased_at: string
  product: string | null
  source: string | null
}

const CREDIT_PRODUCT_LABELS: Record<string, string> = {
  spark_pack:           'Spark Pack',
  spark_pack_credits:   'Spark Pack',
  boost_pack:           'Boost Pack',
  boost_pack_credits:   'Boost Pack',
  impulse:              'Impulse Pack',
  impulse_pack:         'Impulse Pack',
  impulse_pack_credits: 'Impulse Pack',
  free_credit:          'Free credit',
  signup_credit:        'Signup bonus',
  signup_bonus:         'Signup bonus',
  testimonial_reward:   'Testimonial reward',
  referral_credit:      'Referral credit',
  admin_grant:          'Granted by admin',
  credit_grant:         'Granted by admin',
}

const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  ...Object.entries(CREDIT_PRODUCT_LABELS)
    // Deduplicate by label
    .filter((entry, idx, arr) => arr.findIndex(([, v]) => v === entry[1]) === idx)
    .map(([k, v]) => ({ value: k, label: v })),
  { value: '', label: 'Other' },
]

export function CreditRowsPanel({ credits }: { credits: CreditRow[] }) {
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const now = new Date()

  const filtered = useMemo(() => {
    return credits.filter(c => {
      if (typeFilter === 'all') return true
      if (typeFilter === '') return !c.product || !CREDIT_PRODUCT_LABELS[c.product]
      // Match on product OR any alias that maps to the same label
      const targetLabel = CREDIT_PRODUCT_LABELS[typeFilter]
      if (!targetLabel) return c.product === typeFilter
      return c.product ? (CREDIT_PRODUCT_LABELS[c.product] === targetLabel) : false
    }).filter(c => {
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
  const selectedLabel = TYPE_OPTIONS.find(o => o.value === typeFilter)?.label ?? 'All types'

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
        {/* Custom type dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(v => !v)}
            className="flex items-center gap-1.5 text-xs bg-dark border border-primary/20 text-gray-300 rounded-lg px-2.5 py-1.5 hover:border-primary/50 transition-colors"
          >
            <span>{selectedLabel}</span>
            <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-44 bg-[#2a2a2a] border border-primary/40 rounded-lg shadow-xl z-50 overflow-hidden">
              {TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setTypeFilter(opt.value); setDropdownOpen(false) }}
                  className={`block w-full text-left px-3 py-2 text-xs hover:bg-primary/20 transition-colors ${
                    typeFilter === opt.value ? 'text-primary' : 'text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="date"
          value={fromDate}
          onChange={e => setFromDate(e.target.value)}
          className="text-xs bg-dark border border-primary/20 text-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary/60"
        />
        <span className="text-gray-600 text-xs">to</span>
        <input
          type="date"
          value={toDate}
          onChange={e => setToDate(e.target.value)}
          className="text-xs bg-dark border border-primary/20 text-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary/60"
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
        <div className="overflow-x-auto" style={filtered.length > 6 ? { maxHeight: '18rem', overflowY: 'auto' } : {}}>
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
              // product is source of truth; fall back to source for old pack rows where product wasn't stored
              const label = c.product
                ? (CREDIT_PRODUCT_LABELS[c.product] ?? c.product.replace(/_/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase()))
                : c.source === 'pack' ? 'Credit Pack'
                : c.source === 'subscription' ? 'Subscription credit'
                : c.source === 'refund' ? `Refunded (${Math.abs(c.balance)} credit${Math.abs(c.balance) !== 1 ? 's' : ''})`
                : 'Credit added'
              return (
                <tr key={i} className={`border-b border-primary/10 last:border-0 ${expired ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-2 text-gray-300">{label}</td>
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
        </div>
      )}
    </div>
  )
}
