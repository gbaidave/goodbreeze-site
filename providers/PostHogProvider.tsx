'use client'

import posthog from 'posthog-js'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname) return
    const url = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname
    posthog.capture('$pageview', { $current_url: url })
  }, [pathname, searchParams])

  return null
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'
    if (!key) return

    posthog.init(key, {
      api_host: host,
      person_profiles: 'identified_only',
      capture_pageview: false, // manual via PostHogPageView
      capture_pageleave: true,
    })
  }, [])

  return (
    <>
      <Suspense>
        <PostHogPageView />
      </Suspense>
      {children}
    </>
  )
}
