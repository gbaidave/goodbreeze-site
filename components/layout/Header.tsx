"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-lg border-b border-gray-800">
      <nav className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            Good Breeze AI
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/about" className="text-gray-300 hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/tools/sales-analyzer" className="text-gray-300 hover:text-primary transition-colors">
              Tools
            </Link>
            <Link href="/contact" className="px-6 py-2 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300">
              Book a Call
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden pt-4 pb-2 space-y-4"
          >
            <Link href="/about" className="block text-gray-300 hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/tools/sales-analyzer" className="block text-gray-300 hover:text-primary transition-colors">
              Tools
            </Link>
            <Link href="/contact" className="block text-center px-6 py-2 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full">
              Book a Call
            </Link>
          </motion.div>
        )}
      </nav>
    </header>
  );
}
