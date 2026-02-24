"use client";

import { motion } from "framer-motion";

const steps = [
  {
    label: "Step 1",
    title: "Stabilize",
    description:
      "Start with a free report to see where your business stands in the marketplace. Add low-cost targeted reports to find the specific improvements that put your business on the right track. No big commitment. No risk.",
  },
  {
    label: "Step 2",
    title: "Grow",
    description:
      "We work with you to find the specific challenges holding your business back and keeping it from growing. Then we help you work through them, one by one, so you can start growing instead of managing the same problems every day.",
  },
  {
    label: "Step 3",
    title: "Scale",
    description:
      "When you're ready to build, we work with you to create the systems your business needs to handle more volume, do more with the team you have, and grow without constant hiring. Built around your actual processes, your team, and your goals.",
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
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
            How We Work
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Low risk to start. Clear results along the way. Built to scale when
            you&apos;re ready.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div
            className="hidden md:block absolute top-10 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary via-accent-blue to-accent-purple opacity-30"
            aria-hidden="true"
          />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative text-center"
            >
              {/* Step label circle */}
              <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6 mx-auto">
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent-blue opacity-20"
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0.5 rounded-full bg-dark-800"
                  aria-hidden="true"
                />
                <span className="relative text-xl font-bold bg-gradient-to-br from-primary to-accent-blue bg-clip-text text-transparent">
                  {step.label}
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
