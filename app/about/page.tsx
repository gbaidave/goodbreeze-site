"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function About() {
  return (
    <div className="min-h-screen bg-dark py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Link href="/" className="text-primary hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent-blue bg-clip-text text-transparent">
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
            <h2 className="text-3xl font-bold mb-6">Meet David Silverstein</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed text-lg">
              <p>
                <strong className="text-white">Founder & CEO</strong> of Good Breeze AI
              </p>
              <p>
                David isn't your typical tech founder. He's a <strong className="text-primary">Certified Product Manager (CPM)</strong>, <strong className="text-primary">Certified Scrum Product Owner (CSPO)</strong>, and <strong className="text-primary">Certified ScrumMaster (CSM)</strong> who's built, scaled, and exited multiple businesses across gaming, ecommerce, and web development.
              </p>
              <p>
                He's not someone who learned business after learning code—he's a <strong className="text-primary">business operator who happens to be technical</strong>. That's the difference. He speaks your language, understands your problems, and knows how to translate AI/automation into actual ROI.
              </p>
              <p>
                David's written extensively on product management, scaling teams, and leveraging AI for real business outcomes. He's not here to sell you buzzwords—he's here to help you grow without the growing pains.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">Why We're Different</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-dark-700 rounded-xl border border-primary/20">
                <h3 className="text-xl font-semibold mb-3 text-primary">Try Before You Buy</h3>
                <p className="text-gray-300">
                  Our freemium tools let you see the value instantly. No sales calls, no demos—just real results.
                </p>
              </div>
              <div className="p-6 bg-dark-700 rounded-xl border border-primary/20">
                <h3 className="text-xl font-semibold mb-3 text-primary">Plain English</h3>
                <p className="text-gray-300">
                  We don't assume you know AI. We explain everything like you're a business owner (because you are).
                </p>
              </div>
              <div className="p-6 bg-dark-700 rounded-xl border border-primary/20">
                <h3 className="text-xl font-semibold mb-3 text-primary">Business-First</h3>
                <p className="text-gray-300">
                  We measure success by hours saved and revenue grown—not by how "cool" the tech is.
                </p>
              </div>
              <div className="p-6 bg-dark-700 rounded-xl border border-primary/20">
                <h3 className="text-xl font-semibold mb-3 text-primary">We Use Our Own Stack</h3>
                <p className="text-gray-300">
                  Everything we build for clients, we use ourselves. If it doesn't work for us, we won't sell it to you.
                </p>
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
                href="/tools/sales-analyzer"
                className="px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300"
              >
                Try Free Tools
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
