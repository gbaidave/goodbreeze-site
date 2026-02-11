"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="relative py-32 px-6 sm:px-8 lg:px-12 overflow-hidden">
      {/* Vibrant gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent-blue/30 to-accent-purple/30" />
      <div className="absolute inset-0 bg-dark/70" />

      {/* Multiple animated gradient blobs */}
      <motion.div
        className="absolute top-10 right-10 w-96 h-96 bg-primary rounded-full blur-3xl opacity-30"
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-10 left-10 w-96 h-96 bg-accent-purple rounded-full blur-3xl opacity-25"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, -90, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Content with enhanced visual presence */}
      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-dark/90 to-dark-700/90 backdrop-blur-xl border-2 border-primary/40 rounded-3xl p-12 shadow-2xl shadow-primary/20"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-center bg-gradient-to-r from-primary via-accent-blue to-accent-purple bg-clip-text text-transparent">
            Ready to Scale Without the Headcount?
          </h2>
          <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto text-center leading-relaxed">
            Try our tools free or book a strategy call. No commitment, no technical jargon—just real solutions for real business problems.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/tools/sales-analyzer"
                className="block px-10 py-5 bg-gradient-to-r from-primary via-accent-blue to-primary text-white text-lg font-bold rounded-full shadow-2xl shadow-primary/60 hover:shadow-primary/80 transition-all duration-300"
                style={{ backgroundSize: "200% 100%" }}
              >
                Try Free Tools Now
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/contact"
                className="block px-10 py-5 border-4 border-primary text-primary text-lg font-bold rounded-full hover:bg-primary hover:text-white transition-all duration-300 shadow-xl shadow-primary/40"
              >
                Book Strategy Call
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
