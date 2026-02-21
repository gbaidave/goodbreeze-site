"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "1",
    title: "Enter Your URL",
    description: "Paste the URL you want analyzed. Add your business name. No account needed to start.",
  },
  {
    number: "2",
    title: "We Run the Analysis",
    description: "We pull keyword data, check your SEO gaps, and see how you stack up against competitors. Takes 2 to 3 minutes.",
  },
  {
    number: "3",
    title: "Read the Report and Act",
    description: "A full report lands in your inbox. Open it. Follow the specific fixes. Start outranking them.",
  },
];

export default function HowItWorks() {
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
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent-blue to-accent-purple bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Three steps from zero to knowing exactly what to fix.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary via-accent-blue to-accent-purple opacity-30" aria-hidden="true" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative text-center"
            >
              {/* Step number circle */}
              <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6 mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent-blue opacity-20" aria-hidden="true" />
                <div className="absolute inset-0.5 rounded-full bg-dark-800" aria-hidden="true" />
                <span className="relative text-3xl font-bold bg-gradient-to-br from-primary to-accent-blue bg-clip-text text-transparent">
                  {step.number}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-gray-400 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
