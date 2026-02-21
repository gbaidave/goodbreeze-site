"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="relative py-32 px-6 sm:px-8 lg:px-12 overflow-hidden bg-dark">
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
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-blue rounded-full blur-3xl opacity-15"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
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
          className="relative bg-dark-800 backdrop-blur-xl rounded-3xl px-12 pt-8 pb-12 shadow-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent-blue/15 to-accent-purple/20 rounded-3xl" />
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-center text-white">
              Your First Report Is Free
            </h2>
            <p className="text-2xl text-white/85 mb-10 max-w-2xl mx-auto text-center leading-relaxed">
              Enter your URL and we&apos;ll have a full intelligence report in your inbox in minutes. No account needed. No credit card.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/tools"
                  className="block px-12 py-6 bg-transparent border-2 border-white text-white text-xl font-bold rounded-full shadow-2xl hover:bg-white/10 transition-all duration-300"
                >
                  Run Your First Free Report
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
