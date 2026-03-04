"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { PhoneGatePrompt } from "@/components/tools/PhoneGatePrompt";
import { createClient } from "@/lib/supabase/client";

// ============================================================================
// Plan data
// ============================================================================

const SUBSCRIPTION_PLANS = [
  {
    key: "starter" as const,
    name: "Starter",
    price: "$20",
    period: "/month",
    reports: "25 reports/month",
    features: [
      "25 reports per month (all types)",
      "Head-to-Head, Top 3 & Competitive Position",
      "AI SEO, Keyword Research, Landing Page Optimizer",
      "SEO Audit & SEO Comprehensive Report",
      "Multi-Page Audit",
      "Reports delivered by email + stored in dashboard",
      "Cancel anytime. Access until billing period ends.",
    ],
    badge: null,
    highlighted: false,
  },
  {
    key: "growth" as const,
    name: "Growth",
    price: "$30",
    period: "/month",
    reports: "40 reports/month",
    features: [
      "40 reports per month (all types)",
      "Head-to-Head, Top 3 & Competitive Position",
      "AI SEO, Keyword Research, Landing Page Optimizer",
      "SEO Audit & SEO Comprehensive Report",
      "Multi-Page Audit",
      "Reports delivered by email + stored in dashboard",
      "Cancel anytime. Access until billing period ends.",
    ],
    badge: "Best Value",
    highlighted: true,
  },
  {
    key: "pro" as const,
    name: "Pro",
    price: "$40",
    period: "/month",
    reports: "50 reports/month",
    features: [
      "50 reports per month (all types)",
      "Head-to-Head, Top 3 & Competitive Position",
      "AI SEO, Keyword Research, Landing Page Optimizer",
      "SEO Audit & SEO Comprehensive Report",
      "Multi-Page Audit",
      "Reports delivered by email + stored in dashboard",
      "Cancel anytime. Access until billing period ends.",
    ],
    badge: null,
    highlighted: false,
  },
] as const;

const ENTRY_OPTIONS = [
  {
    key: "free" as const,
    name: "Free",
    price: "$0",
    subtitle: "No credit card required",
    description: "Try before you buy",
    features: [
      "1 credit included. No card needed.",
      "All report types available",
      "PDF delivered to your email",
    ],
  },
  {
    key: "spark_pack" as const,
    name: "Spark Pack",
    price: "$5",
    subtitle: "One-time purchase",
    description: "3 reports, use anytime",
    features: [
      "3 credits (no expiry)",
      "All standard report types",
      "PDF by email + dashboard access",
    ],
  },
  {
    key: "boost_pack" as const,
    name: "Boost Pack",
    price: "$10",
    subtitle: "One-time purchase",
    description: "10 reports, use anytime",
    features: [
      "10 credits (no expiry)",
      "All standard report types",
      "PDF by email + dashboard access",
    ],
  },
] as const;

type PaidPlan = "starter" | "growth" | "pro" | "spark_pack" | "boost_pack";

const SUBSCRIPTION_PLAN_KEYS = new Set(["starter", "growth", "pro"]);

// Price in USD/month for upgrade/downgrade comparison
const SUBSCRIPTION_PLAN_PRICES: Record<string, number> = { starter: 20, growth: 30, pro: 40 };

// ============================================================================
// Checkmark icon
// ============================================================================

function Check() {
  return (
    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
      <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
}

// ============================================================================
// Page
// ============================================================================

export default function PricingPage() {
  const [loading, setLoading] = useState<PaidPlan | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState("");
  const [phoneRequired, setPhoneRequired] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<PaidPlan | null>(null);
  const [pendingAcknowledged, setPendingAcknowledged] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch user's active subscription plan for upgrade/downgrade/current-plan labeling
  useEffect(() => {
    if (!user) { setCurrentPlan(null); return }
    const supabase = createClient()
    supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => setCurrentPlan(data?.plan ?? null))
  }, [user]);

  // Active subscribers changing plans go to the Stripe Billing Portal,
  // which handles proration natively. New subscribers go through checkout.
  async function openPortal() {
    setPortalLoading(true);
    setError("");
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Could not open billing portal. Please try again or manage billing from Account Settings.');
      }
    } catch {
      setError('Could not open billing portal. Please try again.');
    } finally {
      setPortalLoading(false);
    }
  }

  // Subscription plans auto-acknowledge (credit reset info is shown on the pricing card).
  // Credit packs go straight to checkout with no acknowledgment needed.
  function requestCheckout(planKey: PaidPlan) {
    if (!user) {
      window.location.href = `/signup?redirect=/pricing`;
      return;
    }
    const acknowledged = SUBSCRIPTION_PLAN_KEYS.has(planKey) ? true : undefined;
    handleCheckout(planKey, acknowledged);
  }

  async function handleCheckout(plan: PaidPlan, acknowledged?: boolean) {
    if (!user) {
      window.location.href = `/signup?redirect=/pricing`;
      return;
    }
    setLoading(plan);
    setError("");
    setPhoneRequired(false);
    try {
      const body: Record<string, unknown> = { plan };
      if (acknowledged !== undefined) body.acknowledged = acknowledged;
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.code === "PHONE_REQUIRED") {
        setPendingPlan(plan);
        setPendingAcknowledged(acknowledged ?? false);
        setPhoneRequired(true);
      } else {
        setError(data.error ?? "Failed to start checkout. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-dark py-24 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Link href="/" className="text-primary hover:underline mb-4 inline-block text-sm">
            ← Back to Home
          </Link>
          <h1 className="text-5xl font-bold mb-4 text-white">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Start free. Upgrade when you need more. Cancel anytime, no questions asked.
          </p>
        </motion.div>

        {error && (
          <div className="mb-8 max-w-md mx-auto p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {phoneRequired && pendingPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
            <div className="max-w-md w-full relative">
              <button
                type="button"
                onClick={() => setPhoneRequired(false)}
                className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 border border-gray-700 text-gray-400 hover:text-white hover:bg-zinc-700 transition-colors"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <PhoneGatePrompt
                onPhoneSaved={() => {
                  setPhoneRequired(false);
                  if (pendingPlan) handleCheckout(pendingPlan, pendingAcknowledged || undefined);
                }}
              />
            </div>
          </div>
        )}

        {/* ── Entry Options (Free + Credit Packs) ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-4"
        >
          <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">
            Start Here
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {/* Report Credits info card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col p-6 rounded-2xl bg-dark-700 border border-primary/10 hover:border-primary/30 transition-all duration-300"
          >
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Credits
              </p>
              <p className="text-xl font-bold text-white">One report, one credit</p>
            </div>
            <ul className="space-y-2 flex-grow">
              {[
                "New accounts get 1 free credit. No card needed.",
                "Credit packs have no expiry. Use them whenever.",
                "Plan credits reset at the start of each billing period.",
                "All report types use 1 credit each.",
                "Earn free credits with referrals and testimonials.",
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check />
                  <span className="text-gray-400 text-sm">{f}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Credit pack cards */}
          {ENTRY_OPTIONS.filter((o) => o.key !== "free").map((option, idx) => (
            <motion.div
              key={option.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.05 }}
              className="flex flex-col p-6 rounded-2xl bg-dark-700 border border-primary/10 hover:border-primary/30 transition-all duration-300"
            >
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  {option.name}
                </p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-bold text-white">{option.price}</span>
                </div>
                <p className="text-gray-500 text-xs">{option.subtitle}</p>
                <p className="text-gray-400 text-sm mt-1">{option.description}</p>
              </div>

              <ul className="space-y-2 mb-6 flex-grow">
                {option.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check />
                    <span className="text-gray-400 text-sm">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(option.key as PaidPlan)}
                disabled={loading === option.key}
                className="w-full px-5 py-2.5 border border-primary/50 text-primary font-semibold rounded-full hover:bg-primary/10 transition-all duration-300 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading === option.key
                  ? "Redirecting…"
                  : user
                  ? `Buy ${option.name}`
                  : "Get Started"}
              </button>
            </motion.div>
          ))}
        </div>

        {/* ── Monthly Plans ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-4"
        >
          <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">
            Monthly Plans
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch mb-16">
          {SUBSCRIPTION_PLANS.map((plan, idx) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.05 }}
              className={`relative flex flex-col p-8 rounded-2xl transition-all duration-300 ${
                plan.highlighted
                  ? "bg-dark-700 border-2 border-primary shadow-xl shadow-primary/20"
                  : "bg-dark-700 border border-primary/20 hover:border-primary/40"
              }`}
            >
              {plan.badge && (
                <div className="absolute top-8 right-6">
                  <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent-blue text-white text-xs font-bold uppercase tracking-wide shadow-lg shadow-primary/30 whitespace-nowrap ring-1 ring-white/20">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p className={`text-sm font-semibold uppercase tracking-wider mb-2 ${plan.highlighted ? "text-primary" : "text-gray-400"}`}>
                  {plan.name}
                </p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 mb-2">{plan.period}</span>
                </div>
                <p className="text-primary text-sm font-medium">{plan.reports}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check />
                    <span className="text-gray-300 text-sm">{f}</span>
                  </li>
                ))}
              </ul>

              {(() => {
                const isCurrentPlan = currentPlan === plan.key
                const currentPrice = currentPlan ? SUBSCRIPTION_PLAN_PRICES[currentPlan] : undefined
                const thisPrice = SUBSCRIPTION_PLAN_PRICES[plan.key]
                // Active subscribers changing plans go to the portal (handles proration natively)
                const isChangingPlan = !isCurrentPlan && currentPrice !== undefined && thisPrice !== undefined
                const btnLabel =
                  (loading === plan.key || (isChangingPlan && portalLoading)) ? "Redirecting…"
                  : isCurrentPlan ? "Current Plan"
                  : !user ? "Start Subscription"
                  : isChangingPlan
                    ? (thisPrice > currentPrice ? `Upgrade to ${plan.name}` : `Downgrade to ${plan.name}`)
                  : `Get ${plan.name} Plan`
                return (
                  <button
                    onClick={() => isChangingPlan ? openPortal() : requestCheckout(plan.key)}
                    disabled={loading === plan.key || portalLoading || isCurrentPlan}
                    className={`w-full px-6 py-3 font-semibold rounded-full transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed ${
                      isCurrentPlan
                        ? "border-2 border-gray-600 text-gray-500 cursor-default"
                        : plan.highlighted
                        ? "bg-gradient-to-r from-primary to-accent-blue text-white border-2 border-white/60 hover:shadow-lg hover:shadow-primary/50 disabled:transform-none"
                        : "border-2 border-primary text-primary hover:bg-primary hover:text-white"
                    }`}
                  >
                    {btnLabel}
                  </button>
                )
              })()}

              <p className="text-center text-xs text-gray-500 mt-3">
                Access until billing period ends if cancelled. Credits reset each billing period.
              </p>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-10">Common Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "What counts as a report?",
                a: "Each time you submit a report form and we generate a PDF, that counts as one report. You get the PDF by email and it's saved to your dashboard.",
              },
              {
                q: "What happens when I cancel a monthly plan?",
                a: "Your plan stays active until the end of your current billing period. You won't be charged again after that. You can cancel anytime from your account settings or by contacting us.",
              },
              {
                q: "Do monthly credits roll over?",
                a: "Monthly plan credits reset at the start of each billing period and unused credits do not roll over. Any credit pack credits you hold also reset at renewal. Credit packs purchased when you are not on a subscription plan have no expiry.",
              },
              {
                q: "What's in the free tier exactly?",
                a: "You get 1 credit when you sign up. No credit card needed. Run any report type. Full PDF delivered to your email. Not a watered-down demo.",
              },
              {
                q: "What's the difference between credit packs and monthly plans?",
                a: "Credit packs (Spark: 3 reports / Boost: 10 reports) are one-time purchases with no commitment. Monthly plans give you a set number of reports per month and access to all 9 report types. If you run reports regularly, a monthly plan is better value.",
              },
              {
                q: "Which plan is best for my business?",
                a: "Start free to see the value. If you need more reports, a credit pack is the easiest next step. If you run reports regularly for SEO, competitive tracking, or client work, the Growth plan at $30/month covers most businesses at 40 reports/month.",
              },
            ].map(({ q, a }, i) => (
              <div key={i} className="p-6 rounded-xl bg-dark-700 border border-primary/10">
                <h3 className="font-semibold text-white mb-2">{q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center bg-dark-700 rounded-2xl border border-primary/20 p-12"
        >
          <h2 className="text-3xl font-bold mb-4 text-white">Need a Custom Solution?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Higher volume, custom report types, or white-label options? Let&apos;s talk.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105"
          >
            Contact Us
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
