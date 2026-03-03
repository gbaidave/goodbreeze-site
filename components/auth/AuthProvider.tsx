'use client'

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { identifyUser, resetAnalyticsUser } from '@/lib/analytics'

const IDLE_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes
const LAST_ACTIVE_KEY = 'gb_last_active_at'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null

    try {
      const supabase = createClient()

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          // Detect the case where the browser was closed mid-session.
          // The in-page idle timer stops when the browser closes, but
          // localStorage persists — so we can measure the gap on return.
          // If the gap exceeds the idle timeout, treat it as a timed-out session.
          const lastActive = localStorage.getItem(LAST_ACTIVE_KEY)
          if (lastActive) {
            const elapsed = Date.now() - parseInt(lastActive, 10)
            if (elapsed > IDLE_TIMEOUT_MS) {
              localStorage.removeItem(LAST_ACTIVE_KEY)
              supabase.auth.signOut().then(() => {
                window.location.href = '/login?reason=timeout'
              })
              return
            }
          }
          // Session is fresh — stamp it so future page loads can measure inactivity
          localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString())
        }
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }).catch(() => setLoading(false))

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (_event === 'SIGNED_OUT') {
          localStorage.removeItem(LAST_ACTIVE_KEY)
        }
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        if (session?.user) {
          identifyUser(session.user.id, { email: session.user.email })
        } else {
          resetAnalyticsUser()
        }
      })
      subscription = data.subscription
    } catch (err) {
      console.error('[AuthProvider] Supabase init failed:', err)
      setLoading(false)
    }

    return () => subscription?.unsubscribe()
  }, [])

  // Idle session timeout — sign out after 30 minutes of inactivity
  useEffect(() => {
    if (!user) return

    function resetTimer() {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      idleTimerRef.current = setTimeout(async () => {
        localStorage.removeItem(LAST_ACTIVE_KEY)
        const supabase = createClient()
        await supabase.auth.signOut()
        window.location.href = '/login?reason=timeout'
      }, IDLE_TIMEOUT_MS)
      // Throttle localStorage writes — mousemove fires constantly,
      // so only update the timestamp at most once per minute
      const now = Date.now()
      const last = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) || '0', 10)
      if (now - last > 60_000) {
        localStorage.setItem(LAST_ACTIVE_KEY, now.toString())
      }
    }

    const events = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'] as const
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }))
    resetTimer()

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      events.forEach((e) => window.removeEventListener(e, resetTimer))
    }
  }, [user])

  async function signOut() {
    localStorage.removeItem(LAST_ACTIVE_KEY)
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
