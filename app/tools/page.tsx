"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const tools = [
  {
    name: "Competitive Analyzer",
    description: "AI-powered competitive intelligence — head-to-head, top 3 competitors, or full market positioning.",
    href: "/tools/sales-analyzer",
    features: [
      "Head-to-Head competitor analysis",
      "Top 3 Competitors breakdown",
      "Competitive Position (market overview)",
      "PDF delivered in minutes",
    ],
    badge: null,
    comingSoon: false,
  },
  {
    name: "SEO Intelligence Suite",
    description: "Five AI-powered SEO reports in one place — from AI visibility audits to full keyword research and competitor benchmarking.",
    href: "/tools/seo-intelligence",
    features: [
      "AI SEO Optimizer (no login required)",
      "SEO Audit — technical + keyword opportunities",
      "Keyword Research — seed to content strategy",
      "Landing Page Optimizer — conversions + SEO",
      "SEO Comprehensive — our most complete report",
    ],
    badge: null,
    comingSoon: false,
  },
  {
    name: "Social Media Content Optimizer",
    description: "AI-powered social media content strategies and post templates tailored to your brand and audience.",
    href: "#",
    features: [
      "Platform-specific content strategy",
      "Post templates and copy suggestions",
      "Hashtag and engagement optimization",
      "Content calendar planning",
    ],
    badge: "Coming Soon",
    comingSoon: true,
  },
];

export default function ToolsDirectory() {
  return (
    <div className="min-h-screen bg-dark py-24 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 text-white">
            AI-Powered Business Intelligence
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            See who&apos;s outranking you, who&apos;s outcompeting you, and what to do about it. First report free, no card needed.
          </p>
        </motion.div>

        {/* Tool grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
              className={`relative group ${tool.comingSoon ? 'opacity-50' : ''}`}
            >
              {tool.badge && (
                <div className="absolute -top-3 left-6 z-10">
                  <span className="px-3 py-1 bg-gradient-to-r from-primary to-accent-blue text-white text-xs font-bold rounded-full">
                    {tool.badge}
                  </span>
                </div>
              )}

              <div className={`relative h-full flex flex-col p-7 rounded-2xl bg-dark-700 border transition-all duration-300 overflow-hidden ${
                tool.comingSoon
                  ? 'border-gray-800'
                  : 'border-primary/20 hover:border-primary/50'
              }`}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10 flex flex-col flex-grow">
                  <div className="mb-3">
                    <h3 className="text-xl font-bold text-white leading-snug">{tool.name}</h3>
                  </div>

                  <p className="text-gray-400 text-sm mb-5 leading-relaxed">{tool.description}</p>

                  <ul className="space-y-2 mb-7 flex-grow">
                    {tool.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-gray-400">
                        <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {tool.comingSoon ? (
                    <button
                      disabled
                      className="block w-full text-center px-6 py-3 bg-transparent border-2 border-gray-700 text-gray-600 font-semibold rounded-full cursor-not-allowed text-base"
                    >
                      Coming Soon
                    </button>
                  ) : (
                    <Link
                      href={tool.href}
                      className="block text-center px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300 text-base"
                    >
                      Get My Report
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Need More Firepower */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center bg-dark-700 rounded-2xl border border-primary/20 p-12"
        >
          <h2 className="text-3xl font-bold mb-4 text-white">Need More Firepower?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Monthly plans start at $20/month for 25 reports across all types. Or grab a credit pack for occasional use.
          </p>
          <Link
            href="/pricing"
            className="inline-block px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300"
          >
            See Pricing
          </Link>
        </motion.div>

        {/* Free report CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative mt-12 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary rounded-full blur-3xl opacity-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-purple rounded-full blur-3xl opacity-10 pointer-events-none" />

          <div className="relative bg-dark-800 rounded-3xl px-12 pt-8 pb-12 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent-blue/10 to-accent-purple/10 rounded-3xl" />
            <div className="relative z-10 text-center">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
                Your First Report Is Free
              </h2>
              <p className="text-xl text-white/85 mb-10 max-w-2xl mx-auto leading-relaxed">
                Run any report for free. No account required, no credit card.
              </p>
              <Link
                href="/tools/sales-analyzer"
                className="inline-block px-12 py-6 bg-transparent border-2 border-white text-white text-xl font-bold rounded-full shadow-2xl hover:bg-white/10 transition-all duration-300"
              >
                Run Your First Free Report
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
