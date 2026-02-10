"use client";

import { motion } from "framer-motion";

export default function Solution() {
  return (
    <section className="py-24 px-6 sm:px-8 lg:px-12 bg-dark">
      <div className="max-w-7xl mx-auto">
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
            className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary"
          >
            <div className="text-3xl font-bold text-primary mb-4">1</div>
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
            className="p-8 rounded-2xl bg-gradient-to-br from-accent-blue/10 to-transparent border border-accent-blue"
          >
            <div className="text-3xl font-bold text-accent-blue mb-4">2</div>
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
            className="p-8 rounded-2xl bg-gradient-to-br from-accent-purple/10 to-transparent border border-accent-purple"
          >
            <div className="text-3xl font-bold text-accent-purple mb-4">3</div>
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
