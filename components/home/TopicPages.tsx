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

        <ul className="grid md:grid-cols-2 gap-2 max-w-4xl mx-auto list-disc list-inside text-gray-300">
          {topics.map((topic, index) => (
            <li key={index}>
              <Link href={topic.href} className="hover:text-primary transition-colors">
                {topic.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
