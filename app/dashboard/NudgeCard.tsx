import { UpgradeButton } from './UpgradeButton'

interface Props {
  starterPriceId: string
  boostPackPriceId: string
  hasWrittenTestimonial: boolean
  hasVideoTestimonial: boolean
}

/**
 * Shown on the dashboard when a user has used all free reports AND has no credits.
 * Surfaced when: not on a paid plan && totalCredits === 0 && freeRemaining === 0.
 * Uses UpgradeButton (client component) for direct Stripe checkout.
 */
export function NudgeCard({ starterPriceId, boostPackPriceId, hasWrittenTestimonial, hasVideoTestimonial }: Props) {
  const bothTestimonialsSubmitted = hasWrittenTestimonial && hasVideoTestimonial

  return (
    <div className="bg-gradient-to-br from-primary/10 to-accent-blue/10 border border-primary/40 rounded-2xl p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <p className="text-white font-semibold">You&apos;re out of credits</p>
          <p className="text-gray-400 text-sm mt-0.5">
            Get more credits — buy a pack or earn them.
          </p>
        </div>
      </div>

      {/* Upgrade CTAs */}
      <div className="flex flex-wrap gap-3 mb-5">
        <UpgradeButton
          priceId={boostPackPriceId}
          label="Get 10 reports — $10"
          className="px-5 py-2.5 border border-primary text-primary font-semibold rounded-xl hover:bg-primary/10 transition-colors text-sm"
        />
        <UpgradeButton
          priceId={starterPriceId}
          label="25 reports — $20/mo"
          className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all text-sm"
        />
      </div>

      {/* Free credit paths */}
      {!bothTestimonialsSubmitted && (
        <div className="border-t border-primary/20 pt-4">
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-3">Or earn credits</p>
          <div className="space-y-2">
            {!hasWrittenTestimonial && (
              <a
                href="/testimonials/submit"
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-primary transition-colors"
              >
                <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Submit a written testimonial — earn 1 credit
              </a>
            )}
            {!hasVideoTestimonial && (
              <a
                href="/testimonials/submit"
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-primary transition-colors"
              >
                <svg className="w-4 h-4 text-accent-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Submit a video testimonial — earn 5 credits
              </a>
            )}
            <a
              href="#referral"
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-primary transition-colors"
            >
              <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Refer a friend — earn 1 credit per signup
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
