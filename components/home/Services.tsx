"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const services = [
  {
    title: "Workflow Automation",
    qualifier: "For teams doing the same manual tasks every day",
    outcomes: [
      "Your team stops doing the same task twice",
      "Work gets done overnight. No one has to trigger it.",
      "Works with what you already use. No ripping and replacing.",
      "Documented so your team runs it without you in the room",
    ],
  },
  {
    title: "AI Agent Buildouts",
    qualifier: "For businesses that can't respond to every lead or inquiry in time",
    outcomes: [
      "Leads get followed up while your team is doing other work",
      "Built around your actual products, language, and processes",
      "Handles intake, inquiries, and follow-up automatically",
      "Handed off with training, not a black box you can't touch.",
    ],
  },
  {
    title: "Operations Overhaul",
    qualifier: "For owners spending too much time running the business instead of building it",
    outcomes: [
      "See exactly where your time and money are going",
      "Reporting built for your business. No more digging for answers.",
      "Your team can follow the system without asking you every step",
      "Built to handle more volume without adding headcount",
    ],
  },
];

export default function Services() {
  return (
    <section className="py-24 px-6 sm:px-8 lg:px-12 bg-dark relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
            Done For You Automation
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            We build systems that free your team from manual work. Same output, less effort, without adding staff.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-14">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex flex-col rounded-2xl overflow-hidden border border-primary/20 bg-gradient-to-br from-dark-700 to-dark-800"
            >
              {/* Card header */}
              <div className="px-8 pt-8 pb-6 border-b border-primary/20">
                <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                <p className="text-sm text-primary leading-snug min-h-[2.5rem]">{service.qualifier}</p>
              </div>

              {/* Outcomes */}
              <div className="px-8 py-6 flex-1">
                <ul className="space-y-3">
                  {service.outcomes.map((outcome, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-300 text-sm leading-snug">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Single CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-primary via-accent-blue to-primary text-white text-lg font-bold rounded-full shadow-2xl shadow-primary/30 border-2 border-white/60 hover:shadow-primary/50 transition-all duration-300 hover:scale-105"
          >
            Book My Strategy Call
          </Link>
          <p className="text-gray-500 text-sm mt-4">
            Free call. We&apos;ll tell you whether custom work makes sense before you spend anything.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
