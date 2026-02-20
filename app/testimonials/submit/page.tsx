import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TestimonialForm } from './TestimonialForm'

export const metadata = {
  title: 'Share Your Experience — Good Breeze AI',
  description: 'Submit a testimonial and earn free report credits.',
}

export default async function TestimonialSubmitPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?returnUrl=/testimonials/submit')

  // Check which types the user has already submitted
  const { data: existing } = await supabase
    .from('testimonials')
    .select('type')
    .eq('user_id', user.id)

  const submittedTypes = (existing ?? []).map((t: { type: string }) => t.type)

  return (
    <div className="min-h-screen bg-dark py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <a href="/dashboard" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            ← Back to dashboard
          </a>
          <h1 className="text-3xl font-bold text-white mt-3">Share your experience</h1>
          <p className="text-gray-400 mt-2">
            Help others discover Good Breeze AI — and earn free report credits for doing it.
          </p>

          {/* Credit incentives */}
          <div className="grid sm:grid-cols-2 gap-3 mt-6">
            <div className="bg-dark-700 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Written testimonial</p>
                <p className="text-gray-400 text-xs mt-0.5">Earn 1 free report credit</p>
              </div>
            </div>
            <div className="bg-dark-700 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Video testimonial</p>
                <p className="text-gray-400 text-xs mt-0.5">Earn 5 free report credits</p>
              </div>
            </div>
          </div>
        </div>

        <TestimonialForm submittedTypes={submittedTypes} />
      </div>
    </div>
  )
}
