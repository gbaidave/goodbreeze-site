'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { captureEvent } from '@/lib/analytics'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  company: z.string().optional(),
  marketingOptIn: z.boolean(),
})
type FormData = z.infer<typeof schema>

export default function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') || '/dashboard'
  const referralCode = searchParams.get('ref') || null
  const [serverError, setServerError] = useState<string | null>(null)
  const [oauthLoading, setOauthLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { marketingOptIn: true },
  })

  async function onSubmit(data: FormData) {
    setServerError(null)
    try {
      const supabase = createClient()
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            company: data.company || null,
            marketing_opt_in: data.marketingOptIn,
            referred_by_affiliate_code: referralCode,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?returnUrl=${returnUrl}`,
        },
      })
      if (error) {
        setServerError(error.message)
        return
      }
      try { captureEvent('signup_completed', { method: 'email' }) } catch (_) {}
      // If Supabase returns a session immediately (email confirmation disabled), redirect
      if (signUpData?.session) {
        router.push(returnUrl)
        return
      }
      setSuccess(true)
    } catch (err: any) {
      setServerError(err?.message ?? 'Something went wrong. Please try again.')
    }
  }

  async function signUpWithGoogle() {
    setOauthLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?returnUrl=${returnUrl}`,
        queryParams: { prompt: 'select_account' },
      },
    })
  }

  if (success) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-4">📬</div>
        <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
        <p className="text-zinc-400">We sent a confirmation link to your email. Click it to activate your account.</p>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Start for free</h1>
      <p className="text-zinc-400 mb-6">Get your first AI report in minutes. No credit card required.</p>

      <button
        onClick={signUpWithGoogle}
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="bg-red-950 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg">{serverError}</div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Name</label>
            <input {...register('name')} className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors" placeholder="Your name" />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Company <span className="text-zinc-500">(optional)</span></label>
            <input {...register('company')} className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors" placeholder="Your company" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
          <input {...register('email')} type="email" autoComplete="email" className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors" placeholder="you@company.com" />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
          <input {...register('password')} type="password" autoComplete="new-password" className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors" placeholder="At least 8 characters" />
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input {...register('marketingOptIn')} type="checkbox" className="mt-0.5 accent-cyan-500" />
          <span className="text-sm text-zinc-400">Send me tips, product updates, and occasional offers. Unsubscribe anytime.</span>
        </label>

        <button type="submit" disabled={isSubmitting} className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-60">
          {isSubmitting ? 'Creating account...' : 'Create free account'}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500 mt-6">
        Already have an account?{' '}
        <a href="/login" className="text-cyan-400 hover:text-cyan-300">Sign in</a>
      </p>
    </div>
  )
}
