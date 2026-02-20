/**
 * PostHog analytics helpers — client-side only.
 * Import only from 'use client' components or client-side modules.
 */

import posthog from 'posthog-js'

export function captureEvent(event: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  posthog.capture(event, properties)
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  posthog.identify(userId, traits)
}

export function resetAnalyticsUser() {
  if (typeof window === 'undefined') return
  posthog.reset()
}
