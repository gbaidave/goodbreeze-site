"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const tools = [
  {
    name: "Competitive Analyzer",
    description: "Head-to-head, top 3 competitors, or full market positioning. Choose your competitive analysis.",
    href: "/reports/competitive-analyzer",
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
    name: "Brand Visibility",
    description: "Five reports: audits, keyword research, landing page analysis, competitor benchmarking, and AI visibility.",
    href: "/reports/seo-intelligence",
    features: [
      "AI SEO Optimizer",
      "SEO Audit: technical + keyword",
      "Keyword Research: seed to strategy",
      "Landing Page Optimizer",
      "SEO Comprehensive: our deepest report",
    ],
    badge: null,
    comingSoon: false,
  },
  {
    name: "Content Generator",
    description: "Content strategies and templates built around your brand voice and audience.",
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
            AI Powered Business Intelligence
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            See who&apos;s outranking you, who&apos;s outcompeting you, and what to do about it.
          </p>
        </motion.div>

        {/* BPR Spotlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-12 rounded-2xl border border-primary/30 p-8 sm:p-9 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8"
          style={{ background: 'linear-gradient(135deg, rgba(0,173,181,0.08) 0%, rgba(0,173,181,0.02) 100%)' }}
        >
          <div className="flex-1">
            <p className="text-xs font-bold tracking-widest uppercase text-primary mb-2">Don&apos;t know where to start?</p>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">Business Presence Report</h2>
            <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
              {["Online visibility score", "Competitor comparison", "Reputation check", "Priority action list"].map(f => (
                <li key={f} className="flex items-center gap-1.5 text-sm text-gray-400">
                  <svg className="w-3.5 h-3.5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-center gap-2.5 flex-shrink-0">
            <Link href="/free-business-presence-report" className="px-7 py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all text-sm">
              Get My Free Report
            </Link>
            <Link href="/reports/business-presence" className="px-7 py-2.5 border border-gray-700 text-gray-400 font-medium rounded-xl hover:border-primary hover:text-white transition-all text-sm">
              View My Report
            </Link>
            <p className="text-[11px] text-gray-600"><span className="text-primary font-semibold">First report free.</span> Updates cost 3 credits.</p>
          </div>
        </motion.div>

        {/* Report Suites label */}
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Report Suites</p>

        {/* Tool grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.07 }}
              className={`relative group ${tool.comingSoon ? 'opacity-50' : ''}`}
            >
              {tool.badge && (
                <div className="absolute -top-3 left-6 z-10">
                  <span className="px-3 py-1 bg-gradient-to-r from-primary to-accent-blue text-white text-xs font-bold rounded-full">
                    {tool.badge}
                  </span>
                </div>
              )}

              <div className={`relative h-full flex flex-col p-7 rounded-2xl border transition-all duration-300 overflow-hidden ${
                tool.comingSoon
                  ? 'bg-dark-700/50 border-gray-800'
                  : 'bg-[#1a1a2e] border-primary/20 hover:border-primary/50'
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
            className="inline-block px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300"
          >
            See Pricing
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
