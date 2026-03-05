'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { LoginGatePrompt } from './LoginGatePrompt'

/**
 * Wraps report pages. Shows the page content underneath a modal overlay
 * when the user is not signed in, prompting them to log in or sign up.
 * Uses the current pathname as the returnUrl so after login they come back here.
 */
export function LoginGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  // While auth is loading, show the page (avoids flash of gate on page load)
  if (loading) return <>{children}</>

  // Authenticated — show the page normally
  if (user) return <>{children}</>

  // Not authenticated — show blurred page with login gate overlay
  return (
    <>
      <div className="pointer-events-none select-none blur-sm" aria-hidden="true">
        {children}
      </div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
        <div className="w-full max-w-sm">
          <LoginGatePrompt returnUrl={pathname} />
        </div>
      </div>
    </>
  )
}
