"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import TurnstileWidget from "@/components/auth/TurnstileWidget";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (message.trim().length < 10) {
      setError("Message must be at least 10 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const resp = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim(), captchaToken }),
      });
      const data = await resp.json();

      if (!resp.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setCaptchaToken("");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Failed to send. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark py-24 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/" className="text-gray-400 hover:text-primary transition-colors">
            Home
          </Link>
          <span className="text-gray-600 mx-2">/</span>
          <span className="text-gray-300">Contact</span>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-5xl font-bold mb-4 text-white">Contact</h1>
          <p className="text-lg text-gray-300 max-w-lg mx-auto">
            Have a question or want to explore how we can help? Reach out below or book a strategy call.
          </p>
        </motion.div>

        {/* Quick Nav Buttons */}
        <div className="flex gap-3 justify-center mb-12">
          <a
            href="#contact-form"
            className="px-6 py-2.5 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 text-sm"
          >
            Send a Message
          </a>
          <a
            href="#book-call"
            className="px-6 py-2.5 border-2 border-gray-600 text-gray-300 font-semibold rounded-full hover:border-primary hover:text-primary transition-all duration-300 text-sm"
          >
            Book a Strategy Call
          </a>
        </div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          id="contact-form"
          className="bg-dark-700 rounded-2xl border border-primary/20 p-8 mb-12"
        >
          <h2 className="text-2xl font-bold mb-1 text-white">Send Us a Message</h2>
          <p className="text-sm text-gray-400 mb-7">We typically respond within 1 business day.</p>

          {submitted ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4 text-primary">&#10003;</div>
              <h3 className="text-xl font-bold text-primary mb-2">Message Sent</h3>
              <p className="text-gray-300">Thanks for reaching out. We&apos;ll get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-5 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="mb-5">
                <label htmlFor="contact-name" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  maxLength={100}
                  className="w-full px-4 py-3 bg-dark border border-gray-600 rounded-lg text-white placeholder-gray-600 focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="contact-email" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full px-4 py-3 bg-dark border border-gray-600 rounded-lg text-white placeholder-gray-600 focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="contact-message" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help?"
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={5}
                  className="w-full px-4 py-3 bg-dark border border-gray-600 rounded-lg text-white placeholder-gray-600 focus:border-primary focus:outline-none transition-colors resize-y"
                />
              </div>

              <div className="mb-5">
                <TurnstileWidget
                  onVerify={setCaptchaToken}
                  onError={() => setCaptchaToken("")}
                />
              </div>

              <button
                type="submit"
                disabled={submitting || (!!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !captchaToken)}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Sending..." : "Send Message"}
              </button>

              <p className="text-center text-xs text-gray-600 mt-3">
                We respect your privacy. No spam, ever.
              </p>
            </form>
          )}
        </motion.div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-12">
          <div className="flex-1 h-px bg-gray-800" />
          <span className="text-gray-600 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-800" />
        </div>

        {/* Book a Call Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          id="book-call"
          className="bg-dark-700 rounded-2xl border border-primary/20 p-8"
        >
          <h2 className="text-2xl font-bold mb-6">Book Your Strategy Call</h2>

          <div className="mb-8">
            <p className="text-gray-300 mb-4">In this call, we&apos;ll:</p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start">
                <span className="text-primary mr-2">&#10003;</span>
                <span>Review your current manual processes and identify automation opportunities</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">&#10003;</span>
                <span>Show you (in plain English) how AI/automation could save you 20+ hours/week</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">&#10003;</span>
                <span>Create a clear roadmap for implementing automation in your business</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">&#10003;</span>
                <span>Answer all your questions about AI, automation, and scaling</span>
              </li>
            </ul>
          </div>

          <div className="bg-dark rounded-xl border border-primary/20 p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">What to Expect</h3>
            <div className="space-y-3 text-gray-300">
              <p>
                This is a no-pressure conversation. We&apos;ll listen to what you&apos;re dealing with and see if automation can help.
              </p>
              <p>
                Whether you&apos;re just exploring AI for the first time or you&apos;ve tried tools that didn&apos;t work, we&apos;ll meet you where you are and give you honest guidance, even if that means we&apos;re not the right fit right now.
              </p>
            </div>
          </div>

          <div className="text-center">
            <a
              href="https://calendly.com/dave-goodbreeze/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full border-4 border-white hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105"
            >
              Schedule Your Call
            </a>
            <p className="text-sm text-gray-400 mt-4">
              Or try our{" "}
              <Link href="/reports" className="text-primary hover:underline">
                free report
              </Link>{" "}
              first
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
