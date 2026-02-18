import { Metadata } from "next";
import Link from "next/link";
import { BotIcon } from "@/components/ui/ModernIcons";

export const metadata: Metadata = {
  title: "AI Agent Implementation Services",
  description: "Deploy AI agents that handle customer support, lead qualification, and internal processes 24/7 — without the complexity or technical debt.",
  openGraph: {
    title: "AI Agent Implementation Services | Good Breeze AI",
    description: "Deploy AI agents that handle customer support, lead qualification, and internal processes 24/7 — without the complexity or technical debt.",
    url: "https://goodbreeze.ai/services/ai-agents",
  },
};

export default function AIAgentServices() {
  return (
    <div className="min-h-screen bg-dark py-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/" className="text-gray-400 hover:text-primary transition-colors">
            Home
          </Link>
          <span className="text-gray-600 mx-2">/</span>
          <Link href="/#services" className="text-gray-400 hover:text-primary transition-colors">
            Services
          </Link>
          <span className="text-gray-600 mx-2">/</span>
          <span className="text-gray-300">AI Agents</span>
        </div>

        {/* H1 with target keyword */}
        <div className="flex items-center gap-4 mb-6">
          <BotIcon className="w-16 h-16" />
          <h1 className="text-4xl sm:text-5xl font-bold text-white">
            AI Agent Implementation Services
          </h1>
        </div>

        {/* First sentence with target keyword */}
        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
          <strong>AI agent implementation services</strong> help businesses deploy intelligent assistants that handle customer inquiries, qualify leads, and manage internal processes—24/7, without requiring constant human oversight.
        </p>

        {/* What you get section */}
        <div className="bg-dark-700 rounded-2xl border border-primary/20 p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">What You Get</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Custom AI Agent Design</h3>
                <p className="text-gray-300">We design AI agents specifically for your use case—whether that's customer support, lead qualification, or internal knowledge management.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Knowledge Base Integration</h3>
                <p className="text-gray-300">We train your AI agent on your documentation, FAQs, and internal knowledge so it provides accurate, on brand responses.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Multi-Channel Deployment</h3>
                <p className="text-gray-300">Deploy your AI agent across website chat, email, Slack, or any platform your team and customers use.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Continuous Improvement</h3>
                <p className="text-gray-300">We monitor performance, refine responses, and update your AI agent as your business evolves.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Common use cases */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Common AI Agent Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[#3b82f6] via-[#a855f7] to-[#00adb5] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Customer Support</h3>
              <p className="text-white/90">Answer common questions instantly, escalate complex issues to humans, and provide 24/7 support without staffing overnight shifts.</p>
            </div>

            <div className="bg-gradient-to-br from-[#3b82f6] via-[#a855f7] to-[#3b82f6] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Lead Qualification</h3>
              <p className="text-white/90">Engage website visitors, ask qualifying questions, and route high-value leads to your sales team automatically.</p>
            </div>

            <div className="bg-gradient-to-br from-[#a855f7] via-[#00adb5] to-[#a855f7] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Internal Knowledge Assistant</h3>
              <p className="text-white/90">Help employees find answers in company docs, policies, and procedures without digging through folders or asking managers.</p>
            </div>

            <div className="bg-gradient-to-br from-[#00adb5] via-[#3b82f6] to-[#a855f7] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Appointment Scheduling</h3>
              <p className="text-white/90">Let AI agents handle booking, rescheduling, and calendar management so your team never misses a meeting.</p>
            </div>
          </div>
        </div>

        {/* ROI section */}
        <div className="bg-gradient-to-br from-primary/10 to-accent-purple/10 rounded-2xl border border-primary/30 p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Why AI Agents Make Sense</h2>
          <p className="text-gray-300 mb-6">
            Hiring a full time support rep costs $40K-$60K annually. An AI agent handles the same volume of inquiries for a fraction of the cost—and never takes a day off.
          </p>
          <p className="text-gray-300">
            Most businesses see response times drop from hours to seconds, customer satisfaction improve, and support costs decrease by 40-60% within the first quarter.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center bg-dark-700 rounded-2xl border border-primary/20 p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Deploy Your AI Agent?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Let's talk about which AI agent use case would have the biggest impact on your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105"
            >
              Schedule Strategy Call
            </Link>
            <Link
              href="/tools"
              className="px-8 py-4 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary hover:text-white transition-all duration-300"
            >
              Try Free Tools First
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
