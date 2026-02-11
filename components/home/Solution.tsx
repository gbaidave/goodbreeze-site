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
            className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary group hover:border-primary/80 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
          >
            <div className="mb-6 transform group-hover:scale-110 transition-all duration-300">
              <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-primary to-accent-blue flex items-center justify-center text-white font-bold text-2xl mb-4">
                1
              </div>
              <svg className="w-16 h-16 mx-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-center">Business Review</h3>
            <p className="text-gray-300">
              We start by understanding your workflows, not pitching solutions. What's taking time? Where do things break?
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-8 rounded-2xl bg-gradient-to-br from-accent-blue/10 to-transparent border border-accent-blue group hover:border-accent-blue/80 hover:shadow-lg hover:shadow-accent-blue/20 transition-all duration-300"
          >
            <div className="mb-6 transform group-hover:scale-110 transition-all duration-300">
              <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white font-bold text-2xl mb-4">
                2
              </div>
              <svg className="w-16 h-16 mx-auto text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-center">Map Bottlenecks</h3>
            <p className="text-gray-300">
              We identify exactly where manual work is killing your efficiency and costing you revenue.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 rounded-2xl bg-gradient-to-br from-accent-purple/10 to-transparent border border-accent-purple group hover:border-accent-purple/80 hover:shadow-lg hover:shadow-accent-purple/20 transition-all duration-300"
          >
            <div className="mb-6 transform group-hover:scale-110 transition-all duration-300">
              <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-accent-purple to-primary flex items-center justify-center text-white font-bold text-2xl mb-4">
                3
              </div>
              <svg className="w-16 h-16 mx-auto text-accent-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-center">Customize Solutions</h3>
            <p className="text-gray-300">
              No templates. We build automation tailored to YOUR processes and YOUR data.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-accent-blue/10 to-accent-purple/10 border-2 border-primary group hover:border-accent-blue hover:shadow-lg hover:shadow-accent-blue/20 transition-all duration-300"
          >
            <div className="mb-6 transform group-hover:scale-110 transition-all duration-300">
              <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-primary via-accent-blue to-accent-purple flex items-center justify-center text-white font-bold text-2xl mb-4">
                4
              </div>
              <svg className="w-16 h-16 mx-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-center">Deploy with Proven Playbooks</h3>
            <p className="text-gray-300">
              Launch fast using battle tested frameworks. No endless testing. Just automation that works from day one.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
