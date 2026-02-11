"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { GridPattern } from "../ui/AbstractShapes";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-dark">
      {/* Custom algorithmic flows background */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-bg.png"
          alt=""
          fill
          className="object-cover opacity-70"
          priority
          quality={100}
        />
        {/* Subtle overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark/50 via-transparent to-dark/70" />

        {/* Additional animated subtle glow */}
        <motion.div
          className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Problem-focused headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
              Tired of Watching Your Team
              <span className="block bg-gradient-to-r from-primary via-accent-blue to-accent-purple bg-clip-text text-transparent">
                Drown in Busywork?
              </span>
            </h1>

            {/* Clear outcome promise */}
            <p className="text-xl sm:text-2xl text-gray-300 mb-8 leading-relaxed">
              We help SMBs reclaim 20+ hours per week by automating the repetitive work that's keeping you from growing—without the tech headaches or massive hiring costs.
            </p>

            {/* Specific pain points */}
            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-300">Stop losing leads because follow-ups slip through the cracks</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-300">Free your team from mind-numbing data entry and manual processes</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-300">Scale your revenue without scaling your headcount (or headaches)</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/tools"
                className="px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105 text-center"
              >
                Try Free Tools
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary hover:text-white transition-all duration-300 text-center"
              >
                Talk to a Human
              </Link>
            </div>

            {/* Trust indicator */}
            <p className="text-gray-400 text-sm">
              No tech jargon. No empty promises. Just practical automation that actually works.
            </p>
          </motion.div>

          {/* Right: Hero Image with results */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative group"
          >
            {/* Animated glow effect behind image */}
            <motion.div
              className="absolute -inset-4 bg-gradient-to-r from-primary via-accent-blue to-accent-purple rounded-2xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <div className="relative rounded-2xl overflow-hidden border-2 border-primary/30 shadow-2xl shadow-primary/20 group-hover:border-primary/50 transition-all duration-500">
              <Image
                src="/images/hero-image.jpg"
                alt="Business owner overwhelmed with manual work"
                width={800}
                height={600}
                className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent-purple/10 group-hover:from-primary/20 group-hover:to-accent-purple/20 transition-all duration-500" />
            </div>

            {/* Results cards with animated glow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="absolute -bottom-4 -left-4 bg-dark-700/95 backdrop-blur-lg border border-primary/30 rounded-xl p-5 shadow-lg hover:shadow-primary/50 hover:scale-110 transition-all duration-300 cursor-pointer group/card"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover/card:from-primary/10 group-hover/card:to-transparent rounded-xl transition-all duration-300" />
              <div className="relative z-10">
                <div className="text-3xl font-bold text-primary mb-1">20+ hrs</div>
                <div className="text-sm text-gray-300">Reclaimed per week</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="absolute -top-4 -right-4 bg-dark-700/95 backdrop-blur-lg border border-accent-blue/30 rounded-xl p-5 shadow-lg hover:shadow-accent-blue/50 hover:scale-110 transition-all duration-300 cursor-pointer group/card"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/0 to-accent-blue/0 group-hover/card:from-accent-blue/10 group-hover/card:to-transparent rounded-xl transition-all duration-300" />
              <div className="relative z-10">
                <div className="text-3xl font-bold text-accent-blue mb-1">$0</div>
                <div className="text-sm text-gray-300">New hires needed</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
