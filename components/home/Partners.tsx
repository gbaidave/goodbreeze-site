"use client";

import { motion } from "framer-motion";

const partners = [
  {
    name: "OpenAI / ChatGPT",
    description: "Advanced Language Models",
    category: "AI Services"
  },
  {
    name: "Anthropic Claude",
    description: "Enterprise AI Assistant",
    category: "AI Services"
  },
  {
    name: "Microsoft",
    description: "Enterprise Cloud & Productivity",
    category: "Infrastructure"
  },
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
    <section className="py-24 px-6 sm:px-8 lg:px-12 bg-dark relative overflow-hidden">
      {/* Background gradient decoration */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
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
              className="bg-dark-700 rounded-xl border border-primary/20 p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group relative overflow-hidden"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent-blue/0 group-hover:from-primary/5 group-hover:to-accent-blue/5 transition-all duration-300 rounded-xl" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent-blue/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                      {partner.name}
                    </h3>
                    <p className="text-sm text-gray-400">{partner.description}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <span className="px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-xs text-primary font-semibold">
                    {partner.category}
                  </span>
                </div>
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
            Plus integrations with 1,000+ apps and services including Slack, Salesforce, QuickBooks, Airtable, and more
          </p>
        </motion.div>
      </div>
    </section>
  );
}
