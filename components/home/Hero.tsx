"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { GridPattern } from "../ui/AbstractShapes";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent-blue/20 to-accent-purple/30" />

      {/* Grid pattern */}
      <GridPattern />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent-blue to-accent-purple bg-clip-text text-transparent leading-tight">
              AI Operations That Actually Scale Your Business
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-8">
              Freemium AI tools + done-for-you automation to eliminate busywork and 10x your output—without hiring a team.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href="/tools/sales-analyzer"
                className="px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105 text-center"
              >
                Try Free Tools
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary hover:text-white transition-all duration-300 text-center"
              >
                Book Strategy Call
              </Link>
            </div>

            <p className="text-gray-400 text-sm">
              Built by automation experts who've scaled businesses across multiple industries
            </p>
          </motion.div>

          {/* Right: Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden border-2 border-primary/30 shadow-2xl shadow-primary/20">
              <Image
                src="/images/hero-image.jpg"
                alt="Business owner overwhelmed with manual work"
                width={800}
                height={600}
                className="w-full h-auto"
                priority
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent-purple/20" />
            </div>

            {/* Floating stat cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="absolute -bottom-6 -left-6 bg-dark-700/90 backdrop-blur-lg border border-primary/30 rounded-xl p-4 shadow-lg"
            >
              <div className="text-3xl font-bold text-primary">20+</div>
              <div className="text-sm text-gray-300">Hours Saved/Week</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="absolute -top-6 -right-6 bg-dark-700/90 backdrop-blur-lg border border-accent-blue/30 rounded-xl p-4 shadow-lg"
            >
              <div className="text-3xl font-bold text-accent-blue">10x</div>
              <div className="text-sm text-gray-300">Output Increase</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
