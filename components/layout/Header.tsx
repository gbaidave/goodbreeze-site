"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserMenu } from "@/components/auth/UserMenu";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { CreditsPill } from "@/components/layout/CreditsPill";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  const services = [
    { name: "Workflow Automation", href: "/services/workflow-automation" },
    { name: "AI Agent Implementation", href: "/services/ai-agents" },
    { name: "Competitive Intelligence", href: "/services/competitive-intelligence" },
    { name: "Process Optimization", href: "/services/process-optimization" },
    { name: "Content Management & Delivery", href: "/services/content-management" },
    { name: "Custom Solutions", href: "/services/custom-solutions" },
  ];

  const resourceLinks = [
    { name: "Written Guides", href: "/resources/written-guides" },
    { name: "Templates & Tools", href: "/resources/templates-tools" },
    { name: "Case Studies", href: "/case-studies" },
    { name: "Video Guides", href: "/resources/video-guides" },
    { name: "Partners", href: "/partners" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-lg border-b border-gray-800">
      <nav className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/good-breeze-ai-logo.png"
              alt="Good Breeze AI"
              width={150}
              height={50}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Services Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button className="text-gray-300 hover:text-primary transition-colors flex items-center gap-1">
                Services
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-[#2a2a2a] border-2 border-primary/50 rounded-lg shadow-2xl shadow-primary/30 overflow-hidden"
                  >
                    {services.map((service, index) => (
                      <Link
                        key={index}
                        href={service.href}
                        className="block px-4 py-3 text-white font-medium hover:bg-primary/30 hover:text-white transition-all duration-200"
                      >
                        {service.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/tools" className="text-gray-300 hover:text-primary transition-colors">
              Reports
            </Link>

            {/* Resources Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setResourcesOpen(true)}
              onMouseLeave={() => setResourcesOpen(false)}
            >
              <Link href="/resources" className="text-gray-300 hover:text-primary transition-colors flex items-center gap-1">
                Resources
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>

              <AnimatePresence>
                {resourcesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-[#2a2a2a] border-2 border-primary/50 rounded-lg shadow-2xl shadow-primary/30 overflow-hidden"
                  >
                    {resourceLinks.map((link, index) => (
                      <Link
                        key={index}
                        href={link.href}
                        className="block px-4 py-3 text-white font-medium hover:bg-primary/30 hover:text-white transition-all duration-200"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/about" className="text-gray-300 hover:text-primary transition-colors">
              About
            </Link>

            <a href="https://calendly.com/dave-goodbreeze/30min" target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300">
              Book a Call
            </a>

            <NotificationBell />
            <CreditsPill />
            <UserMenu />

          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
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
            {/* Mobile Services */}
            <div>
              <div className="text-gray-400 text-sm font-semibold mb-2">Services</div>
              {services.map((service, index) => (
                <Link
                  key={index}
                  href={service.href}
                  className="block pl-4 py-2 text-gray-300 hover:text-primary transition-colors"
                >
                  {service.name}
                </Link>
              ))}
            </div>

            <Link href="/tools" className="block text-gray-300 hover:text-primary transition-colors">
              Reports
            </Link>

            {/* Mobile Resources */}
            <div>
              <div className="text-gray-400 text-sm font-semibold mb-2">Resources</div>
              {resourceLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="block pl-4 py-2 text-gray-300 hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <Link href="/about" className="block text-gray-300 hover:text-primary transition-colors">
              About
            </Link>

            <a href="https://calendly.com/dave-goodbreeze/30min" target="_blank" rel="noopener noreferrer" className="block text-center px-6 py-2 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full">
              Book a Call
            </a>

            <div className="pt-2 flex items-center gap-3">
              <NotificationBell />
              <CreditsPill />
              <UserMenu />
            </div>

          </motion.div>
        )}
      </nav>
    </header>
  );
}
