"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const topics = [
  {
    title: "AI for Small Business",
    description: "Practical guide to implementing AI without the enterprise budget",
    href: "/topics/ai-for-small-business",
    category: "Getting Started"
  },
  {
    title: "Workflow Automation Guide",
    description: "How to identify and automate your most time-consuming processes",
    href: "/topics/workflow-automation-guide",
    category: "Implementation"
  },
  {
    title: "Sales Process Automation",
    description: "Close more deals by automating follow-ups, proposals, and pipeline management",
    href: "/topics/sales-automation",
    category: "Sales & Growth"
  },
  {
    title: "Competitive Intelligence",
    description: "Stay ahead of competitors with automated market monitoring and analysis",
    href: "/topics/competitive-intelligence",
    category: "Strategy"
  },
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
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Learn More About AI Automation
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Deep dives into the topics that matter for growing your business with automation
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {topics.map((topic, index) => (
            <Link key={index} href={topic.href}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.03 }}
                className="group flex items-center gap-2 p-4 rounded-lg bg-dark-700/50 border border-primary/10 hover:border-primary/40 hover:bg-dark-700 transition-all duration-200"
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
