"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

// ============================================================================
// Plan data
// ============================================================================

const FREE_FEATURES = [
  "1 free Head-to-Head Competitor Analysis",
  "1 free AI SEO Optimizer report",
  "PDF delivered to your email",
  "No credit card required",
];

const STARTER_FEATURES = [
  "All 9 report types",
  "Head-to-Head, Top 3 & Competitive Position",
  "AI SEO, Keyword Research, Landing Page Optimizer",
  "SEO Audit & SEO Comprehensive Report",
  "Multi-Page Audit",
  "Reports delivered by email + stored in dashboard",
  "Cancel anytime — active until billing period ends",
];

const IMPULSE_FEATURES = [
  "3 report credits — use anytime",
  "Head-to-Head, Top 3, AI SEO, Keyword Research, Landing Page Optimizer, SEO Audit",
  "No subscription commitment",
  "Credits valid for 30 days",
];

// ============================================================================
// Types
// ============================================================================

type Plan = "free" | "starter" | "impulse";

// ============================================================================
// Page
// ============================================================================

export default function PricingPage() {
  const [loading, setLoading] = useState<Plan | null>(null);
  const [error, setError] = useState("");
  const { user } = useAuth();

  async function handleCheckout(plan: "starter" | "impulse") {
    if (!user) {
      window.location.href = `/signup?redirect=/pricing`;
      return;
    }
    setLoading(plan);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
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
            Start free. Upgrade when you need more. No hidden fees.
          </p>
        </motion.div>

        {error && (
          <div className="mb-8 max-w-md mx-auto p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 items-stretch">

          {/* FREE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative flex flex-col p-8 rounded-2xl bg-dark-700 border border-primary/20 hover:border-primary/40 transition-all duration-300"
          >
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Free</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-5xl font-bold text-white">$0</span>
              </div>
              <p className="text-gray-400 text-sm">No credit card required</p>
            </div>

            <ul className="space-y-3 mb-8 flex-grow">
              {FREE_FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300 text-sm">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href={user ? "/tools" : "/signup"}
              className="block text-center px-6 py-3 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary hover:text-white transition-all duration-300"
            >
              {user ? "Go to Tools" : "Get Started Free"}
            </Link>
          </motion.div>

          {/* STARTER — highlighted */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative flex flex-col p-8 rounded-2xl bg-dark-700 border-2 border-primary md:scale-105 shadow-xl shadow-primary/20 transition-all duration-300"
          >
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1 bg-gradient-to-r from-primary to-accent-blue text-white text-xs font-bold rounded-full uppercase tracking-wider">
                Most Popular
              </span>
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Starter</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-5xl font-bold text-white">$20</span>
                <span className="text-gray-400 mb-2">/month</span>
              </div>
              <p className="text-gray-400 text-sm">Cancel anytime</p>
            </div>

            <ul className="space-y-3 mb-8 flex-grow">
              {STARTER_FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300 text-sm">{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleCheckout("starter")}
              disabled={loading === "starter"}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading === "starter"
                ? "Redirecting…"
                : user
                ? "Upgrade to Starter"
                : "Start Subscription"}
            </button>

            <p className="text-center text-xs text-gray-500 mt-3">
              Active until end of billing period if cancelled
            </p>
          </motion.div>

          {/* IMPULSE — one-time credit pack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative flex flex-col p-8 rounded-2xl bg-dark-700 border border-primary/20 hover:border-primary/40 transition-all duration-300"
          >
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Impulse</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-5xl font-bold text-white">$10</span>
                <span className="text-gray-400 mb-2">/ 3 reports</span>
              </div>
              <p className="text-gray-400 text-sm">One-time purchase</p>
            </div>

            <ul className="space-y-3 mb-8 flex-grow">
              {IMPULSE_FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300 text-sm">{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleCheckout("impulse")}
              disabled={loading === "impulse"}
              className="w-full px-6 py-3 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary hover:text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading === "impulse"
                ? "Redirecting…"
                : user
                ? "Buy 3 Reports"
                : "Get Started"}
            </button>
          </motion.div>

        </div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-20 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-10">Common Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "What counts as a report?",
                a: "Each time you submit a tool form and we generate a PDF — that's one report. You get the PDF by email and it's saved to your dashboard.",
              },
              {
                q: "What happens when I cancel Starter?",
                a: "Your subscription stays active until the end of your current billing period. You won't be charged again after that.",
              },
              {
                q: "Are there usage limits on Starter?",
                a: "Starter includes up to 5 Analyzer reports per day and 50 SEO reports per month. In practice these limits are generous — most users never hit them.",
              },
              {
                q: "What's in the free tier exactly?",
                a: "You get one free Head-to-Head Competitor Analysis and one free AI SEO Optimizer report. No credit card needed. It's a real report, not a demo — a full PDF delivered to your email.",
              },
              {
                q: "What's the difference between Impulse and Starter?",
                a: "Impulse is a one-time pack of 3 reports — good for occasional use. Starter is a monthly subscription giving you access to all 9 report types including SEO Comprehensive and Multi-Page Audit, with much higher usage limits.",
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
          className="mt-16 text-center bg-dark-700 rounded-2xl border border-primary/20 p-12"
        >
          <h2 className="text-3xl font-bold mb-4 text-white">Need a Custom Solution?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            If you need higher volume, custom report types, or a white-label solution — let&apos;s talk.
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
