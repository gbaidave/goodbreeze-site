"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const faqs = [
  {
    question: "What exactly is AI automation, and how does it help my business?",
    answer: "AI automation means using smart software to handle repetitive tasks automatically—like following up with leads, analyzing data, or monitoring competitors. It saves you hours every week and lets your team focus on what actually grows your business.",
  },
  {
    question: "I've heard of AI, but I don't know where to start. Can you help?",
    answer: "Absolutely. We don't assume you know anything about AI or automation. We speak plain English, explain everything, and show you exactly how it works for YOUR business. Think of us as translators between AI tech and real business results.",
  },
  {
    question: "Will this replace my employees, or help them work smarter?",
    answer: "It helps them work smarter. Automation takes care of boring, repetitive stuff nobody wants to do anyway. Your team focuses on strategy, relationships, and growth—the things humans are actually good at.",
  },
  {
    question: "How do I know if my business is ready for automation?",
    answer: "If you're doing the same tasks over and over, if follow-ups slip through the cracks, or if hiring feels too slow/expensive—you're ready. Our free tools can show you opportunities in minutes.",
  },
  {
    question: "What business problems does automation actually solve?",
    answer: "Automation helps businesses in five key ways: (1) Make more money by never missing follow-ups or opportunities, (2) Save money by reducing manual labor costs, (3) Find more clients through consistent outreach and lead nurturing, (4) Close more clients with faster proposals and professional processes, and (5) Solve major pain points like data entry, reporting, and coordination. If you're facing any of these challenges, automation can help.",
    featured: true,
  },
  {
    question: "What's the difference between your tools and hiring someone?",
    answer: "Tools cost hundreds per month, not thousands. They work 24/7, never call in sick, and scale instantly. For the cost of one employee, you get unlimited automated workflows that never stop working.",
  },
  {
    question: "What happens in a strategy call? Will it be too technical?",
    answer: "Not at all. We walk through your current processes, identify what's eating up time, and show you (in plain English) how automation could help. No jargon, no pressure—just a clear plan.",
  },
  {
    question: "How long until I see results?",
    answer: "Our free tools work instantly. For custom automation, most clients see time savings within 2-4 weeks. The bigger the process, the bigger the impact—but you'll know fast if it's working.",
  },
  {
    question: "Do I need to understand technology to work with you?",
    answer: "Nope. We handle all the technical stuff. You just tell us what takes too long or what you wish happened automatically, and we build it. You don't need to know how a car engine works to drive one.",
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
            We know this might be new territory. Here's what business owners ask us most.
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
