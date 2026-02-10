"use client";

import { motion } from "framer-motion";

const problems = [
  {
    title: "Drowning in Manual Work",
    description: "Your team spends hours on repetitive tasks that should be automated. Follow-ups get missed, data entry never ends, and nothing scales.",
  },
  {
    title: "Hiring is Expensive & Slow",
    description: "You need to grow, but hiring takes months and costs thousands. Every new employee means more overhead, more management, more complexity.",
  },
  {
    title: "Tried Automation, It Failed",
    description: "You've bought tools that sit unused. Too technical, too complicated, or just didn't work. You're back to doing it manually.",
  },
];

export default function Problem() {
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
            Sound Familiar?
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Most SMBs face the same scaling problems. You're not alone.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="p-8 rounded-2xl bg-dark-700 border border-primary/20 hover:border-primary/50 transition-all duration-300"
            >
              <h3 className="text-2xl font-semibold mb-4 text-primary">
                {problem.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
