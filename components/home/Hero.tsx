"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FloatingCircles, GridPattern } from "../ui/AbstractShapes";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent-blue to-accent-purple opacity-20" />
      <div className="absolute inset-0 bg-dark/90" />

      {/* Grid pattern */}
      <GridPattern />

      {/* Floating gradient blobs */}
      <FloatingCircles />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent-blue to-accent-purple bg-clip-text text-transparent">
            AI Operations That Actually Scale Your Business
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
            Freemium AI tools + done-for-you automation to eliminate busywork and 10x your output—without hiring a team.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
        >
          <Link
            href="/tools/sales-analyzer"
            className="px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105"
          >
            Try Free Tools
          </Link>
          <Link
            href="/contact"
            className="px-8 py-4 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary hover:text-white transition-all duration-300"
          >
            Book Strategy Call
          </Link>
        </motion.div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-gray-400 text-sm"
        >
          <p>Built by automation experts who've scaled businesses across multiple industries</p>
        </motion.div>
      </div>
    </section>
  );
}
