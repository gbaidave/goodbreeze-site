"use client";

import { motion } from "framer-motion";

const problems = [
  {
    title: "Drowning in Manual Work",
    description: "Your team spends hours on repetitive tasks that should be automated. Follow-ups get missed, data entry never ends, and nothing scales.",
    gradient: "from-red-500 to-orange-500",
    bgColor: "from-red-500/20 to-orange-500/20",
  },
  {
    title: "Hiring is Expensive & Slow",
    description: "You need to grow, but hiring takes months and costs thousands. Every new employee means more overhead, more management, more complexity.",
    gradient: "from-yellow-500 to-orange-500",
    bgColor: "from-yellow-500/20 to-orange-500/20",
  },
  {
    title: "Tried Automation, It Failed",
    description: "You've bought tools that sit unused. Too technical, too complicated, or just didn't work. You're back to doing it manually.",
    gradient: "from-purple-500 to-pink-500",
    bgColor: "from-purple-500/20 to-pink-500/20",
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
              className="relative p-8 rounded-2xl bg-dark-700 border border-primary/20 hover:border-primary/50 transition-all duration-300 overflow-hidden group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${problem.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative z-10">
                <div className={`w-16 h-16 mb-6 rounded-xl bg-gradient-to-br ${problem.gradient} flex items-center justify-center`}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-primary">
                  {problem.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {problem.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
