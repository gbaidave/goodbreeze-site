"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const tools = [
  {
    name: "Sales Analyzer",
    description: "AI-Powered Competitive Sales Intelligence",
    detail: "Understand how you stack up against competitors quickly",
    href: "/sales-analyzer",
    gradient: "from-primary to-accent-blue",
    iconPath: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    name: "SEO Analyzer",
    description: "Professional SEO Audit Report",
    detail: "Get a comprehensive SEO audit PDF with actionable recommendations",
    href: "/seo-audit",
    gradient: "from-accent-blue to-accent-purple",
    iconPath: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  },
  {
    name: "Website Analyzer",
    description: "Complete Website Performance Review",
    detail: "Uncover speed, UX, and conversion issues",
    href: "/website-audit",
    gradient: "from-accent-purple to-primary",
    comingSoon: true,
    iconPath: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
];

export default function Tools() {
  return (
    <section className="py-24 px-6 sm:px-8 lg:px-12 bg-dark-800 relative overflow-hidden">
      {/* Enhanced background decorations */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Free Analyzers That Solve Real Problems
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            No credit card required. Get actionable insights right now.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {tools.map((tool, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative"
            >
              <Link href={tool.href} className={tool.comingSoon ? "pointer-events-none" : ""}>
                <div className="relative p-8 rounded-2xl bg-dark-700 border border-primary/20 hover:border-primary hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 overflow-hidden h-full flex flex-col">
                  {/* Animated gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                  {/* Large animated icon */}
                  <div className="relative z-10 mb-6">
                    <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300`}>
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={tool.iconPath} />
                      </svg>
                    </div>
                  </div>

                  <div className="relative z-10 flex-1 flex flex-col">
                    <h3 className="text-2xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300 text-center">{tool.name}</h3>
                    <p className="text-primary font-medium mb-4 text-lg">{tool.description}</p>
                    <p className="text-gray-400 mb-6 flex-1">{tool.detail}</p>

                    {/* Prominent CTA Button - Centered */}
                    <div className="flex justify-center">
                      <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                        tool.comingSoon
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                          : `bg-gradient-to-r ${tool.gradient} text-white group-hover:shadow-lg group-hover:shadow-primary/50 transform group-hover:scale-105`
                      }`}>
                        <span>{tool.comingSoon ? "Coming Soon" : "Try Free"}</span>
                        {!tool.comingSoon && (
                          <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Corner accent */}
                  <div className={`absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br ${tool.gradient} rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
