import { Metadata } from "next";
import Link from "next/link";
import { GearIcon } from "@/components/ui/ModernIcons";

export const metadata: Metadata = {
  title: "Process Optimization Services | Good Breeze AI",
  description: "Identify bottlenecks and streamline operations with process optimization services that redesign workflows for speed, accuracy, and scalability.",
};

export default function ProcessOptimizationServices() {
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
          <span className="text-gray-300">Process Optimization</span>
        </div>

        {/* H1 with target keyword */}
        <div className="flex items-center gap-4 mb-6">
          <GearIcon className="w-16 h-16" />
          <h1 className="text-4xl sm:text-5xl font-bold text-white">
            Process Optimization Services
          </h1>
        </div>

        {/* First sentence with target keyword */}
        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
          <strong>Process optimization services</strong> help businesses identify inefficiencies, eliminate bottlenecks, and redesign workflows for maximum speed and accuracy—often cutting operational costs by 30-50% while improving output quality.
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
                <h3 className="text-lg font-semibold text-white mb-1">Process Audit</h3>
                <p className="text-gray-300">We map your current workflows end-to-end, identifying bottlenecks, redundancies, and opportunities for improvement.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Optimized Workflow Design</h3>
                <p className="text-gray-300">We redesign processes to eliminate waste, reduce handoffs, and improve throughput—often cutting time-to-completion in half.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Automation Roadmap</h3>
                <p className="text-gray-300">We prioritize which processes to automate first based on ROI, complexity, and business impact.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Implementation Support</h3>
                <p className="text-gray-300">We help you roll out optimized processes, train your team, and measure improvement over time.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Common use cases */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Common Process Optimization Areas</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[#3b82f6] via-[#a855f7] to-[#00adb5] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Sales to Fulfillment</h3>
              <p className="text-white/90">Streamline the handoff from closed deal to project kickoff—eliminate delays and reduce errors.</p>
            </div>

            <div className="bg-gradient-to-br from-[#3b82f6] via-[#a855f7] to-[#3b82f6] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Client Onboarding</h3>
              <p className="text-white/90">Reduce onboarding time from weeks to days by eliminating unnecessary steps and automating what remains.</p>
            </div>

            <div className="bg-gradient-to-br from-[#a855f7] via-[#00adb5] to-[#a855f7] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Financial Close</h3>
              <p className="text-white/90">Cut month-end close time in half by automating reconciliations, approvals, and report generation.</p>
            </div>

            <div className="bg-gradient-to-br from-[#00adb5] via-[#3b82f6] to-[#a855f7] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Customer Support Triage</h3>
              <p className="text-white/90">Route support tickets faster and more accurately—reduce response times and improve customer satisfaction.</p>
            </div>
          </div>
        </div>

        {/* ROI section */}
        <div className="bg-gradient-to-br from-primary/10 to-accent-purple/10 rounded-2xl border border-primary/30 p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">The Cost of Inefficiency</h2>
          <p className="text-gray-300 mb-6">
            Most businesses lose 20-30% of their operational capacity to inefficient processes—handoffs that shouldn't exist, approvals that slow everything down, and manual steps that could be automated.
          </p>
          <p className="text-gray-300">
            Process optimization typically recovers 10-15 hours per employee per week. For a 10-person team, that's 100+ hours reclaimed monthly—equivalent to hiring 2-3 full time employees without the overhead.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center bg-dark-700 rounded-2xl border border-primary/20 p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Optimize Your Operations?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Book a 30-minute process audit and we'll show you exactly where you're losing time and money.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105"
            >
              Schedule Process Audit
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
