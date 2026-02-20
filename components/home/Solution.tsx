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
            How It Works
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Enter a URL. Get a complete intelligence report in minutes. It&apos;s that simple.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            className="relative p-8 rounded-2xl bg-gradient-to-br from-[#3b82f6] via-[#a855f7] to-[#00adb5] group hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-6 left-6 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent-blue border-4 border-white flex items-center justify-center text-white font-bold text-3xl z-10">
              1
            </div>
            <div className="mb-6 mt-20 transform group-hover:scale-110 transition-all duration-300">
              <svg className="w-16 h-16 mx-auto text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-center text-white">Enter Your URL</h3>
            <p className="text-white/90">
              Paste the page or site you want analyzed. Add your company name if you like. Takes 10 seconds — no account needed to start.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="relative p-8 rounded-2xl bg-gradient-to-br from-[#3b82f6] via-[#a855f7] to-[#3b82f6] group hover:shadow-lg hover:shadow-accent-blue/30 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-6 left-6 w-16 h-16 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple border-4 border-white flex items-center justify-center text-white font-bold text-3xl z-10">
              2
            </div>
            <div className="mb-6 mt-20 transform group-hover:scale-110 transition-all duration-300">
              <svg className="w-16 h-16 mx-auto text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-center text-white">AI Does the Work</h3>
            <p className="text-white/90">
              Our AI analyzes keywords, SEO gaps, competitor positioning, and content opportunities — across dozens of data points in real time.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            className="relative p-8 rounded-2xl bg-gradient-to-br from-[#a855f7] via-[#00adb5] to-[#a855f7] group hover:shadow-lg hover:shadow-accent-purple/30 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-6 left-6 w-16 h-16 rounded-full bg-gradient-to-br from-accent-purple to-primary border-4 border-white flex items-center justify-center text-white font-bold text-3xl z-10">
              3
            </div>
            <div className="mb-6 mt-20 transform group-hover:scale-110 transition-all duration-300">
              <svg className="w-16 h-16 mx-auto text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-center text-white">PDF Lands in Your Inbox</h3>
            <p className="text-white/90">
              A full, actionable report delivered in 2–3 minutes. Open it. Read the specific recommendations. Start winning.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
