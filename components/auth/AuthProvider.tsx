'use client'

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { identifyUser, resetAnalyticsUser } from '@/lib/analytics'

const IDLE_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

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
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }).catch(() => setLoading(false))

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
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
        const supabase = createClient()
        await supabase.auth.signOut()
        window.location.href = '/login?reason=timeout'
      }, IDLE_TIMEOUT_MS)
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
