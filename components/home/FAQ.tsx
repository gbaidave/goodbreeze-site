"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const faqs = [
  {
    question: "Do I need SEO experience to use this?",
    answer: "No. Reports are written in plain English with specific action items — not raw data dumps. If you can read a summary and follow a to-do list, you can act on these reports immediately.",
    featured: true,
  },
  {
    question: "How is this different from Semrush or Ahrefs?",
    answer: "Those tools give you raw data and expect you to figure out what it means and what to do next. Good Breeze AI delivers an AI-curated PDF report with specific, prioritized recommendations — no learning curve, no hours of analysis required.",
  },
  {
    question: "How quickly will I see results?",
    answer: "Your report lands in your inbox in 2–3 minutes. Most users identify their first quick wins within the first read — and see measurable improvements within 1–2 weeks of acting on the recommendations.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 px-6 sm:px-8 lg:px-12 bg-dark relative overflow-hidden">
      {/* Background gradient decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Common Questions
          </h2>
          <p className="text-xl text-gray-400">
            Here&apos;s what people ask before running their first report.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              className={`rounded-xl border overflow-hidden ${faq.featured ? 'bg-gradient-to-br from-primary/10 to-accent-blue/10 border-primary/40' : 'bg-dark-700 border-primary/20'}`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-dark-800 transition-all duration-300"
              >
                <span className="font-semibold text-lg pr-8">{faq.question}</span>
                <span className="text-primary text-2xl flex-shrink-0">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 text-gray-300 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
