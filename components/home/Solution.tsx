"use client";

import { motion } from "framer-motion";

export default function Solution() {
  return (
    <section className="py-24 px-6 sm:px-8 lg:px-12 bg-dark relative overflow-hidden">
      {/* Background gradient decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            How We're Different
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            We bridge the gap between AI hype and real business results
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary group hover:border-primary/80 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent-blue flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                1
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-4">Start Free</h3>
            <p className="text-gray-300">
              Try our AI-powered tools (Sales Analyzer, SEO/Website Audits) with no commitment. See the value before spending a dime.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-8 rounded-2xl bg-gradient-to-br from-accent-blue/10 to-transparent border border-accent-blue group hover:border-accent-blue/80 hover:shadow-lg hover:shadow-accent-blue/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                2
              </div>
              <div className="w-10 h-10 rounded-lg bg-accent-blue/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-4">Upgrade to Pro</h3>
            <p className="text-gray-300">
              Get advanced features, unlimited access, and priority support. Scale your insights without limits.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 rounded-2xl bg-gradient-to-br from-accent-purple/10 to-transparent border border-accent-purple group hover:border-accent-purple/80 hover:shadow-lg hover:shadow-accent-purple/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-purple to-primary flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                3
              </div>
              <div className="w-10 h-10 rounded-lg bg-accent-purple/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-accent-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-4">Go Custom</h3>
            <p className="text-gray-300">
              Need more? We'll build automated workflows, AI agents, and competitive intelligence systems tailored to your business.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
