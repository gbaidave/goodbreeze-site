'use client'

import { useMemo, useState } from 'react'
import { generateBaseSku, validateSkuFormat } from '@/lib/sku-generator'

export interface ModalCatalogItem {
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

interface Props {
  mode: 'create' | 'edit'
  item: ModalCatalogItem | null
  onClose: () => void
  onSaved: () => void
}

const PRODUCT_TYPES: { value: string; label: string; disabled?: boolean }[] = [
  { value: 'subscription_plan', label: 'Subscription plan (monthly)' },
  { value: 'credit_pack', label: 'Credit pack (one-time)' },
  { value: 'report', label: 'Report (sold via credits)' },
  { value: 'bundle', label: 'Bundle / family (coming soon)', disabled: true },
  { value: 'addon', label: 'Add-on (coming soon)', disabled: true },
  { value: 'service', label: 'One-time service (coming soon)', disabled: true },
]

const BADGE_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'best-value', label: 'Best Value' },
  { value: 'most-popular', label: 'Most Popular' },
  { value: 'new', label: 'New' },
  { value: 'limited-time', label: 'Limited Time' },
  { value: 'beta', label: 'Beta' },
]

const TABS = [
  { id: 'basics', label: 'Basics', live: true },
  { id: 'copy', label: 'Copy & Tags', live: false },
  { id: 'badges', label: 'Badges & Display', live: false },
  { id: 'pricing', label: 'Pricing & Promos', live: false },
  { id: 'relationships', label: 'Relationships', live: false },
  { id: 'visibility', label: 'Visibility & Lifecycle', live: false },
  { id: 'seo', label: 'SEO & Media', live: false },
  { id: 'ops', label: 'Ops & Business', live: false },
  { id: 'stripe', label: 'Stripe Sync', live: true },
]

interface FormState {
  product_type: string
  name: string
  tagline: string
  description: string
  price_credits: string
  price_usd_cents: string   // stored as dollars in UI, converted on save
  price_usd_cents_cents: string  // the cents portion
  credits_granted: string
  display_order: string
  active: boolean
  badge: string
  features: string[]
}

function centsToFormParts(cents: number | null): { dollars: string; cents: string } {
  if (cents == null) return { dollars: '', cents: '' }
  return {
    dollars: String(Math.floor(cents / 100)),
    cents: String(cents % 100).padStart(2, '0'),
  }
}

function formPartsToCents(dollars: string, cents: string): number | null {
  const d = parseInt(dollars, 10)
  const c = parseInt(cents || '0', 10)
  if (isNaN(d) || isNaN(c)) return null
  return d * 100 + c
}

export default function CatalogModal({ mode, item, onClose, onSaved }: Props) {
  const [activeTab, setActiveTab] = useState('basics')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  const initialPrice = centsToFormParts(item?.price_usd_cents ?? null)

  const [form, setForm] = useState<FormState>(() => ({
    product_type: item?.product_type ?? 'subscription_plan',
    name: item?.name ?? '',
    tagline: item?.tagline ?? '',
    description: item?.description ?? '',
    price_credits: item?.price_credits?.toString() ?? '',
    price_usd_cents: initialPrice.dollars,
    price_usd_cents_cents: initialPrice.cents,
    credits_granted: item?.credits_granted?.toString() ?? '',
    display_order: item?.display_order?.toString() ?? '',
    active: item?.active ?? true,
    badge: item?.badge ?? '',
    features: Array.isArray(item?.features)
      ? (item!.features as unknown[]).map((f) => String(f))
      : [],
  }))

  // SKU handling: in edit mode, always show the locked legacy SKU.
  // In create mode, SKU auto-derives from product_type + name; admin override wins when set.
  const [skuOverride, setSkuOverride] = useState<string | null>(null)
  const displayedSku = useMemo(() => {
    if (mode === 'edit') return item?.sku ?? ''
    if (skuOverride !== null) return skuOverride
    return generateBaseSku(form.product_type, form.name)
  }, [mode, item, skuOverride, form.product_type, form.name])

  const skuWarnings = useMemo(() => {
    if (!displayedSku) return []
    return validateSkuFormat(displayedSku).warnings
  }, [displayedSku])

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function addFeature() {
    setForm((f) => ({ ...f, features: [...f.features, ''] }))
  }
  function setFeature(i: number, v: string) {
    setForm((f) => ({ ...f, features: f.features.map((x, idx) => (idx === i ? v : x)) }))
  }
  function removeFeature(i: number) {
    setForm((f) => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }))
  }

  const isStripeType = form.product_type === 'subscription_plan' || form.product_type === 'credit_pack'

  async function handleSave() {
    setSaving(true)
    setError(null)

    const priceCentsTotal = isStripeType
      ? formPartsToCents(form.price_usd_cents, form.price_usd_cents_cents)
      : null

    const payload: Record<string, unknown> = {
      name: form.name,
      tagline: form.tagline || null,
      description: form.description || null,
      features: form.features.filter((f) => f.trim() !== ''),
      badge: form.badge || null,
      display_order: form.display_order === '' ? null : Number(form.display_order),
      price_credits: form.price_credits === '' ? null : Number(form.price_credits),
      price_usd_cents: priceCentsTotal,
      credits_granted: form.credits_granted === '' ? null : Number(form.credits_granted),
      active: form.active,
    }

    let res: Response
    if (mode === 'create') {
      payload.product_type = form.product_type
      if (displayedSku) payload.sku = displayedSku
      res = await fetch('/api/admin/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } else {
      payload.id = item!.id
      res = await fetch('/api/admin/catalog', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }

    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setError(data.error ?? 'Save failed')
      return
    }

    if (data.syncResult && data.syncResult.ok === false) {
      setError(`Saved, but Stripe sync failed: ${data.syncResult.error}. You can retry from the Stripe Sync tab.`)
      onSaved()
      return
    }

    onSaved()
    onClose()
  }

  async function handleManualSync() {
    if (!item) return
    setSyncing(true)
    setError(null)
    const res = await fetch('/api/admin/catalog/sync-stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: item.id }),
    })
    const data = await res.json()
    setSyncing(false)
    if (!res.ok) {
      setError(data.error ?? 'Sync failed')
      return
    }
    onSaved()
  }

  async function handleDeactivate() {
    if (!item) return
    if (!confirm(`Deactivate "${item.name}"? Customers can't subscribe to it anymore but existing subs stay active until cancel or failed renewal.`)) {
      return
    }
    setSaving(true)
    const res = await fetch(`/api/admin/catalog?id=${item.id}`, { method: 'DELETE' })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      setError(data.error ?? 'Deactivate failed')
      return
    }
    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-4xl my-8">
        {/* Head */}
        <div className="px-6 py-4 border-b border-zinc-700 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {mode === 'create' ? 'Add new product' : `Edit ${item?.name ?? ''}`}
            </h2>
            {mode === 'edit' && (
              <p className="text-xs text-zinc-500 font-mono mt-1">
                sku: {item?.sku} · {item?.product_type}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-xl">×</button>
        </div>

        {/* Tabbed body */}
        <div className="grid grid-cols-[200px_1fr] min-h-[520px]">
          {/* Left tabs */}
          <div className="bg-zinc-950 border-r border-zinc-800 py-3">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between gap-2 border-l-2 ${
                  activeTab === t.id
                    ? 'text-cyan-400 border-cyan-500 bg-cyan-500/5'
                    : 'text-zinc-400 border-transparent hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{t.label}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                  t.live ? 'bg-green-900/40 text-green-400' : 'bg-purple-900/40 text-purple-400'
                }`}>
                  {t.live ? 'Live' : 'Stub'}
                </span>
              </button>
            ))}
          </div>

          {/* Right panel */}
          <div className="p-6 space-y-4">
            {activeTab === 'basics' && (
              <div className="space-y-4">
                {/* Product type */}
                <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                  <label className="text-sm text-zinc-400 pt-1.5">Product type</label>
                  <div>
                    <select
                      value={form.product_type}
                      onChange={(e) => updateField('product_type', e.target.value)}
                      disabled={mode === 'edit'}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white disabled:opacity-50"
                    >
                      {PRODUCT_TYPES.map((t) => (
                        <option key={t.value} value={t.value} disabled={t.disabled}>{t.label}</option>
                      ))}
                    </select>
                    <p className="text-xs text-zinc-500 mt-1">
                      Subscription plans and credit packs auto-create a Stripe product + price on save. Reports don&apos;t touch Stripe.
                      {mode === 'edit' && ' (Locked after creation.)'}
                    </p>
                  </div>
                </div>

                {/* Display name */}
                <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                  <label className="text-sm text-zinc-400 pt-1.5">Display name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white"
                    placeholder="e.g., Turbo Plan"
                  />
                </div>

                {/* SKU */}
                <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                  <label className="text-sm text-zinc-400 pt-1.5">SKU</label>
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={displayedSku}
                        onChange={(e) => setSkuOverride(e.target.value.toUpperCase())}
                        disabled={mode === 'edit'}
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm font-mono text-white disabled:opacity-50"
                        placeholder="Auto-generated from name"
                      />
                      {mode === 'create' && (
                        <button
                          type="button"
                          onClick={() => setSkuOverride(null)}
                          className="text-zinc-400 hover:text-white px-2 py-1 text-sm"
                          title="Regenerate from name"
                        >
                          ↻
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      Format: <code className="text-cyan-400 font-mono">{'{PREFIX}-{SLUG}'}</code> UPPERCASE + dashes.{' '}
                      <strong>Immutable after save.</strong>
                    </p>
                    {skuWarnings.length > 0 && (
                      <div className="mt-2 text-xs text-amber-400">
                        {skuWarnings.map((w, i) => <div key={i}>⚠ {w}</div>)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tagline */}
                <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                  <label className="text-sm text-zinc-400 pt-1.5">Tagline</label>
                  <input
                    type="text"
                    value={form.tagline}
                    onChange={(e) => updateField('tagline', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white"
                    placeholder="One-line pitch (optional)"
                  />
                </div>

                {/* Description */}
                <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                  <label className="text-sm text-zinc-400 pt-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white min-h-[70px]"
                    placeholder="Short blurb shown on cards (~200 chars)"
                  />
                </div>

                {/* Price USD (only for stripe-tracked) */}
                {isStripeType && (
                  <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                    <label className="text-sm text-zinc-400 pt-1.5">Price (USD)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <input
                          type="number"
                          value={form.price_usd_cents}
                          onChange={(e) => updateField('price_usd_cents', e.target.value)}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white text-right"
                          placeholder="Dollars"
                        />
                        <p className="text-xs text-zinc-500 mt-1">Dollars</p>
                      </div>
                      <div>
                        <input
                          type="number"
                          value={form.price_usd_cents_cents}
                          onChange={(e) => updateField('price_usd_cents_cents', e.target.value)}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white text-right"
                          placeholder="Cents"
                          min="0"
                          max="99"
                        />
                        <p className="text-xs text-zinc-500 mt-1">Cents</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Price credits (only for reports) */}
                {form.product_type === 'report' && (
                  <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                    <label className="text-sm text-zinc-400 pt-1.5">Credits per use</label>
                    <input
                      type="number"
                      value={form.price_credits}
                      onChange={(e) => updateField('price_credits', e.target.value)}
                      className="w-32 bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white"
                    />
                  </div>
                )}

                {/* Credits granted */}
                {isStripeType && (
                  <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                    <label className="text-sm text-zinc-400 pt-1.5">Credits granted</label>
                    <div>
                      <input
                        type="number"
                        value={form.credits_granted}
                        onChange={(e) => updateField('credits_granted', e.target.value)}
                        className="w-32 bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white"
                      />
                      <p className="text-xs text-zinc-500 mt-1">
                        Per billing period (plans) or per purchase (packs).
                      </p>
                    </div>
                  </div>
                )}

                {/* Features */}
                <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                  <label className="text-sm text-zinc-400 pt-1.5">Feature bullets</label>
                  <div>
                    {form.features.map((f, i) => (
                      <div key={i} className="flex gap-2 mb-1.5">
                        <input
                          type="text"
                          value={f}
                          onChange={(e) => setFeature(i, e.target.value)}
                          className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white"
                        />
                        <button
                          type="button"
                          onClick={() => removeFeature(i)}
                          className="px-3 py-1 bg-zinc-800 border border-zinc-700 text-zinc-400 rounded hover:bg-zinc-700"
                        >×</button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-3 py-1.5 border border-dashed border-cyan-400/40 text-cyan-400 text-xs rounded hover:bg-cyan-500/5"
                    >+ Add feature</button>
                  </div>
                </div>

                {/* Badge */}
                <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                  <label className="text-sm text-zinc-400 pt-1.5">Badge</label>
                  <div>
                    <select
                      value={form.badge}
                      onChange={(e) => updateField('badge', e.target.value)}
                      className="w-64 bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white"
                    >
                      {BADGE_OPTIONS.map((b) => (
                        <option key={b.value} value={b.value}>{b.label}</option>
                      ))}
                    </select>
                    <p className="text-xs text-zinc-500 mt-1">Only one badge per product. Multi-badge coming later.</p>
                  </div>
                </div>

                {/* Display order */}
                <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                  <label className="text-sm text-zinc-400 pt-1.5">Display order</label>
                  <div>
                    <input
                      type="number"
                      value={form.display_order}
                      onChange={(e) => updateField('display_order', e.target.value)}
                      className="w-32 bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white"
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      Lower shows first. Plans 100–199, Packs 200–299, Reports 300–399. Use gaps of 10.
                    </p>
                  </div>
                </div>

                {/* Active toggle */}
                <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                  <label className="text-sm text-zinc-400 pt-1.5">Status</label>
                  <button
                    type="button"
                    onClick={() => updateField('active', !form.active)}
                    className={`px-3 py-1.5 rounded text-sm font-medium ${
                      form.active ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'
                    }`}
                  >
                    {form.active ? 'Active — selling' : 'Inactive — hidden'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'stripe' && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-white">Current Stripe mapping</h3>
                {mode === 'create' ? (
                  <p className="text-sm text-zinc-400">
                    Stripe product + price will be auto-created on save. Come back here after creation to manage the sync.
                  </p>
                ) : !isStripeType ? (
                  <p className="text-sm text-zinc-400">This product type is not sold through Stripe.</p>
                ) : (
                  <>
                    <div className="bg-zinc-950 border border-zinc-800 rounded p-4 space-y-1 text-sm text-zinc-300">
                      <div><strong className="text-white">Stripe Price ID:</strong> <span className="font-mono text-xs">{item?.stripe_price_id ?? '— not yet synced —'}</span></div>
                      <div><strong className="text-white">Last attempt:</strong> {item?.last_sync_attempt_at ? new Date(item.last_sync_attempt_at).toLocaleString() : 'never'}</div>
                      <div><strong className="text-white">Last success:</strong> {item?.last_sync_success_at ? new Date(item.last_sync_success_at).toLocaleString() : 'never'}</div>
                    </div>

                    {item?.sync_error_detail ? (
                      <div className="bg-red-900/30 border border-red-800 text-red-300 rounded p-3 text-sm">
                        <strong>Sync error:</strong> {item.sync_error_detail}
                      </div>
                    ) : item?.stripe_price_id ? (
                      <div className="bg-green-900/30 border border-green-800 text-green-300 rounded p-3 text-sm">
                        In sync with Stripe.
                      </div>
                    ) : null}

                    <p className="text-xs text-zinc-500">
                      When you change the USD price on the Basics tab and save, a new Stripe Price is created
                      automatically and the old one is deactivated. Existing subscribers stay on the old price
                      until their next renewal.
                    </p>

                    <button
                      type="button"
                      onClick={handleManualSync}
                      disabled={syncing}
                      className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded text-sm hover:bg-zinc-700 disabled:opacity-50"
                    >
                      {syncing ? 'Syncing…' : '↻ Re-sync now'}
                    </button>
                  </>
                )}
              </div>
            )}

            {TABS.find((t) => t.id === activeTab)?.live === false && (
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-900/30 text-purple-300 rounded text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Coming soon — not yet functional
                </div>
                <p className="text-sm text-zinc-400">
                  This tab is reserved for future features. Schema columns are already in place from migration 068,
                  so the feature can be turned on without data migration. See{' '}
                  <code className="text-cyan-400 text-xs">PLAN-sprint4-catalog-design.md</code> for the design.
                </p>
                <div className="bg-zinc-950 border border-dashed border-zinc-700 rounded p-8 text-center text-sm text-zinc-500">
                  {TABS.find((t) => t.id === activeTab)?.label} — placeholder
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Foot */}
        <div className="px-6 py-3 border-t border-zinc-700 bg-black/20 flex justify-between items-center">
          <div>
            {mode === 'edit' && item?.active && (
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={saving}
                className="px-3 py-1.5 bg-red-900/30 border border-red-800 text-red-300 rounded text-sm hover:bg-red-900/50 disabled:opacity-50"
              >
                Deactivate
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {error && <span className="text-red-400 text-sm">{error}</span>}
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded text-sm hover:bg-zinc-700 disabled:opacity-50"
            >Cancel</button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 bg-cyan-500 text-black font-medium rounded text-sm hover:bg-cyan-400 disabled:opacity-50"
            >
              {saving ? 'Saving…' : mode === 'create' ? 'Create + Sync Stripe' : 'Save + Sync Stripe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
