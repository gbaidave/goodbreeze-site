"use client";

import { motion } from "framer-motion";

const services = [
  {
    title: "Workflow Automation",
    description: "Eliminate repetitive tasks with custom n8n workflows that run 24/7",
    icon: "🔄",
  },
  {
    title: "AI Agent Implementation",
    description: "Deploy chatbots and AI assistants that actually understand your business",
    icon: "🤖",
  },
  {
    title: "Competitive Intelligence",
    description: "Automated market analysis and competitor monitoring that never sleeps",
    icon: "📊",
  },
  {
    title: "Process Optimization",
    description: "Audit, redesign, and automate your operations from end-to-end",
    icon: "⚡",
  },
];

export default function Services() {
  return (
    <section className="py-24 px-6 sm:px-8 lg:px-12 bg-dark">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Done-For-You Services
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Need more than tools? We'll build custom automation tailored to your business.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-dark-700 border border-primary/20 hover:border-primary/50 hover:bg-dark-800 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
              <p className="text-gray-400">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
