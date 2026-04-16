'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface CatalogItem {
  id: string
  sku: string
  name: string
  product_type: string
  price_credits: number | null
  price_usd_cents: number | null
  stripe_price_id: string | null
  active: boolean
  display_order: number | null
  metadata: Record<string, unknown>
}

const TYPE_LABELS: Record<string, string> = {
  report: 'Reports',
  credit_pack: 'Credit Packs',
  subscription_plan: 'Subscription Plans',
}

const TYPE_ORDER = ['report', 'credit_pack', 'subscription_plan']

function formatUsd(cents: number | null): string {
  if (cents == null) return '-'
  return `$${(cents / 100).toFixed(2)}`
}

export default function AdminCatalogPage() {
  const router = useRouter()
  const [items, setItems] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<CatalogItem>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/catalog')
      .then(r => r.json())
      .then(data => {
        if (data.error) { router.replace('/dashboard'); return }
        setItems(data.items ?? [])
        setLoading(false)
      })
  }, [router])

  function startEdit(item: CatalogItem) {
    setEditingId(item.id)
    setEditValues({
      price_credits: item.price_credits,
      price_usd_cents: item.price_usd_cents,
      active: item.active,
    })
  }

  async function handleSave(id: string) {
    setSaving(true)
    const res = await fetch('/api/admin/catalog', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...editValues }),
    })
    if (res.ok) {
      setItems(prev => prev.map(i => i.id === id ? { ...i, ...editValues } as CatalogItem : i))
      setEditingId(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
    setSaving(false)
  }

  function handleCancel() {
    setEditingId(null)
    setEditValues({})
  }

  if (loading) {
    return (
      <div className="text-gray-400 py-12 text-center">Loading catalog...</div>
    )
  }

  const grouped = TYPE_ORDER.map(type => ({
    type,
    label: TYPE_LABELS[type] ?? type,
    items: items.filter(i => i.product_type === type),
  })).filter(g => g.items.length > 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Product Catalog</h1>
        {saved && <span className="text-sm text-green-400">Saved</span>}
      </div>

      {grouped.map(group => (
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
                  <th className="py-2 px-3">Credits</th>
                  <th className="py-2 px-3">USD</th>
                  <th className="py-2 px-3">Active</th>
                  <th className="py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {group.items.map(item => {
                  const isEditing = editingId === item.id
                  return (
                    <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="py-2 px-3 text-gray-400 font-mono text-xs">{item.sku}</td>
                      <td className="py-2 px-3 text-white">{item.name}</td>
                      <td className="py-2 px-3">
                        {isEditing ? (
                          <input
                            type="number"
                            min={0}
                            value={editValues.price_credits ?? ''}
                            onChange={e => setEditValues(v => ({ ...v, price_credits: e.target.value === '' ? null : Number(e.target.value) }))}
                            className="w-16 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-white text-sm"
                          />
                        ) : (
                          <span className={item.price_credits != null ? 'text-white' : 'text-gray-600'}>{item.price_credits ?? '-'}</span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {isEditing ? (
                          <input
                            type="number"
                            min={0}
                            value={editValues.price_usd_cents ?? ''}
                            onChange={e => setEditValues(v => ({ ...v, price_usd_cents: e.target.value === '' ? null : Number(e.target.value) }))}
                            className="w-20 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-white text-sm"
                            placeholder="cents"
                          />
                        ) : (
                          <span className={item.price_usd_cents != null ? 'text-white' : 'text-gray-600'}>{formatUsd(item.price_usd_cents)}</span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {isEditing ? (
                          <button
                            onClick={() => setEditValues(v => ({ ...v, active: !v.active }))}
                            className={`px-2 py-0.5 rounded text-xs font-medium ${editValues.active ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}
                          >
                            {editValues.active ? 'Active' : 'Inactive'}
                          </button>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.active ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                            {item.active ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {isEditing ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleSave(item.id)}
                              disabled={saving}
                              className="px-3 py-1 bg-primary text-white rounded text-xs hover:bg-primary/80 disabled:opacity-50"
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
                          <button
                            onClick={() => startEdit(item)}
                            className="px-3 py-1 bg-zinc-700 text-gray-300 rounded text-xs hover:bg-zinc-600"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
