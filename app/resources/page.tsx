"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

const resourceCategories = [
  {
    title: "Written Guides",
    description: "In-depth articles on scaling with automation",
    icon: "📄",
    href: "/resources/written-guides",
  },
  {
    title: "Templates & Tools",
    description: "Free resources to get you started",
    icon: "🛠️",
    href: "/resources/templates-tools",
  },
  {
    title: "Case Studies",
    description: "See how we've helped businesses automate and scale",
    icon: "📊",
    href: "/case-studies",
  },
  {
    title: "Video Guides",
    description: "Step-by-step video tutorials on automation and AI",
    icon: "🎥",
    href: "/resources/video-guides",
  },
  {
    title: "Partners",
    description: "Technology partners we work with",
    icon: "🤝",
    href: "/partners",
  },
];

export default function Resources() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setFormStatus('success');
        setFormData({ name: '', email: '' });
      } else {
        setFormStatus('error');
        setErrorMessage(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      setFormStatus('error');
      setErrorMessage('Network error. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-dark py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/" className="text-gray-400 hover:text-primary transition-colors">
            Home
          </Link>
          <span className="text-gray-600 mx-2">/</span>
          <span className="text-gray-300">Resources</span>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6 text-white">
            Resources
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Free guides, templates, and tools to help you understand and implement automation in your business
          </p>
        </motion.div>

        {/* Resource Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {resourceCategories.map((category, index) => (
            <Link key={index} href={category.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-dark-700 rounded-2xl border border-primary/20 p-8 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 h-full flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">{category.icon}</div>
                  <h2 className="text-2xl font-bold text-white group-hover:text-primary transition-colors">
                    {category.title}
                  </h2>
                </div>

                <p className="text-gray-400 mb-4 flex-grow">{category.description}</p>

                <div className="flex items-center gap-2 text-primary group-hover:gap-3 transition-all">
                  <span className="text-sm font-semibold">Explore</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-primary/10 to-accent-purple/10 rounded-2xl border border-primary/30 p-12 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Get Notified When We Publish New Resources</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join our mailing list to receive guides, templates, and automation tips straight to your inbox.
          </p>

          {/* Email Signup Form */}
          {formStatus === 'success' ? (
            <div className="max-w-md mx-auto text-center p-6 bg-primary/10 border border-primary/30 rounded-lg">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-white mb-2">You're subscribed!</h3>
              <p className="text-gray-300">
                Thank you for joining our newsletter. You'll receive valuable automation tips, guides, and exclusive insights to help you scale your business efficiently.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="flex-1 px-4 py-3 rounded-lg bg-dark border border-primary/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                  required
                  disabled={formStatus === 'loading'}
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="flex-1 px-4 py-3 rounded-lg bg-dark border border-primary/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                  required
                  disabled={formStatus === 'loading'}
                />
              </div>
              {formStatus === 'error' && (
                <p className="text-red-400 text-sm text-center">{errorMessage}</p>
              )}
              <button
                type="submit"
                disabled={formStatus === 'loading'}
                className="w-full px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formStatus === 'loading' ? 'Subscribing...' : 'Subscribe to Newsletter'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
