import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Customer Stories | Good Breeze AI',
  description:
    'See how businesses use Good Breeze AI SEO and competitive intelligence reports to rank higher, outmaneuver competitors, and make smarter content decisions.',
}

interface Testimonial {
  id: string
  content: string
  type: string
  created_at: string
  profiles: {
    name: string | null
    company: string | null
  } | null
}

export default async function TestimonialsPage() {
  const supabase = await createClient()

  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('id, content, type, created_at, profiles(name, company)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  const approved = (testimonials ?? []) as unknown as Testimonial[]

  return (
    <div className="min-h-screen bg-dark py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-2">
          <Link href="/" className="text-gray-500 hover:text-primary text-sm transition-colors">← Home</Link>
        </div>

        <div className="mt-6 mb-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Customer Stories
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Real results from businesses that stopped guessing and started using data.
          </p>
        </div>

        {approved.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Stories coming soon</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              We&apos;re collecting stories from early users. Check back soon — or be one of the first to share yours.
            </p>
            <Link
              href="/tools"
              className="inline-block px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              Run a free report
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {approved.map((t) => (
              <div
                key={t.id}
                className="bg-dark-700 border border-primary/20 rounded-2xl p-6 flex flex-col"
              >
                <svg className="w-6 h-6 text-primary mb-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-gray-300 leading-relaxed flex-1 mb-6">{t.content}</p>
                <div className="border-t border-primary/10 pt-4">
                  <p className="text-white font-semibold text-sm">{t.profiles?.name ?? 'Good Breeze AI User'}</p>
                  {t.profiles?.company && (
                    <p className="text-gray-500 text-xs mt-0.5">{t.profiles.company}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">Used Good Breeze AI? Share your experience and earn free report credits.</p>
          <Link
            href="/testimonials/submit"
            className="inline-block px-8 py-3 border border-primary/40 text-gray-300 rounded-full hover:border-primary hover:text-white transition-all text-sm font-medium"
          >
            Submit your story →
          </Link>
        </div>
      </div>
    </div>
  )
}
