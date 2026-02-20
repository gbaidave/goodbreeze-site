'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  type: string
  message: string
  read: boolean
  created_at: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const TYPE_LABELS: Record<string, string> = {
  email_failed:        'Email Failed',
  report_failed:       'Report Failed',
  report_ready:        'Report Ready',
  referral_credit:     'Referral Credit',
  testimonial_credit:  'Testimonial Credit',
  plan_changed:        'Plan Changed',
  admin_message:       'Message',
}

const TYPE_COLORS: Record<string, string> = {
  email_failed:        'text-red-400 bg-red-500/10 border-red-500/20',
  report_failed:       'text-red-400 bg-red-500/10 border-red-500/20',
  report_ready:        'text-green-400 bg-green-500/10 border-green-500/20',
  referral_credit:     'text-primary bg-primary/10 border-primary/20',
  testimonial_credit:  'text-primary bg-primary/10 border-primary/20',
  plan_changed:        'text-accent-blue bg-accent-blue/10 border-accent-blue/20',
  admin_message:       'text-accent-blue bg-accent-blue/10 border-accent-blue/20',
}

function TypeBadge({ type }: { type: string }) {
  const cls = TYPE_COLORS[type] ?? 'text-gray-400 bg-gray-800 border-gray-700'
  return (
    <span className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
      {TYPE_LABELS[type] ?? type}
    </span>
  )
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }

    async function load() {
      try {
        const res = await fetch('/api/notifications')
        if (res.ok) {
          const data = await res.json()
          setNotifications(data.notifications ?? [])
          // Mark all as read
          if ((data.unreadCount ?? 0) > 0) {
            fetch('/api/notifications', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({}),
            })
          }
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark py-24 px-6">
      <div className="max-w-2xl mx-auto">

        <div className="mb-8">
          <Link href="/dashboard" className="text-gray-500 hover:text-primary text-sm transition-colors">
            ← Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white mt-4">Notifications</h1>
          <p className="text-gray-400 mt-1 text-sm">
            {notifications.length === 0
              ? 'Nothing here yet.'
              : `${notifications.length} notification${notifications.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <svg className="w-14 h-14 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-base">No notifications yet.</p>
            <p className="text-sm mt-1 text-gray-600">We&apos;ll let you know when something important happens.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`bg-dark-700 border rounded-xl p-4 transition-colors ${
                  !n.read ? 'border-primary/30' : 'border-gray-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <TypeBadge type={n.type} />
                      <span className="text-xs text-gray-500">{timeAgo(n.created_at)}</span>
                      {!n.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-200 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
