"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  {
    name: "Marcus Chen",
    role: "Real Estate Broker",
    quote: "Good Breeze AI transformed how we handle leads. Automated follow-ups, instant property alerts, and seamless CRM updates mean we close more deals with less manual work.",
    result: "30% increase in closed deals",
    image: "https://goodbreeze.ai/wp-content/uploads/2026/01/Marcus-Chen.jpg"
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

// Single testimonial card component
const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => (
  <div className="relative bg-dark-700 rounded-2xl border border-primary/20 p-8 hover:border-primary/50 transition-all duration-300 group h-full">
    {/* Quote icon */}
    <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
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
      <p className="text-gray-300 leading-relaxed italic text-base">
        "{testimonial.quote}"
      </p>
    </div>

    {/* Result badge */}
    <div className="mb-6 px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg inline-block">
      <span className="text-sm font-semibold text-primary">{testimonial.result}</span>
    </div>

    {/* Author with photo */}
    <div className="relative z-10 flex items-center gap-3">
      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary/30">
        <Image
          src={testimonial.image}
          alt={testimonial.name}
          width={48}
          height={48}
          className="object-cover"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect fill='%2300adb5' width='48' height='48'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='20' font-family='sans-serif'%3E${testimonial.name[0]}%3C/text%3E%3C/svg%3E`;
          }}
        />
      </div>
      <div>
        <p className="font-semibold text-white text-base">{testimonial.name}</p>
        <p className="text-sm text-gray-400">{testimonial.role}</p>
      </div>
    </div>
  </div>
);

export default function SocialProof() {
  const [visibleCards, setVisibleCards] = useState([0, 1, 2]);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setVisibleCards((prev) => {
        const newCards = [...prev];
        newCards.shift(); // Remove first card
        newCards.push((newCards[newCards.length - 1] + 1) % testimonials.length); // Add new card at end
        return newCards;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    const currentFirst = visibleCards[0];
    if (index === currentFirst) return;

    setDirection(index > currentFirst ? 1 : -1);
    setVisibleCards([index, (index + 1) % testimonials.length, (index + 2) % testimonials.length]);
  };

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

        {/* Carousel Container - 3 Cards Display with single-card transitions */}
        <div className="relative max-w-7xl mx-auto mb-12 overflow-hidden">
          <div className="grid md:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {visibleCards.map((cardIndex) => (
                <motion.div
                  key={cardIndex}
                  layout
                  initial={{ opacity: 0, x: direction > 0 ? 300 : -300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -300 : 300 }}
                  transition={{ duration: 0.5 }}
                >
                  <TestimonialCard testimonial={testimonials[cardIndex]} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Navigation Dots - Active indicator is now white */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === visibleCards[0]
                    ? "bg-white w-8"
                    : "bg-gray-600 hover:bg-gray-500"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* CTA - Made more prominent with visible gradient background */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative mt-20 text-center bg-gradient-to-br from-accent-blue/70 via-accent-purple/60 to-primary/70 rounded-3xl p-12 overflow-hidden"
        >
          {/* Animated gradient blobs */}
          <motion.div
            className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-3xl opacity-20"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-64 h-64 bg-accent-purple rounded-full blur-3xl opacity-15"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div className="relative z-10">
            <h3 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-accent-blue to-accent-purple bg-clip-text text-transparent">
              Ready to See Similar Results in Your Business?
            </h3>
            <p className="text-2xl text-white mb-10 max-w-2xl mx-auto leading-relaxed">
              Book a strategy call and we'll show you exactly how automation can transform your operations
            </p>
            <motion.a
              href="/contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block px-12 py-6 bg-gradient-to-r from-primary via-accent-blue to-primary text-white text-xl font-bold rounded-full shadow-2xl shadow-primary/60 hover:shadow-primary/80 transition-all duration-300"
              style={{ backgroundSize: "200% 100%" }}
            >
              Book Your Strategy Call
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
