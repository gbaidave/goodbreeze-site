'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function WelcomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(interval)
          router.push(next)
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [next, router])

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
      <div className="text-5xl mb-4">🎉</div>
      <h1 className="text-2xl font-bold text-white mb-2">You&apos;re confirmed!</h1>
      <p className="text-zinc-400 mb-6">
        Your email has been verified. Welcome to Good Breeze AI.
      </p>
      <button
        onClick={() => router.push(next)}
        className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold py-3 px-4 rounded-lg transition-colors"
      >
        Go to dashboard
      </button>
      <p className="text-zinc-500 text-sm mt-3">Redirecting in {countdown}…</p>
    </div>
  )
}

export default function WelcomePage() {
  return (
    <Suspense>
      <WelcomeContent />
    </Suspense>
  )
}
