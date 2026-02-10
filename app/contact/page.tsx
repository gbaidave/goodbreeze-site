"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Contact() {
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
            Let's Talk
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Book a 30-minute strategy call to discuss how automation can help your business scale.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-700 rounded-2xl border border-primary/20 p-8"
        >
          <h2 className="text-2xl font-bold mb-6">Book Your Strategy Call</h2>

          <div className="mb-8">
            <p className="text-gray-300 mb-4">
              In this call, we'll:
            </p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Review your current manual processes and identify automation opportunities</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Show you (in plain English) how AI/automation could save you 20+ hours/week</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Create a clear roadmap for implementing automation in your business</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Answer all your questions about AI, automation, and scaling</span>
              </li>
            </ul>
          </div>

          <div className="bg-dark rounded-xl border border-primary/20 p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">What Makes You a Good Fit?</h3>
            <div className="space-y-3 text-gray-300">
              <p>
                <strong className="text-primary">✓ Project Budget:</strong> $5,000 - $50,000
              </p>
              <p>
                <strong className="text-primary">✓ Annual Revenue:</strong> $250,000+
              </p>
              <p>
                <strong className="text-primary">✓ Decision Maker:</strong> You can make purchasing decisions or have direct access to who can
              </p>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              If you're outside these ranges, no worries! Try our free tools first and we can talk when timing is right.
            </p>
          </div>

          <div className="text-center">
            <a
              href={process.env.NEXT_PUBLIC_CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105"
            >
              Schedule Your Call
            </a>
            <p className="text-sm text-gray-400 mt-4">
              Or try our <Link href="/tools/sales-analyzer" className="text-primary hover:underline">free tools</Link> first
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
