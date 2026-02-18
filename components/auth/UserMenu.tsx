'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from './AuthProvider'

export function UserMenu() {
  const { user, loading, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (loading) return <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <a href="/login" className="text-zinc-300 hover:text-white text-sm font-medium transition-colors">Sign in</a>
        <a href="/signup" className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-sm font-semibold px-4 py-2 rounded-lg transition-colors">Start free</a>
      </div>
    )
  }

  const initials = (user.user_metadata?.name || user.email || 'U')
    .split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 rounded-full px-3 py-1.5 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-cyan-500 flex items-center justify-center text-xs font-bold text-zinc-950">
          {initials}
        </div>
        <span className="text-sm text-zinc-300 max-w-[120px] truncate">{user.user_metadata?.name || user.email}</span>
        <svg className={`w-4 h-4 text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl py-1 z-50">
          <a href="/dashboard" className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">Dashboard</a>
          <a href="/account" className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">Account settings</a>
          <div className="border-t border-zinc-800 my-1" />
          <button onClick={signOut} className="w-full text-left px-4 py-2.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-colors">Sign out</button>
        </div>
      )}
    </div>
  )
}
