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

        <div className="grid md:grid-cols-2 gap-6">
          {topics.map((topic, index) => (
            <Link key={index} href={topic.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group p-8 rounded-2xl bg-dark-700 border border-primary/20 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-xs text-primary font-semibold">
                    {topic.category}
                  </span>
                  <svg className="w-6 h-6 text-primary transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                  {topic.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {topic.description}
                </p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
