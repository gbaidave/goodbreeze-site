"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-dark">
      {/* Interactive animated gradient mesh background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                circle at ${mousePosition.x}% ${mousePosition.y}%,
                rgba(0, 173, 181, 0.25) 0%,
                transparent 50%
              ),
              radial-gradient(
                circle at ${100 - mousePosition.x}% ${100 - mousePosition.y}%,
                rgba(102, 126, 234, 0.18) 0%,
                transparent 50%
              ),
              radial-gradient(
                circle at 50% 50%,
                rgba(139, 92, 246, 0.15) 0%,
                transparent 70%
              )
            `,
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/4 w-80 h-80 bg-accent-blue/25 rounded-full blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 25, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-accent-purple/20 rounded-full blur-3xl"
          animate={{
            x: [0, 15, 0],
            y: [0, -15, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Tech grid overlay */}
        <div className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 173, 181, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 173, 181, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
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

            {/* Enhanced CTAs with hover effects */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/tools"
                className="group relative px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full overflow-hidden transition-all duration-300 transform hover:scale-105 text-center shadow-lg shadow-primary/30 hover:shadow-primary/60"
              >
                <span className="relative z-10">Try Free Tools</span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent-blue to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              <Link
                href="/contact"
                className="group relative px-8 py-4 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary transition-all duration-300 text-center overflow-hidden"
              >
                <span className="relative z-10 group-hover:text-white transition-colors">Talk to a Human</span>
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
