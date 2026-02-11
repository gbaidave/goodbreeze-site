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
            Strategy First. Automation That Sticks.
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            We don't sell cookie cutter solutions. We diagnose first, then build automation guided by proven playbooks.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            className="relative p-8 rounded-2xl bg-gradient-to-br from-primary via-accent-blue to-primary group hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-6 left-6 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent-blue flex items-center justify-center text-white font-bold text-3xl z-10">
              1
            </div>
            <div className="mb-6 mt-20 transform group-hover:scale-110 transition-all duration-300">
              <svg className="w-16 h-16 mx-auto text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-center text-white">Business Review</h3>
            <p className="text-white/90">
              We start by understanding your workflows, not pitching solutions. What's taking time? Where do things break?
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="relative p-8 rounded-2xl bg-gradient-to-br from-accent-blue via-accent-purple to-accent-blue group hover:shadow-lg hover:shadow-accent-blue/30 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-6 left-6 w-16 h-16 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white font-bold text-3xl z-10">
              2
            </div>
            <div className="mb-6 mt-20 transform group-hover:scale-110 transition-all duration-300">
              <svg className="w-16 h-16 mx-auto text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-center text-white">Map Bottlenecks</h3>
            <p className="text-white/90">
              We identify exactly where manual work is killing your efficiency and costing you revenue.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            className="relative p-8 rounded-2xl bg-gradient-to-br from-accent-purple via-primary to-accent-purple group hover:shadow-lg hover:shadow-accent-purple/30 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-6 left-6 w-16 h-16 rounded-full bg-gradient-to-br from-accent-purple to-primary flex items-center justify-center text-white font-bold text-3xl z-10">
              3
            </div>
            <div className="mb-6 mt-20 transform group-hover:scale-110 transition-all duration-300">
              <svg className="w-16 h-16 mx-auto text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-center text-white">Customize Solutions</h3>
            <p className="text-white/90">
              No templates. We build automation tailored to YOUR processes and YOUR data.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            className="relative p-8 rounded-2xl bg-gradient-to-br from-primary via-accent-blue to-accent-purple group hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-6 left-6 w-16 h-16 rounded-full bg-gradient-to-br from-primary via-accent-blue to-accent-purple flex items-center justify-center text-white font-bold text-3xl z-10">
              4
            </div>
            <div className="mb-6 mt-20 transform group-hover:scale-110 transition-all duration-300">
              <svg className="w-16 h-16 mx-auto text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-center text-white">Deploy with Proven Playbooks</h3>
            <p className="text-white/90">
              Launch fast using battle tested frameworks. No endless testing. Just automation that works from day one.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
