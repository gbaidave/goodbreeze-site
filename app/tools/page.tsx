"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const tools = [
  {
    name: "Competitive Analyzer",
    description: "AI-powered competitive intelligence — head-to-head, top 3 competitors, or full market positioning.",
    href: "/tools/sales-analyzer",
    tier: "1 free",
    tierStyle: "bg-primary/10 text-primary border-primary/30",
    features: [
      "Head-to-Head competitor analysis",
      "Top 3 Competitors breakdown",
      "Competitive Position (market overview)",
      "PDF delivered by email in minutes",
    ],
    badge: null,
  },
  {
    name: "AI SEO Optimizer",
    description: "Analyze your page for AI search visibility and on-page SEO gaps. Get a prioritized optimization plan.",
    href: "/tools/ai-seo",
    tier: "1 free",
    tierStyle: "bg-primary/10 text-primary border-primary/30",
    features: [
      "AI & LLM visibility analysis",
      "On-page SEO scoring",
      "Content gap identification",
      "Prioritized fix recommendations",
    ],
    badge: null,
  },
  {
    name: "SEO Audit",
    description: "Full technical SEO audit with keyword opportunities, performance insights, and actionable fixes.",
    href: "/tools/seo-audit",
    tier: "Impulse / Starter",
    tierStyle: "bg-accent-blue/10 text-accent-blue border-accent-blue/30",
    features: [
      "Technical SEO analysis",
      "Keyword opportunity mapping",
      "Backlink & authority signals",
      "Prioritized action plan",
    ],
    badge: null,
  },
  {
    name: "Keyword Research",
    description: "Discover high-value keywords with difficulty scores, search volume, and content opportunity mapping.",
    href: "/tools/keyword-research",
    tier: "Impulse / Starter",
    tierStyle: "bg-accent-blue/10 text-accent-blue border-accent-blue/30",
    features: [
      "Seed keyword expansion",
      "Difficulty & volume scoring",
      "Search intent classification",
      "Content gap opportunities",
    ],
    badge: null,
  },
  {
    name: "Landing Page Optimizer",
    description: "Optimize your landing page for conversions, search ranking, and messaging clarity.",
    href: "/tools/landing-page-optimizer",
    tier: "Impulse / Starter",
    tierStyle: "bg-accent-blue/10 text-accent-blue border-accent-blue/30",
    features: [
      "Conversion rate analysis",
      "SEO & keyword alignment",
      "Messaging clarity review",
      "CTA and structure recommendations",
    ],
    badge: null,
  },
  {
    name: "SEO Comprehensive",
    description: "Our most powerful report — technical audit + keyword research + competitor analysis combined.",
    href: "/tools/seo-comprehensive",
    tier: "Starter Only",
    tierStyle: "bg-primary/10 text-primary border-primary/30",
    features: [
      "Full technical SEO audit",
      "Keyword gap & opportunities",
      "Competitor comparison",
      "Complete SEO strategy roadmap",
    ],
    badge: "Most Complete",
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
          className="text-center mb-4"
        >
          <h1 className="text-5xl font-bold mb-4 text-white">
            AI-Powered Business Intelligence Tools
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Get instant competitive and SEO insights — delivered as a full PDF to your inbox. Start free, upgrade for more.
          </p>
        </motion.div>

        {/* Tier legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-12 text-xs"
        >
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/30 font-semibold">1 free</span>
            <span className="text-gray-500">— included on free account</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-accent-blue/10 text-accent-blue border border-accent-blue/30 font-semibold">Impulse / Starter</span>
            <span className="text-gray-500">— credit pack or subscription</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/30 font-semibold">Starter Only</span>
            <span className="text-gray-500">— $20/month subscription</span>
          </div>
        </motion.div>

        {/* Tool grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
              className="relative group"
            >
              {tool.badge && (
                <div className="absolute -top-3 left-6 z-10">
                  <span className="px-3 py-1 bg-gradient-to-r from-primary to-accent-blue text-white text-xs font-bold rounded-full">
                    {tool.badge}
                  </span>
                </div>
              )}

              <div className="relative h-full flex flex-col p-7 rounded-2xl bg-dark-700 border border-primary/20 hover:border-primary/50 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10 flex flex-col flex-grow">
                  {/* Title + tier */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-xl font-bold text-white leading-snug">{tool.name}</h3>
                    <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${tool.tierStyle}`}>
                      {tool.tier}
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm mb-5 leading-relaxed">{tool.description}</p>

                  {/* Features */}
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

                  <Link
                    href={tool.href}
                    className="block text-center px-6 py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 text-sm"
                  >
                    Open Tool →
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center bg-dark-700 rounded-2xl border border-primary/20 p-12"
        >
          <h2 className="text-3xl font-bold mb-4 text-white">Need More Firepower?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Starter gives you unlimited access to all 6 tools for $20/month. Or grab a credit pack for occasional use.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300"
            >
              See Pricing
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary hover:text-white transition-all duration-300"
            >
              Book a Strategy Call
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
