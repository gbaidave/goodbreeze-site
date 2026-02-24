"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function About() {
  return (
    <div className="min-h-screen bg-dark py-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/" className="text-gray-400 hover:text-primary transition-colors">
            Home
          </Link>
          <span className="text-gray-600 mx-2">/</span>
          <span className="text-gray-300">About</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6 text-white">
            About Good Breeze AI
          </h1>
          <p className="text-xl text-gray-300">
            We're the bridge between AI hype and real business results
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-12"
        >
          <section>
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-300 leading-relaxed text-lg">
              Most SMBs are drowning in manual work, paying too much to hire, and confused about how AI actually helps. We fix that. We build freemium tools and custom automation that actually works—without the jargon, without the confusion, without the wasted money.
            </p>
          </section>

          <section className="bg-dark-700 rounded-2xl border border-primary/20 p-8">
            <h2 className="text-3xl font-bold mb-6">Meet Your Automation Partner</h2>
            <div className="grid md:grid-cols-3 gap-8 items-start">
              <div className="md:col-span-1">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-primary/30">
                  <Image
                    src="/images/dave-silverstein-good-breeze-ai-founder.webp"
                    alt="Dave Silverstein, founder of Good Breeze AI"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-4 text-gray-300 leading-relaxed text-lg">
                <p>
                  <strong className="text-white">Dave Silverstein</strong><br />
                  <span className="text-primary">Founder: Good Breeze AI</span>
                </p>
                <p>
                  Hi, I'm Dave. I'm not building theoretical solutions. Every system Good Breeze AI offers is battle tested in real operations first.
                </p>
                <p>
                  As a business operator who mastered technology out of necessity, I built automation tools when existing solutions fell short for real businesses. When I realized other SMBs were struggling with the same problems, Good Breeze AI was born.
                </p>
                <p>
                  The competitive analyzer? I use it daily for client calls. The proposal system? It powers my entire sales process. The workflow automation? It runs my whole operation. If a system doesn't deliver value internally, I won't offer it to clients.
                </p>
                <div className="border-l-4 border-primary pl-6 py-2 mt-6">
                  <p className="italic">
                    "I build systems I wish existed when I was drowning in manual work. It saves me time and makes me money, it'll do the same for you."
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-br from-primary/10 to-accent-purple/10 rounded-2xl border border-primary/30 p-8">
            <h2 className="text-3xl font-bold mb-4">A Growing Team of Automation Experts</h2>
            <p className="text-gray-300 leading-relaxed text-lg mb-4">
              While David leads strategy and client relationships, Good Breeze AI is supported by a network of specialized automation engineers, AI developers, and business analysts. Our team approach ensures you get expert-level support across every aspect of your automation journey.
            </p>
            <p className="text-gray-300 leading-relaxed text-lg">
              We're not a giant agency—we're a focused team that treats your business like our own. When you work with us, you get the attention and care of a small team with the expertise and capabilities of a much larger one.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">Why We're Different</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-dark-700 rounded-xl border border-primary/20 hover:border-primary/50 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent-blue flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-primary">Try Before You Buy</h3>
                    <p className="text-gray-300">
                      Our freemium tools let you see the value instantly. No sales calls, no demos—just real results.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-dark-700 rounded-xl border border-primary/20 hover:border-primary/50 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-primary">Plain English</h3>
                    <p className="text-gray-300">
                      We don't assume you know AI. We explain everything like you're a business owner (because you are).
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-dark-700 rounded-xl border border-primary/20 hover:border-primary/50 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-purple to-primary flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-primary">Business-First</h3>
                    <p className="text-gray-300">
                      We measure success by hours saved and revenue grown—not by how "cool" the tech is.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-dark-700 rounded-xl border border-primary/20 hover:border-primary/50 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary via-accent-blue to-accent-purple flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-primary">We Use Our Own Stack</h3>
                    <p className="text-gray-300">
                      Everything we build for clients, we use ourselves. If it doesn't work for us, we won't sell it to you.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="text-center pt-12 border-t border-gray-700">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-gray-300 mb-8">
              Try our tools free or book a strategy call. No pressure, no jargon—just real solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/tools/competitive-analyzer"
                className="px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300"
              >
                Try Free Reports
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary hover:text-white transition-all duration-300"
              >
                Book Strategy Call
              </Link>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
