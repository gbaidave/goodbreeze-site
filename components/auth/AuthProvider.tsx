'use client'

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { identifyUser, resetAnalyticsUser } from '@/lib/analytics'

const IDLE_TIMEOUT_MS = 30 * 60 * 1000  // 30 minutes — sign out
const WARN_TIMEOUT_MS  = 25 * 60 * 1000  // 25 minutes — show warning
const LAST_ACTIVE_KEY  = 'gb_last_active_at'

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
  const [showIdleWarning, setShowIdleWarning] = useState(false)
  const [idleCountdown, setIdleCountdown] = useState(300) // seconds remaining in warning window
  const idleTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warnTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef  = useRef<ReturnType<typeof setInterval> | null>(null)

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

  // Idle session timeout — warn at 25 min, sign out at 30 min
  useEffect(() => {
    if (!user) return

    function clearAllTimers() {
      if (idleTimerRef.current)  clearTimeout(idleTimerRef.current)
      if (warnTimerRef.current)  clearTimeout(warnTimerRef.current)
      if (countdownRef.current)  clearInterval(countdownRef.current)
    }

    function doSignOut() {
      clearAllTimers()
      localStorage.removeItem(LAST_ACTIVE_KEY)
      createClient().auth.signOut().then(() => {
        window.location.href = '/login?reason=timeout'
      })
    }

    function startCountdown() {
      setIdleCountdown(300)
      if (countdownRef.current) clearInterval(countdownRef.current)
      countdownRef.current = setInterval(() => {
        setIdleCountdown(c => {
          if (c <= 1) {
            clearInterval(countdownRef.current!)
            return 0
          }
          return c - 1
        })
      }, 1000)
    }

    function resetTimer() {
      clearAllTimers()
      setShowIdleWarning(false)

      // Warn at 25 minutes
      warnTimerRef.current = setTimeout(() => {
        setShowIdleWarning(true)
        startCountdown()
        // Sign out 5 minutes after the warning appears
        idleTimerRef.current = setTimeout(doSignOut, 5 * 60 * 1000)
      }, WARN_TIMEOUT_MS)

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
      clearAllTimers()
      events.forEach((e) => window.removeEventListener(e, resetTimer))
    }
  }, [user])

  async function signOut() {
    localStorage.removeItem(LAST_ACTIVE_KEY)
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  function stayLoggedIn() {
    setShowIdleWarning(false)
    if (idleTimerRef.current)  clearTimeout(idleTimerRef.current)
    if (warnTimerRef.current)  clearTimeout(warnTimerRef.current)
    if (countdownRef.current)  clearInterval(countdownRef.current)
    localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString())
    // Dispatch a click to re-arm the resetTimer listener
    window.dispatchEvent(new MouseEvent('click'))
  }

  const mins = Math.ceil(idleCountdown / 60)
  const secs = idleCountdown % 60

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}

      {/* Idle timeout warning modal — appears 5 minutes before auto sign-out */}
      {showIdleWarning && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-sm bg-zinc-900 border border-amber-500/40 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div>
              <p className="text-amber-400 font-semibold text-sm">Still there?</p>
              <p className="text-white font-bold text-lg mt-1">You&apos;re about to be signed out</p>
              <p className="text-zinc-400 text-sm mt-1">
                You&apos;ll be signed out in{' '}
                <span className="text-amber-300 font-semibold tabular-nums">
                  {mins > 0 ? `${mins}m ` : ''}{String(secs).padStart(2, '0')}s
                </span>{' '}
                due to inactivity.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={stayLoggedIn}
                className="flex-1 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-sm rounded-xl transition-colors"
              >
                Stay signed in
              </button>
              <button
                onClick={signOut}
                className="flex-1 px-4 py-2.5 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-300 text-sm rounded-xl transition-colors"
              >
                Sign out now
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
