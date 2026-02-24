'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import TurnstileWidget from '@/components/auth/TurnstileWidget'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function LoginForm() {
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') || '/dashboard'
  const sessionExpired = searchParams.get('reason') === 'timeout'
  const [serverError, setServerError] = useState<string | null>(null)
  const [oauthLoading, setOauthLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setServerError(null)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        captchaToken: captchaToken ?? undefined,
      }),
    })
    if (res.ok) {
      // Full page navigation so AuthProvider re-mounts and reads the session
      // cookie set by the server. router.push() keeps AuthProvider mounted with
      // stale null state because onAuthStateChange never fires for server-side logins.
      window.location.href = returnUrl
      return
    }
    const body = await res.json()
    setServerError(body.error ?? 'Sign in failed. Please try again.')
  }

  async function signInWithGoogle() {
    setOauthLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?returnUrl=${returnUrl}`,
      },
    })
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
      <p className="text-zinc-400 mb-6">Sign in to your Good Breeze AI account</p>

      {sessionExpired && (
        <div className="bg-amber-950 border border-amber-800 text-amber-300 text-sm px-4 py-3 rounded-lg mb-4">
          Your session expired due to inactivity. Sign in to continue.
        </div>
      )}

      {/* Google OAuth */}
      <button
        onClick={signInWithGoogle}
        disabled={oauthLoading}
        className="w-full flex items-center justify-center gap-3 bg-white text-zinc-900 font-medium py-3 px-4 rounded-lg hover:bg-zinc-100 transition-colors mb-4 disabled:opacity-60"
      >
        <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
        {oauthLoading ? 'Redirecting...' : 'Continue with Google'}
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-zinc-800" />
        <span className="text-zinc-500 text-sm">or</span>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>

      {/* Email/password form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="bg-red-950 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg">
            {serverError}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
            placeholder="you@company.com"
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-medium text-zinc-300">Password</label>
            <a href="/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300">Forgot password?</a>
          </div>
          <input
            {...register('password')}
            type="password"
            autoComplete="current-password"
            className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <TurnstileWidget onVerify={(token) => setCaptchaToken(token)} />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500 mt-6">
        Don&apos;t have an account?{' '}
        <a href="/signup" className="text-cyan-400 hover:text-cyan-300">Start for free</a>
      </p>
    </div>
  )
}
