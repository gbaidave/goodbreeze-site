"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const resourceCategories = [
  {
    title: "Video Guides",
    description: "Step-by-step video tutorials on automation and AI",
    icon: "🎥",
    items: [
      { title: "How AI Automation Can Save Your Business 20+ Hours/Week", status: "Coming Soon" },
      { title: "The 5 Processes Every SMB Should Automate First", status: "Coming Soon" },
      { title: "How We Use Our Own Automation Tools at Good Breeze AI", status: "Coming Soon" },
    ]
  },
  {
    title: "Written Guides",
    description: "In-depth articles on scaling with automation",
    icon: "📄",
    items: [
      { title: "The Business Owner's Guide to AI Automation (Plain English)", status: "Coming Soon" },
      { title: "5 Signs Your Business is Ready for Automation", status: "Coming Soon" },
      { title: "How to Scale Without Hiring: A Real-World Playbook", status: "Coming Soon" },
    ]
  },
  {
    title: "Templates & Tools",
    description: "Free resources to get you started",
    icon: "🛠️",
    items: [
      { title: "ROI Calculator: How Much Time Could You Save?", status: "Coming Soon" },
      { title: "Automation Readiness Checklist for SMBs", status: "Coming Soon" },
      { title: "Sales Analyzer", status: "Available", href: "/tools/sales-analyzer" },
    ]
  },
  {
    title: "Case Studies",
    description: "See how we've helped businesses automate and scale",
    icon: "📊",
    items: [
      { title: "How Good Breeze AI Automates Its Own Operations", status: "Coming Soon" },
      { title: "CPA Firm: Automated Client Onboarding", status: "Coming Soon" },
      { title: "Consulting Agency: Automated Lead Follow-Up", status: "Coming Soon" },
    ]
  },
];

export default function Resources() {
  return (
    <div className="min-h-screen bg-dark py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/" className="text-gray-400 hover:text-primary transition-colors">
            Home
          </Link>
          <span className="text-gray-600 mx-2">/</span>
          <span className="text-gray-300">Resources</span>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent-blue bg-clip-text text-transparent">
            Resources & Learning Center
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Free guides, templates, and tools to help you understand and implement automation in your business
          </p>
        </motion.div>

        {/* Resource Categories */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {resourceCategories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-dark-700 rounded-2xl border border-primary/20 p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">{category.icon}</div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{category.title}</h2>
                  <p className="text-sm text-gray-400">{category.description}</p>
                </div>
              </div>

              <ul className="space-y-3">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-center justify-between p-3 bg-dark rounded-lg border border-primary/10">
                    <span className="text-gray-300">{item.title}</span>
                    {item.status === "Available" && item.href ? (
                      <Link
                        href={item.href}
                        className="px-4 py-1 bg-gradient-to-r from-primary to-accent-blue text-white text-sm font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all"
                      >
                        Access
                      </Link>
                    ) : (
                      <span className="px-4 py-1 bg-dark-800 border border-primary/20 text-gray-400 text-sm rounded-full">
                        {item.status}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Newsletter Signup (Placeholder) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-primary/10 to-accent-purple/10 rounded-2xl border border-primary/30 p-12 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Get Notified When We Publish New Resources</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join our mailing list to receive guides, templates, and automation tips straight to your inbox.
          </p>
          <div className="max-w-md mx-auto">
            <p className="text-gray-400 text-sm mb-6">
              Newsletter coming soon! For now, try our free tools or book a strategy call.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/tools"
                className="px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105"
              >
                Try Free Tools
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary hover:text-white transition-all duration-300"
              >
                Book Strategy Call
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
