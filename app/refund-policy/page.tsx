import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Refund Policy | Good Breeze AI',
  robots: { index: false, follow: false },
}

const EFFECTIVE_DATE = 'March 3, 2026'

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-dark py-24 px-6">
      <div className="max-w-3xl mx-auto">

        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/" className="text-gray-400 hover:text-primary transition-colors">
            Home
          </Link>
          <span className="text-gray-600 mx-2">/</span>
          <span className="text-gray-300">Refund Policy</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">Refund Policy</h1>
          <p className="text-gray-400 text-sm">Effective date: {EFFECTIVE_DATE}</p>
        </div>

        <div className="prose-dark space-y-10 text-gray-300 leading-relaxed">

          {/* Intro */}
          <p>
            This Refund Policy applies to all purchases made through goodbreeze.ai (the
            &ldquo;Service&rdquo;), operated by Good Breeze AI (&ldquo;we,&rdquo;
            &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By completing a purchase, you
            acknowledge and agree to the terms of this policy.
          </p>

          {/* 1. Eligibility */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Refund Eligibility</h2>
            <p className="mb-4">
              We offer full refunds under the specific conditions below. No partial refunds
              are issued under any circumstances.
            </p>

            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 space-y-6">

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Monthly Subscriptions (Starter, Growth, Pro)
                </h3>
                <p className="mb-3">
                  You may request a full refund on a monthly subscription if <strong className="text-white">both</strong> of the following conditions are met:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Your refund request is submitted within <strong className="text-white">14 calendar days</strong> of the original purchase date, <strong className="text-white">and</strong></li>
                  <li>You have <strong className="text-white">not used any credits</strong> from that subscription period.</li>
                </ul>
                <p className="mt-3 text-sm text-gray-400">
                  If any credits have been used during the billing period, no refund is available.
                  Your subscription will remain active until the end of the current billing period
                  and will not renew. No prorated refund will be issued for the unused portion.
                </p>
              </div>

              <div className="border-t border-zinc-700 pt-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Credit Packs (Spark Pack, Boost Pack)
                </h3>
                <p className="mb-3">
                  You may request a full refund on a credit pack if <strong className="text-white">both</strong> of the following conditions are met:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Your refund request is submitted within <strong className="text-white">14 calendar days</strong> of the purchase date, <strong className="text-white">and</strong></li>
                  <li>You have <strong className="text-white">not used any credits</strong> from that pack.</li>
                </ul>
                <p className="mt-3 text-sm text-gray-400">
                  If any credits from the pack have been used, the entire pack is non-refundable.
                  No partial refunds are issued based on remaining credit balance.
                </p>
                <p className="mt-3 text-sm text-gray-300">
                  To request a pack refund,{' '}
                  <Link href="/support" className="text-primary hover:text-primary/80 transition-colors">
                    submit a support ticket
                  </Link>{' '}
                  and select <strong className="text-white">Billing</strong> as the category. Include your
                  purchase date and we&rsquo;ll handle it from there.
                </p>
              </div>
            </div>
          </section>

          {/* 2. How to Request */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. How to Request a Refund</h2>
            <p className="mb-4">
              Refunds are processed by our support team. To submit a refund request:
            </p>
            <ol className="list-decimal list-inside space-y-2 pl-2">
              <li>Log in to your account at goodbreeze.ai</li>
              <li>
                Navigate to <strong className="text-white">Account Settings</strong> and open a
                support ticket
              </li>
              <li>
                Select &ldquo;Refund request&rdquo; and include your purchase date and the
                email address associated with your account
              </li>
            </ol>
            <p className="mt-4">
              We will review your request and respond within <strong className="text-white">2 business days</strong>.
              If approved, refunds are issued to your original payment method. Processing time
              is typically <strong className="text-white">5&ndash;10 business days</strong> depending
              on your bank or card issuer.
            </p>
          </section>

          {/* 3. Cancellations */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Subscription Cancellations</h2>
            <p className="mb-3">
              You may cancel your subscription at any time through your account settings
              (&ldquo;Manage Billing&rdquo;). Upon cancellation:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>You retain full access and all remaining credits through the end of the current billing period.</li>
              <li>Your subscription will not renew at the next billing date.</li>
              <li>No prorated refund is issued for the unused portion of the billing period, unless you qualify for a refund under Section 1 above.</li>
            </ul>
          </section>

          {/* 4. Plan Changes */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Plan Upgrades and Downgrades</h2>
            <p className="mb-3">
              You may change your subscription plan at any time through the Stripe Billing
              Portal, accessible via &ldquo;Manage Billing&rdquo; in your account settings.
              Plan changes take effect immediately and are prorated by Stripe:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>
                <strong className="text-white">Upgrade:</strong> You are charged only for the
                remaining days in the current billing period at the higher plan rate. Your
                available credits are increased accordingly.
              </li>
              <li>
                <strong className="text-white">Downgrade:</strong> A prorated credit is applied
                to your Stripe account for the unused portion of the higher-tier plan. This
                credit is applied toward your next invoice.
              </li>
            </ul>
            <p className="mt-4 text-sm text-gray-400">
              Prorated billing adjustments resulting from plan changes are handled by Stripe and
              are not eligible for cash refunds under this policy.
            </p>
          </section>

          {/* 5. Non-Refundable */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Non-Refundable Items</h2>
            <p className="mb-3">The following are not eligible for refunds under any circumstances:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Any purchase where one or more credits have been used, even partially</li>
              <li>Purchases for which a refund request is submitted after 14 calendar days from the purchase date</li>
              <li>Prorated billing adjustments resulting from plan changes</li>
              <li>Reports that have already been generated and delivered</li>
            </ul>
          </section>

          {/* 6. Chargebacks */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Chargebacks and Payment Disputes</h2>
            <p className="mb-3">
              If you initiate a chargeback or payment dispute with your bank or credit card
              issuer without first contacting us through our support system, we reserve the
              right to:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>
                Dispute the chargeback using documented evidence of this Refund Policy, your
                acceptance of it at the time of purchase, and your account activity records.
              </li>
              <li>
                Suspend or terminate your account pending resolution of the dispute.
              </li>
            </ul>
            <p className="mt-4">
              We are committed to resolving billing issues fairly. Please contact our support
              team before initiating any dispute with your payment provider.
            </p>
          </section>

          {/* 7. Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Governing Law</h2>
            <p>
              This Refund Policy is governed by the laws of the State of California, without
              regard to its conflict of law provisions. Any disputes arising under this policy
              shall be resolved in accordance with the dispute resolution terms set forth in
              our Terms of Service.
            </p>
          </section>

          {/* 8. Changes */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Changes to This Policy</h2>
            <p>
              We reserve the right to update this Refund Policy at any time. Material changes
              will be communicated to active subscribers by email. Continued use of the Service
              after any changes constitutes your acceptance of the revised policy.
            </p>
          </section>

          {/* 9. Contact */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Contact Us</h2>
            <p className="mb-3">
              For refund requests or billing questions, please contact us through your account:
            </p>
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 space-y-2 text-sm">
              <p>
                <span className="text-gray-400">Support portal:</span>{' '}
                <Link href="/support" className="text-primary hover:text-primary/80 transition-colors">
                  goodbreeze.ai/support
                </Link>
              </p>
              <p>
                <span className="text-gray-400">Email:</span>{' '}
                <a href="mailto:support@goodbreeze.ai" className="text-primary hover:text-primary/80 transition-colors">
                  support@goodbreeze.ai
                </a>
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
