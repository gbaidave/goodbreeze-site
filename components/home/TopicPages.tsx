"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const topics = [
  { title: "How to Automate Customer Follow-Ups", href: "/topics/automate-customer-followups" },
  { title: "Streamlining Proposal Generation for SMBs", href: "/topics/streamline-proposal-generation" },
  { title: "Reducing Manual Data Entry in Your Business", href: "/topics/reduce-manual-data-entry" },
  { title: "Automating Client Onboarding Workflows", href: "/topics/automate-client-onboarding" },
  { title: "AI-Powered Lead Qualification Strategies", href: "/topics/ai-lead-qualification" },
  { title: "Building Efficient Email Automation Systems", href: "/topics/email-automation-systems" },
  { title: "Leveraging AI for Market Research", href: "/topics/ai-market-research" },
  { title: "Automating Invoice Processing and Payments", href: "/topics/automate-invoice-processing" },
  { title: "Creating Self-Service Customer Portals", href: "/topics/self-service-customer-portals" },
  { title: "Using AI to Improve Sales Forecasting", href: "/topics/ai-sales-forecasting" },
];

export default function TopicPages() {
  return (
    <section className="py-24 px-6 sm:px-8 lg:px-12 bg-dark-800 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl font-bold mb-2 text-white">
            Learn More
          </h3>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-3 max-w-4xl mx-auto">
          {topics.map((topic, index) => (
            <Link key={index} href={topic.href}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.03 }}
                className="group flex items-center gap-2 p-3 rounded-lg bg-dark-700/50 border border-primary/10 hover:border-primary/40 hover:bg-dark-700 transition-all duration-200"
              >
                <svg className="w-4 h-4 text-primary flex-shrink-0 transform group-hover:translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-300 group-hover:text-primary transition-colors duration-200 text-sm">
                  {topic.title}
                </span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
