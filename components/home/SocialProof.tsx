"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const testimonials = [
  {
    name: "Alana Shaw",
    role: "Consultant",
    quote: "Call Dave at Good Breeze AI. He built us a simple flow that handles intake, auto-fills proposals, and keeps follow-ups on track so nothing slips.",
    result: "Streamlined intake & proposals",
    image: "https://goodbreeze.ai/wp-content/uploads/2025/11/Alana-Shaw.jpg"
  },
  {
    name: "Julia Lawson",
    role: "Attorney",
    quote: "Good Breeze AI fixed our intake and follow-up mess overnight. Their system books consults, tracks next steps, and even handles after-hours calls so we don't lose leads.",
    result: "Zero missed leads",
    image: "https://goodbreeze.ai/wp-content/uploads/2026/01/Julia-Lawson.jpg"
  },
  {
    name: "Rafael Moreno",
    role: "CPA",
    quote: "I'd recommend Dave in a heartbeat. His automations collect client documents, remind people nicely, and flag exceptions so month-end actually ends.",
    result: "Month-end close in half the time",
    image: "https://goodbreeze.ai/wp-content/uploads/2026/01/Rafael-Moreno.jpg"
  },
];

const StarRating = () => (
  <div className="flex gap-1 mb-4">
    {[...Array(5)].map((_, i) => (
      <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

export default function SocialProof() {
  return (
    <section className="py-24 px-6 sm:px-8 lg:px-12 bg-dark-800">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Real Results from Real Businesses
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            See how we've helped businesses like yours reclaim time and eliminate busywork
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative bg-dark-700 rounded-2xl border border-primary/20 p-8 hover:border-primary/50 transition-all duration-300 group"
            >
              {/* Quote icon */}
              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
              </div>

              {/* Star Rating */}
              <div className="relative z-10 mb-4">
                <StarRating />
              </div>

              {/* Quote */}
              <div className="relative z-10 mb-6">
                <p className="text-gray-300 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
              </div>

              {/* Result badge */}
              <div className="mb-6 px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg inline-block">
                <span className="text-sm font-semibold text-primary">{testimonial.result}</span>
              </div>

              {/* Author with photo */}
              <div className="relative z-10 flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary/30">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA - Made more prominent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 text-center bg-gradient-to-br from-primary/10 to-accent-purple/10 rounded-3xl border-2 border-primary/30 p-12"
        >
          <h3 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-accent-blue to-accent-purple bg-clip-text text-transparent">
            Ready to See Similar Results in Your Business?
          </h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Book a strategy call and we'll show you exactly how automation can transform your operations
          </p>
          <a
            href="/contact"
            className="inline-block px-10 py-5 bg-gradient-to-r from-primary to-accent-blue text-white text-lg font-bold rounded-full hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105"
          >
            Book Your Strategy Call
          </a>
        </motion.div>
      </div>
    </section>
  );
}
