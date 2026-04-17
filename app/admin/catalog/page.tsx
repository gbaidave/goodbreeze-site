'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CatalogModal, { ModalCatalogItem } from './CatalogModal'

interface CatalogItem {
  id: string
  sku: string
  name: string
  product_type: string
  price_credits: number | null
  price_usd_cents: number | null
  credits_granted: number | null
  stripe_price_id: string | null
  active: boolean
  display_order: number | null
  metadata: Record<string, unknown>
  description: string | null
  tagline: string | null
  features: unknown[]
  lifecycle_status: string | null
  badge: string | null
  sync_error_detail: string | null
  last_sync_attempt_at: string | null
  last_sync_success_at: string | null
}

const TYPE_LABELS: Record<string, string> = {
  report: 'Reports (cost per use)',
  credit_pack: 'Credit Packs (one-time purchase)',
  subscription_plan: 'Subscription Plans (monthly)',
}

const TYPE_ORDER = ['subscription_plan', 'credit_pack', 'report']

const BADGE_LABELS: Record<string, { label: string; cls: string }> = {
  'best-value':    { label: 'Best Value',   cls: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black' },
  'most-popular':  { label: 'Most Popular', cls: 'bg-blue-600 text-white' },
  'new':           { label: 'New',          cls: 'bg-green-500 text-black' },
  'limited-time':  { label: 'Limited Time', cls: 'bg-amber-500 text-black' },
  'sale':          { label: 'Sale',         cls: 'bg-red-600 text-white' },
  'beta':          { label: 'Beta',         cls: 'bg-purple-600 text-white' },
  'free':          { label: 'Free',         cls: 'bg-green-900/40 text-green-300 border border-green-500/60' },
}

function formatUsd(cents: number | null): string {
  if (cents == null) return '—'
  return `$${(cents / 100).toFixed(2)}`
}

function productTypeFieldConfig(type: string) {
  switch (type) {
    case 'report':
      return { showPriceCredits: true, showCreditsGranted: false, showPriceUsd: false }
    case 'credit_pack':
    case 'subscription_plan':
      return { showPriceCredits: false, showCreditsGranted: true, showPriceUsd: true }
    default:
      return { showPriceCredits: true, showCreditsGranted: true, showPriceUsd: true }
  }
}

function BadgePill({ badge }: { badge: string | null }) {
  if (!badge) return null
  const cfg = BADGE_LABELS[badge] ?? { label: badge, cls: 'bg-zinc-700 text-zinc-200' }
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

function LifecyclePill({ status, active }: { status: string | null; active: boolean }) {
  const effective = status ?? (active ? 'active' : 'retired')
  const styles: Record<string, string> = {
    active:    'bg-green-900/30 text-green-400',
    draft:     'bg-zinc-700/40 text-zinc-300',
    scheduled: 'bg-blue-900/30 text-blue-400',
    sunset:    'bg-amber-900/30 text-amber-400',
    retired:   'bg-red-900/30 text-red-400',
    archived:  'bg-zinc-800 text-zinc-500',
  }
  const cls = styles[effective] ?? styles.active
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {effective.charAt(0).toUpperCase() + effective.slice(1)}
    </span>
  )
}

function SyncCell({ item }: { item: CatalogItem }) {
  const isStripeType = item.product_type === 'subscription_plan' || item.product_type === 'credit_pack'
  if (!isStripeType) {
    return <span className="text-xs text-zinc-600">N/A</span>
  }
  if (item.sync_error_detail) {
    return (
      <span className="text-xs text-red-400" title={item.sync_error_detail}>
        ● Error
      </span>
    )
  }
  if (!item.stripe_price_id) {
    return <span className="text-xs text-amber-400">● Not synced</span>
  }
  return (
    <span className="text-xs text-green-400" title={item.stripe_price_id}>
      ● In sync
    </span>
  )
}

export default function AdminCatalogPage() {
  const router = useRouter()
  const [items, setItems] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<CatalogItem>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null)
  const [modalItem, setModalItem] = useState<ModalCatalogItem | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [validatorStatus, setValidatorStatus] = useState<{ running: boolean; result: string | null }>({ running: false, result: null })

  function loadItems() {
    setLoading(true)
    fetch('/api/admin/catalog')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.replace('/dashboard')
          return
        }
        setItems(data.items ?? [])
        setLoading(false)
      })
  }

  useEffect(() => {
    loadItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function startEdit(item: CatalogItem) {
    setEditingId(item.id)
    setEditValues({
      price_credits: item.price_credits,
      price_usd_cents: item.price_usd_cents,
      credits_granted: item.credits_granted,
      active: item.active,
    })
    setError(null)
  }

  async function handleSave(id: string) {
    setSaving(true)
    setError(null)
    const res = await fetch('/api/admin/catalog', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...editValues }),
    })
    const data = await res.json()
    if (res.ok) {
      if (data.syncResult && data.syncResult.ok === false) {
        setError(`Saved, but Stripe sync failed: ${data.syncResult.error}`)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      }
      loadItems()
      setEditingId(null)
    } else {
      setError(data.error ?? 'Save failed')
    }
    setSaving(false)
  }

  function handleCancel() {
    setEditingId(null)
    setEditValues({})
    setError(null)
  }

  function openCreate() {
    setModalItem(null)
    setModalMode('create')
  }

  function openEditDetails(item: CatalogItem) {
    setModalItem(item as ModalCatalogItem)
    setModalMode('edit')
  }

  function closeModal() {
    setModalMode(null)
    setModalItem(null)
  }

  async function runValidator() {
    setValidatorStatus({ running: true, result: null })
    try {
      const res = await fetch('/api/admin/catalog/validate', { method: 'POST' })
      const data = await res.json()
      setValidatorStatus({
        running: false,
        result: res.ok ? data.summary ?? 'OK' : data.error ?? 'Validation failed',
      })
    } catch {
      setValidatorStatus({ running: false, result: 'Validator endpoint unreachable' })
    }
  }

  if (loading) {
    return <div className="text-gray-400 py-12 text-center">Loading catalog...</div>
  }

  const visibleItems = showArchived
    ? items
    : items.filter((i) => i.lifecycle_status !== 'retired' && i.lifecycle_status !== 'archived')

  const grouped = TYPE_ORDER.map((type) => ({
    type,
    label: TYPE_LABELS[type] ?? type,
    items: visibleItems.filter((i) => i.product_type === type),
  })).filter((g) => g.items.length > 0)

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Product Catalog</h1>
          <p className="text-gray-500 text-sm mt-1 max-w-2xl">
            Source of truth for pricing, credits, plan caps, and Stripe Price IDs. Changes sync to Stripe automatically and apply site-wide within 5 seconds.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {saved && <span className="text-sm text-green-400">Saved</span>}
          {error && <span className="text-sm text-red-400">{error}</span>}
          <button
            type="button"
            onClick={runValidator}
            disabled={validatorStatus.running}
            className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded text-sm hover:bg-zinc-700 disabled:opacity-50"
          >
            {validatorStatus.running ? 'Running…' : '↻ Run validator'}
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="px-3 py-1.5 bg-primary text-black font-medium rounded text-sm hover:bg-cyan-600"
          >
            + Add product
          </button>
        </div>
      </div>

      {validatorStatus.result && (
        <div className={`mb-4 px-4 py-2 rounded text-sm ${
          validatorStatus.result === 'OK' || validatorStatus.result.startsWith('All')
            ? 'bg-green-900/20 border border-green-800/40 text-green-300'
            : 'bg-amber-900/20 border border-amber-800/40 text-amber-300'
        }`}>
          {validatorStatus.result}
        </div>
      )}

      <div className="flex items-center gap-4 mb-4 text-sm">
        <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="accent-primary"
          />
          Show archived / retired
        </label>
      </div>

      {grouped.map((group) => {
        const cfg = productTypeFieldConfig(group.type)
        return (
          <div key={group.type} className="mb-8">
            <h2 className="text-lg font-semibold text-gray-300 mb-3 border-b border-zinc-700 pb-2">
              {group.label}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-gray-500 border-b border-zinc-800">
                    <th className="py-2 px-3">SKU</th>
                    <th className="py-2 px-3">Name</th>
                    {cfg.showPriceCredits && <th className="py-2 px-3">Credits / Use</th>}
                    {cfg.showCreditsGranted && <th className="py-2 px-3">Credits Granted</th>}
                    {cfg.showPriceUsd && <th className="py-2 px-3">Price (USD)</th>}
                    <th className="py-2 px-3">Badge</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Stripe</th>
                    <th className="py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {group.items.map((item) => {
                    const isEditing = editingId === item.id
                    const rowDim = item.lifecycle_status === 'retired' || item.lifecycle_status === 'archived'
                    return (
                      <tr key={item.id} className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 ${rowDim ? 'opacity-50' : ''}`}>
                        <td className="py-2 px-3 text-gray-400 font-mono text-xs">{item.sku}</td>
                        <td className="py-2 px-3 text-white">{item.name}</td>

                        {cfg.showPriceCredits && (
                          <td className="py-2 px-3">
                            {isEditing ? (
                              <input
                                type="number"
                                min={0}
                                value={editValues.price_credits ?? ''}
                                onChange={(e) => setEditValues((v) => ({ ...v, price_credits: e.target.value === '' ? null : Number(e.target.value) }))}
                                className="w-16 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-white text-sm"
                              />
                            ) : (
                              <span className={item.price_credits != null ? 'text-white' : 'text-gray-600'}>{item.price_credits ?? '—'}</span>
                            )}
                          </td>
                        )}

                        {cfg.showCreditsGranted && (
                          <td className="py-2 px-3">
                            {isEditing ? (
                              <input
                                type="number"
                                min={0}
                                value={editValues.credits_granted ?? ''}
                                onChange={(e) => setEditValues((v) => ({ ...v, credits_granted: e.target.value === '' ? null : Number(e.target.value) }))}
                                className="w-16 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-white text-sm"
                              />
                            ) : (
                              <span className={item.credits_granted != null ? 'text-white' : 'text-gray-600'}>{item.credits_granted ?? '—'}</span>
                            )}
                          </td>
                        )}

                        {cfg.showPriceUsd && (
                          <td className="py-2 px-3">
                            {isEditing ? (
                              <input
                                type="number"
                                min={0}
                                value={editValues.price_usd_cents ?? ''}
                                onChange={(e) => setEditValues((v) => ({ ...v, price_usd_cents: e.target.value === '' ? null : Number(e.target.value) }))}
                                className="w-20 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-white text-sm"
                                placeholder="cents"
                              />
                            ) : (
                              <span className={item.price_usd_cents != null ? 'text-white' : 'text-gray-600'}>{formatUsd(item.price_usd_cents)}</span>
                            )}
                          </td>
                        )}

                        <td className="py-2 px-3"><BadgePill badge={item.badge} /></td>

                        <td className="py-2 px-3">
                          {isEditing ? (
                            <button
                              onClick={() => setEditValues((v) => ({ ...v, active: !v.active }))}
                              className={`px-2 py-0.5 rounded text-xs font-medium ${editValues.active ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}
                            >
                              {editValues.active ? 'Active' : 'Inactive'}
                            </button>
                          ) : (
                            <LifecyclePill status={item.lifecycle_status} active={item.active} />
                          )}
                        </td>

                        <td className="py-2 px-3">
                          <SyncCell item={item} />
                        </td>

                        <td className="py-2 px-3 text-right">
                          {isEditing ? (
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleSave(item.id)}
                                disabled={saving}
                                className="px-3 py-1 bg-primary text-black rounded text-xs hover:bg-cyan-600 disabled:opacity-50"
                              >
                                {saving ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                onClick={handleCancel}
                                className="px-3 py-1 bg-zinc-700 text-gray-300 rounded text-xs hover:bg-zinc-600"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => startEdit(item)}
                                className="px-3 py-1 bg-zinc-700 text-gray-300 rounded text-xs hover:bg-zinc-600"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => openEditDetails(item)}
                                className="px-3 py-1 bg-zinc-800 border border-zinc-700 text-gray-300 rounded text-xs hover:bg-zinc-700"
                                title="Open tabbed editor for all fields"
                              >
                                Details
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      {modalMode && (
        <CatalogModal
          mode={modalMode}
          item={modalItem}
          onClose={closeModal}
          onSaved={() => { loadItems(); setSaved(true); setTimeout(() => setSaved(false), 2500) }}
        />
      )}

      <div className="mt-8 text-xs text-gray-500 border-t border-zinc-800 pt-4 max-w-3xl">
        <p>
          <strong>Sprint 4 scope:</strong> Basics + Stripe Sync tabs are live. Other tabs (Copy &amp; Tags,
          Badges &amp; Display, Pricing &amp; Promos, Relationships, Visibility &amp; Lifecycle, SEO &amp; Media,
          Ops &amp; Business) show placeholder UI — schema is ready from migration 068, features light up in later sprints.
          See <code>.workspace/PLAN-sprint4-catalog-design.md</code>.
        </p>
      </div>
    </div>
  )
}
