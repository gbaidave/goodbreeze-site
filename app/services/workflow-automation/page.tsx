import { Metadata } from "next";
import Link from "next/link";
import { WorkflowIcon } from "@/components/ui/ModernIcons";

export const metadata: Metadata = {
  title: "Workflow Automation Services | Good Breeze AI",
  description: "Eliminate repetitive tasks with custom workflow automation services. Save 20+ hours per week by automating manual processes that slow your business down.",
};

export default function WorkflowAutomationServices() {
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
          <span className="text-gray-300">Workflow Automation</span>
        </div>

        {/* H1 with target keyword */}
        <div className="flex items-center gap-4 mb-6">
          <WorkflowIcon className="w-16 h-16" />
          <h1 className="text-4xl sm:text-5xl font-bold text-white">
            Workflow Automation Services
          </h1>
        </div>

        {/* First sentence with target keyword - answer the query above the fold */}
        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
          <strong>Workflow automation services</strong> help businesses eliminate repetitive manual tasks by creating custom automated systems that handle everything from lead follow-ups to data entry—freeing your team to focus on revenue-generating work.
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
                <h3 className="text-lg font-semibold text-white mb-1">Custom Workflow Design</h3>
                <p className="text-gray-300">We map your existing processes and design automation workflows tailored to your specific business needs.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Implementation & Testing</h3>
                <p className="text-gray-300">We build, test, and deploy your automation workflows using proven tools like n8n, Zapier, or Make.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Training & Documentation</h3>
                <p className="text-gray-300">Your team gets clear documentation and hands-on training so they can manage workflows confidently.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Ongoing Support</h3>
                <p className="text-gray-300">We monitor, maintain, and optimize your workflows as your business evolves.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Common use cases */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Common Workflow Automation Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[#3b82f6] via-[#a855f7] to-[#00adb5] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Lead Management</h3>
              <p className="text-white/90">Automatically capture, route, and follow up with leads from multiple sources without manual data entry.</p>
            </div>

            <div className="bg-gradient-to-br from-[#3b82f6] via-[#a855f7] to-[#3b82f6] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Client Onboarding</h3>
              <p className="text-white/90">Streamline new client intake with automated document collection, welcome sequences, and task assignments.</p>
            </div>

            <div className="bg-gradient-to-br from-[#a855f7] via-[#00adb5] to-[#a855f7] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Reporting & Analytics</h3>
              <p className="text-white/90">Generate and distribute reports automatically on a schedule you define—daily, weekly, or monthly.</p>
            </div>

            <div className="bg-gradient-to-br from-[#00adb5] via-[#3b82f6] to-[#a855f7] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Data Synchronization</h3>
              <p className="text-white/90">Keep your CRM, accounting software, and other tools in sync without manual updates or imports.</p>
            </div>
          </div>
        </div>

        {/* ROI section */}
        <div className="bg-gradient-to-br from-primary/10 to-accent-purple/10 rounded-2xl border border-primary/30 p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">What's the ROI?</h2>
          <p className="text-gray-300 mb-6">
            Most businesses reclaim 20+ hours per week within the first month of implementing workflow automation. At an average of $50/hour for manual labor, that's over $50,000 in saved time annually—often more than the cost of implementation.
          </p>
          <p className="text-gray-300">
            Plus, automated workflows don't make mistakes, don't take sick days, and scale instantly as your business grows.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center bg-dark-700 rounded-2xl border border-primary/20 p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Automate Your Workflows?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Book a 30-minute strategy call and we'll show you exactly which workflows could save you the most time.
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
