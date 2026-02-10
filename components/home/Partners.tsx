"use client";

import { motion } from "framer-motion";

const partners = [
  {
    name: "n8n",
    description: "Workflow Automation Platform",
    category: "Core Infrastructure"
  },
  {
    name: "OpenRouter",
    description: "AI Model Gateway",
    category: "AI Services"
  },
  {
    name: "Anthropic Claude",
    description: "Enterprise AI Assistant",
    category: "AI Services"
  },
  {
    name: "Supabase",
    description: "Backend & Database",
    category: "Infrastructure"
  },
  {
    name: "Vercel",
    description: "Deployment & Hosting",
    category: "Infrastructure"
  },
  {
    name: "Google Drive",
    description: "Document Management",
    category: "Integrations"
  },
];

export default function Partners() {
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
            Built on Enterprise-Grade Technology
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            We leverage the best tools in the industry to deliver reliable, scalable automation
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((partner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              className="bg-dark-700 rounded-xl border border-primary/20 p-6 hover:border-primary/50 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                    {partner.name}
                  </h3>
                  <p className="text-sm text-gray-400">{partner.description}</p>
                </div>
                <span className="px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-xs text-primary font-semibold whitespace-nowrap">
                  {partner.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Note about integrations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-400">
            Plus integrations with 1,000+ apps and services including Slack, HubSpot, Salesforce, QuickBooks, and more
          </p>
        </motion.div>
      </div>
    </section>
  );
}
