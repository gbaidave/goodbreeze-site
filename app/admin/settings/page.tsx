'use client'

import { useEffect, useState } from 'react'

interface Settings {
  failure_email_enabled: string
  digest_email_enabled: string
  digest_send_hour_pacific: string
}

const DEFAULT_SETTINGS: Settings = {
  failure_email_enabled: 'true',
  digest_email_enabled: 'true',
  digest_send_hour_pacific: '18',
}

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i % 12 || 12
  const ampm = i < 12 ? 'AM' : 'PM'
  return { value: String(i), label: `${h}:00 ${ampm}` }
})

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        if (data.settings) {
          setSettings({ ...DEFAULT_SETTINGS, ...data.settings })
        }
        setLoading(false)
      })
  }, [])

  async function handleSave() {
    setSaving(true)
    await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-400 text-sm">Loading settings…</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Admin notification preferences</p>
      </div>

      {/* Report Failure Notifications */}
      <section className="bg-dark-700 border border-primary/20 rounded-2xl p-6 space-y-6">
        <h2 className="text-base font-semibold text-white">Report Failure Notifications</h2>

        <div className="space-y-4">
          {/* Real-time email toggle */}
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-sm text-white font-medium">Real-time alert email</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Send an email to dave@goodbreeze.ai immediately when any report fails.
                Includes a Claude packet and one-click status update button.
              </p>
            </div>
            <Toggle
              enabled={settings.failure_email_enabled === 'true'}
              onChange={v => setSettings(s => ({ ...s, failure_email_enabled: v ? 'true' : 'false' }))}
            />
          </div>

          <div className="border-t border-primary/10" />

          {/* Daily digest toggle */}
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-sm text-white font-medium">Daily digest email</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Send a daily summary of all report failures in the last 24 hours.
                Only sent if there were failures; skipped on clean days.
              </p>
            </div>
            <Toggle
              enabled={settings.digest_email_enabled === 'true'}
              onChange={v => setSettings(s => ({ ...s, digest_email_enabled: v ? 'true' : 'false' }))}
            />
          </div>

          {/* Digest time picker */}
          {settings.digest_email_enabled === 'true' && (
            <div className="flex items-center justify-between gap-6 pl-0">
              <div>
                <p className="text-sm text-white font-medium">Digest send time</p>
                <p className="text-xs text-gray-400 mt-0.5">Pacific time</p>
              </div>
              <select
                value={settings.digest_send_hour_pacific}
                onChange={e => setSettings(s => ({ ...s, digest_send_hour_pacific: e.target.value }))}
                className="bg-dark border border-primary/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary [color-scheme:dark]"
              >
                {HOURS.map(h => (
                  <option key={h.value} value={h.value}>{h.label} PT</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      {/* Save button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-gradient-to-r from-primary to-accent-blue text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save settings'}
        </button>
        {saved && (
          <span className="text-sm text-green-400">Saved</span>
        )}
      </div>
    </div>
  )
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors ${
        enabled ? 'bg-cyan-500' : 'bg-gray-700'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}
