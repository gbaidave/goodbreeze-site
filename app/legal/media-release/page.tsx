/**
 * /legal/media-release
 *
 * Public, versioned copy of the Good Breeze AI Media Release Authorization.
 * Version v1.0 — matches CONSENT_TEXT_VERSION in /api/testimonials/route.ts.
 *
 * Update this page AND increment CONSENT_TEXT_VERSION in route.ts if the text changes.
 */

export const metadata = {
  title: 'Media Release Authorization | Good Breeze AI',
  description: 'Good Breeze AI LLC Media Release Authorization for testimonial submissions.',
}

const LAST_UPDATED = 'March 2025'
const VERSION = 'v1.0'

export default function MediaReleasePage() {
  return (
    <div className="min-h-screen bg-dark py-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <a href="/" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">← Good Breeze AI</a>
          <h1 className="text-3xl font-bold text-white mt-4 mb-2">Media Release Authorization</h1>
          <p className="text-gray-500 text-sm">
            Version {VERSION} · Last updated {LAST_UPDATED}
          </p>
          <p className="text-gray-400 text-sm mt-4 leading-relaxed">
            This is the authorization you agree to when submitting a testimonial on{' '}
            <a href="/testimonials/submit" className="text-primary hover:underline">goodbreeze.ai/testimonials/submit</a>.
            A signed copy is emailed to you at the time of submission.
          </p>
        </div>

        {/* Content */}
        <div className="bg-dark-700 border border-primary/20 rounded-2xl p-8 space-y-6 text-gray-400 text-sm leading-relaxed">

          <p className="text-gray-200 font-medium">
            I have read the Media Release Authorization below and agree to its terms. I authorize Good Breeze AI
            LLC to use my testimonial, name, and/or video for marketing purposes as described therein. I confirm
            I am 18 or older and that this reflects my genuine experience with the product.
          </p>

          <hr className="border-gray-800" />

          <div className="space-y-5">
            <div>
              <h2 className="text-white font-semibold mb-2">Purpose</h2>
              <p>
                By checking the consent box on this form, I hereby provide my electronic consent to authorize
                GOOD BREEZE AI LLC to use and disclose my written testimonial, pull-quote, name, and/or video
                submission (including video links I provide) in its marketing, website, social media, and public
                relations efforts.
              </p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-2">Right to Revoke</h2>
              <p>
                I understand I have the right to revoke this authorization at any time by sending written notice
                to{' '}
                <a href="mailto:support@goodbreeze.ai" className="text-primary hover:underline">support@goodbreeze.ai</a>.
                Revocation will not affect any use of my content that occurred before my revocation was received.
              </p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-2">Authorization to Release</h2>
              <p>
                I hereby authorize GOOD BREEZE AI LLC and its personnel to use my testimonial, pull-quote, name,
                and/or video submission in its marketing, public relations, and media efforts, including but not
                limited to the Good Breeze AI website, social media channels, email marketing, and advertising
                materials.
              </p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-2">Indefinite Use</h2>
              <p>
                I understand that my testimonial content, once published, may exist indefinitely in recorded,
                printed, or electronic form, and may be further shared by others beyond Good Breeze AI LLC&apos;s
                direct control.
              </p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-2">Voluntary Authorization</h2>
              <p>
                I am not required to provide this authorization. Good Breeze AI LLC does not condition access to
                its products, services, or pricing on this authorization. I am not entitled to monetary payment
                for use of my testimonial; however, Good Breeze AI LLC may, at its discretion, provide credits
                or other non-monetary benefits in appreciation for my submission.
              </p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-2">Age Confirmation and Release of Liability</h2>
              <p>
                I confirm I am 18 years of age or older and have the right to grant this authorization. I waive
                the right of prior approval and release and hold harmless GOOD BREEZE AI LLC and its affiliates
                from any and all claims for damages arising from the use of my testimonial, name, or video
                submission in the Company&apos;s marketing and media efforts.
              </p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-2">Electronic Consent</h2>
              <p>
                My electronic consent constitutes a legally binding agreement under the California Uniform
                Electronic Transactions Act (Cal. Com. Code §§ 1633.1 et seq.) and the federal E-SIGN Act.
              </p>
            </div>
          </div>

          <hr className="border-gray-800" />

          <div className="text-xs text-gray-500 space-y-1">
            <p>Contact for revocation requests: <a href="mailto:support@goodbreeze.ai" className="text-primary hover:underline">support@goodbreeze.ai</a></p>
            <p>Good Breeze AI LLC · <a href="/" className="hover:text-gray-300 transition-colors">goodbreeze.ai</a></p>
          </div>
        </div>

        {/* Need a copy note */}
        <div className="mt-6 bg-dark-700 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-2">Need your signed copy?</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            A confirmation email with your full signed record (name, date, time, IP, and release text) was sent
            to you when you submitted your testimonial. If you need it resent,{' '}
            <a href="/support" className="text-primary hover:underline">file a support request</a> and we&apos;ll
            send it within one business day.
          </p>
        </div>

      </div>
    </div>
  )
}
