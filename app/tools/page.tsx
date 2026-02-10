"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { WorkflowIcon, BotIcon, ChartIcon } from "@/components/ui/ModernIcons";

const tools = [
  {
    name: "Sales Analyzer",
    description: "Understand how you stack up against competitors with AI-powered competitive intelligence reports",
    icon: ChartIcon,
    href: "/tools/sales-analyzer",
    status: "available",
    features: [
      "Head-to-head competitor analysis",
      "Top 3 competitors positioning",
      "Competitive market positioning",
      "Delivered in minutes via email"
    ]
  },
  {
    name: "SEO Audit Tool",
    description: "Get a comprehensive technical SEO analysis in under 60 seconds",
    icon: WorkflowIcon,
    href: "/tools/seo-audit",
    status: "coming-soon",
    features: [
      "Technical SEO analysis",
      "On-page optimization tips",
      "Performance recommendations",
      "Keyword opportunity identification"
    ]
  },
  {
    name: "Website Audit Tool",
    description: "Complete website performance review covering speed, UX, and conversion optimization",
    icon: BotIcon,
    href: "/tools/website-audit",
    status: "coming-soon",
    features: [
      "Page speed analysis",
      "UX/conversion review",
      "Mobile responsiveness check",
      "Actionable improvement plan"
    ]
  },
];

export default function ToolsDirectory() {
  return (
    <div className="min-h-screen bg-dark py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Link href="/" className="text-primary hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent-blue bg-clip-text text-transparent">
            Free Business Intelligence Tools
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Try our AI-powered tools to get instant insights into your business, competitors, and growth opportunities—completely free.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className="relative h-full p-8 rounded-2xl bg-dark-700 border border-primary/20 hover:border-primary/50 transition-all duration-300 overflow-hidden">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  {/* Icon */}
                  <tool.icon className="w-16 h-16 mx-auto mb-6" />

                  {/* Status badge */}
                  {tool.status === "coming-soon" && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-accent-purple/20 border border-accent-purple/30 rounded-full text-xs text-accent-purple font-semibold">
                      Coming Soon
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {tool.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-300 mb-6">
                    {tool.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-8">
                    {tool.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-400">
                        <span className="text-primary mr-2">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {tool.status === "available" ? (
                    <Link
                      href={tool.href}
                      className="block text-center px-6 py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105"
                    >
                      Try {tool.name}
                    </Link>
                  ) : (
                    <div className="text-center px-6 py-3 bg-dark-800 border border-primary/20 text-gray-400 font-semibold rounded-full cursor-not-allowed">
                      Coming Soon
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center bg-dark-700 rounded-2xl border border-primary/20 p-12"
        >
          <h2 className="text-3xl font-bold mb-4">Need More Than Tools?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Our tools give you quick wins. But if you're ready to automate your entire operation, let's talk about custom solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105"
            >
              Book a Strategy Call
            </Link>
            <Link
              href="/"
              className="px-8 py-4 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary hover:text-white transition-all duration-300"
            >
              Explore Our Services
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
