"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";

const steps = [
  {
    label: "Step 1",
    title: "Stabilize",
    description:
      "Start with a free report to see where your business stands. Add targeted paid reports to find the specific improvements that get you on the right track.",
  },
  {
    label: "Step 2",
    title: "Grow",
    description:
      "We find the specific challenges holding your business back, then help you work through them one by one. So you can start growing instead of managing the same problems.",
  },
  {
    label: "Step 3",
    title: "Scale",
    description:
      "When you're ready to build, we create the systems your business needs to handle more volume and do more with the team you have. Built around your actual processes and goals.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-6 sm:px-8 lg:px-12 bg-dark-800">
      <div className="max-w-7xl mx-auto">
        {/* Section border wraps H2, subtitle, AND all three step cards */}
        <div className="border border-primary/20 rounded-2xl p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
              How We Work
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Low risk to start. Clear results along the way. Built to scale when
              you&apos;re ready.
            </p>
          </motion.div>

          <div className="flex flex-col md:flex-row md:items-stretch gap-6 md:gap-0 relative">
            {/* Connector line (desktop) */}
            <div
              className="hidden md:block absolute top-10 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary via-accent-blue to-accent-purple opacity-30"
              aria-hidden="true"
            />

            {steps.map((step, index) => (
              <Fragment key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="relative text-center bg-dark-700 rounded-2xl p-6 md:flex-1"
                >
                  {/* Step label circle — w-[216px] (216px) + text-[54px] per Dave's request for 50% larger again */}
                  <div className="relative inline-flex items-center justify-center w-[216px] h-[216px] mb-6 mx-auto">
                    <div
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent-blue opacity-20"
                      aria-hidden="true"
                    />
                    <div
                      className="absolute inset-0.5 rounded-full bg-dark-800"
                      aria-hidden="true"
                    />
                    <span
                      className="relative text-[54px] font-bold"
                      style={{
                        background: 'linear-gradient(135deg, #00adb5, #3b82f6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {step.label}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed line-clamp-3">{step.description}</p>
                </motion.div>

                {/* Vertical separator between step cards (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block w-px bg-primary/50 self-stretch flex-shrink-0 mx-4" aria-hidden="true" />
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
