"use client";

import { motion } from "framer-motion";

const techCategories = [
  {
    category: "Workflow Automation",
    icon: "⚙️",
    tools: ["n8n", "Zapier", "Make (Integromat)", "Automation Anywhere"]
  },
  {
    category: "AI & LLMs",
    icon: "🤖",
    tools: ["Claude (Anthropic)", "OpenAI GPT-4", "OpenRouter", "LangChain"]
  },
  {
    category: "Development",
    icon: "💻",
    tools: ["Next.js", "React", "TypeScript", "Python", "Node.js"]
  },
  {
    category: "Infrastructure",
    icon: "☁️",
    tools: ["Vercel", "Supabase", "Docker", "Google Cloud", "AWS"]
  },
  {
    category: "Data & Analytics",
    icon: "📊",
    tools: ["PostgreSQL", "Google Sheets", "Airtable", "Custom APIs"]
  },
  {
    category: "Integrations",
    icon: "🔌",
    tools: ["Slack", "HubSpot", "Salesforce", "QuickBooks", "1,000+ apps"]
  },
];

export default function TechStack() {
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
            Our Tech Stack
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            We use the right tools for the job—proven, enterprise-grade technology that scales with your business
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {techCategories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-dark-700 rounded-2xl border border-primary/20 p-6 hover:border-primary/50 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">{category.icon}</div>
                <h3 className="text-xl font-bold text-white">{category.category}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {category.tools.map((tool, toolIndex) => (
                  <span
                    key={toolIndex}
                    className="px-3 py-1 bg-dark rounded-lg border border-primary/20 text-sm text-gray-300"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Why this matters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 bg-gradient-to-br from-primary/10 to-accent-purple/10 rounded-2xl border border-primary/30 p-8"
        >
          <h3 className="text-2xl font-bold text-white mb-4 text-center">Why This Matters</h3>
          <p className="text-gray-300 text-center max-w-3xl mx-auto">
            We don't lock you into proprietary systems. Everything we build uses open standards and best-in-class tools—so you own your automation, not the other way around.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
