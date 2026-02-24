'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({ email: z.string().email('Enter a valid email address') })
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setSent(true) // Always show success — don't reveal if email exists
  }

  if (sent) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-4">📧</div>
        <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
        <p className="text-zinc-400">If that email is registered, you'll receive a password reset link shortly.</p>
        <a href="/login" className="inline-block mt-6 text-cyan-400 hover:text-cyan-300 text-sm">Back to login</a>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Reset password</h1>
      <p className="text-zinc-400 mb-6">Enter your email and we'll send you a reset link.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
          <input {...register('email')} type="email" className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors" placeholder="you@company.com" />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-60">
          {isSubmitting ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
      <p className="text-center text-sm text-zinc-500 mt-6">
        <a href="/forgot-password/by-phone" className="text-cyan-400 hover:text-cyan-300">Use phone number instead</a>
        {' · '}
        <a href="/login" className="text-cyan-400 hover:text-cyan-300">Back to login</a>
      </p>
    </div>
  )
}
