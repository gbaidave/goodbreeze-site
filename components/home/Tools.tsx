"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const tools = [
  {
    name: "Sales Analyzer",
    description: "AI-Powered Competitive Sales Intelligence",
    detail: "Understand how you stack up against competitors in seconds",
    href: "/tools/sales-analyzer",
    gradient: "from-primary to-accent-blue",
  },
  {
    name: "SEO Audit",
    description: "Instant Technical SEO Analysis",
    detail: "Get a comprehensive SEO report in under 60 seconds",
    href: "/tools/seo-audit",
    gradient: "from-accent-blue to-accent-purple",
    comingSoon: true,
  },
  {
    name: "Website Audit",
    description: "Complete Website Performance Review",
    detail: "Uncover speed, UX, and conversion issues instantly",
    href: "/tools/website-audit",
    gradient: "from-accent-purple to-primary",
    comingSoon: true,
  },
];

export default function Tools() {
  return (
    <section className="py-24 px-6 sm:px-8 lg:px-12 bg-dark-800">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Try Our Tools Free
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            No credit card required. See the value instantly.
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
              className="group relative p-8 rounded-2xl bg-dark-700 border border-primary/20 hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
            >
              {tool.comingSoon && (
                <span className="absolute top-4 right-4 px-3 py-1 bg-accent-purple text-white text-xs font-semibold rounded-full">
                  Coming Soon
                </span>
              )}
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${tool.gradient} mb-6`} />
              <h3 className="text-2xl font-semibold mb-2">{tool.name}</h3>
              <p className="text-primary font-medium mb-4">{tool.description}</p>
              <p className="text-gray-400 mb-6">{tool.detail}</p>
              <Link
                href={tool.href}
                className={`inline-block px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  tool.comingSoon
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : `bg-gradient-to-r ${tool.gradient} text-white hover:shadow-lg hover:shadow-primary/50 transform hover:scale-105`
                }`}
                onClick={tool.comingSoon ? (e) => e.preventDefault() : undefined}
              >
                {tool.comingSoon ? "Coming Soon" : "Try Free"}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
