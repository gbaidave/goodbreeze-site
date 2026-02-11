"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { WorkflowIcon, BotIcon, ChartIcon, GearIcon, ContentIcon, CustomIcon } from "../ui/ModernIcons";

const services = [
  {
    title: "Workflow Automation",
    description: "Eliminate repetitive tasks with custom n8n workflows that run 24/7",
    Icon: WorkflowIcon,
    href: "/services/workflow-automation"
  },
  {
    title: "AI Agent Implementation",
    description: "Deploy chatbots and AI assistants that actually understand your business",
    Icon: BotIcon,
    href: "/services/ai-agents"
  },
  {
    title: "Competitive Intelligence",
    description: "Automated market analysis and competitor monitoring that never sleeps",
    Icon: ChartIcon,
    href: "/services/competitive-intelligence"
  },
  {
    title: "Process Optimization",
    description: "Audit, redesign, and automate your operations completely",
    Icon: GearIcon,
    href: "/services/process-optimization"
  },
  {
    title: "Content Management & Delivery",
    description: "Automate your social media content creation and delivery pipeline",
    Icon: ContentIcon,
    href: "/services/content-management"
  },
  {
    title: "Custom Solutions",
    description: "Need something unique? We build bespoke automation tailored to your needs",
    Icon: CustomIcon,
    href: "/services/custom-solutions"
  },
];

export default function Services() {
  return (
    <section className="py-24 px-6 sm:px-8 lg:px-12 bg-dark relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Done For You Services
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Need more than tools? We'll build custom automation tailored to your business.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Link key={index} href={service.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative p-8 rounded-2xl bg-gradient-to-br from-dark-700 to-dark-800 border border-primary/20 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group cursor-pointer h-full"
              >
                <div className="mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <service.Icon className="w-20 h-20 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-center">{service.title}</h3>
                <p className="text-gray-400 text-center text-sm">{service.description}</p>

                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent-blue/0 group-hover:from-primary/10 group-hover:to-accent-blue/10 rounded-2xl transition-all duration-300" />

                {/* Learn More indicator */}
                <div className="mt-6 text-center text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Learn More →
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
