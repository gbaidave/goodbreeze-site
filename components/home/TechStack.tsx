"use client";

import { motion } from "framer-motion";

const techCategories = [
  {
    category: "Workflow Automation",
    iconPath: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    gradient: "from-primary to-accent-blue",
    tools: ["n8n", "Zapier", "Make (Integromat)", "Automation Anywhere"]
  },
  {
    category: "AI & LLMs",
    iconPath: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    gradient: "from-accent-blue to-accent-purple",
    tools: ["Claude (Anthropic)", "OpenAI GPT-4", "OpenRouter", "LangChain"]
  },
  {
    category: "Development",
    iconPath: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
    gradient: "from-accent-purple to-primary",
    tools: ["Next.js", "React", "TypeScript", "Python", "Node.js"]
  },
  {
    category: "Infrastructure",
    iconPath: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z",
    gradient: "from-primary via-accent-blue to-accent-purple",
    tools: ["Vercel", "Supabase", "Docker", "Google Cloud", "AWS"]
  },
  {
    category: "Data & Analytics",
    iconPath: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    gradient: "from-accent-blue to-primary",
    tools: ["PostgreSQL", "Google Sheets", "Airtable", "Custom APIs"]
  },
  {
    category: "Integrations",
    iconPath: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
    gradient: "from-accent-purple via-accent-blue to-primary",
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
              className="bg-dark-700 rounded-2xl border border-primary/20 p-6 hover:border-primary/50 transition-all duration-300 group"
            >
              <div className="mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <div className={`w-16 h-16 mx-auto rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center`}>
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={category.iconPath} />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-4">{category.category}</h3>
              <div className="flex flex-wrap gap-2">
                {category.tools.map((tool, toolIndex) => (
                  <span
                    key={toolIndex}
                    className="px-3 py-1 bg-dark rounded-lg border border-primary/20 text-sm text-gray-300 hover:border-primary/40 transition-colors duration-300"
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
