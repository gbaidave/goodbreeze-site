'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })

type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: data.password })
    if (error) { setError(error.message); return }
    router.push('/dashboard?message=password_updated')
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Set new password</h1>
      <p className="text-zinc-400 mb-6">Choose a strong password for your account.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <div className="bg-red-950 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">New password</label>
          <input {...register('password')} type="password" className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors" placeholder="At least 8 characters" />
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Confirm password</label>
          <input {...register('confirm')} type="password" className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors" placeholder="Same password again" />
          {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-60">
          {isSubmitting ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </div>
  )
}
