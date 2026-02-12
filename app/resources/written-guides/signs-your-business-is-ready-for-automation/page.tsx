import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "5 Signs Your Business is Ready for Automation | Good Breeze AI",
  description: "Identify the key indicators that automation will deliver immediate ROI for your operations",
};

export default function GuideReadyForAutomation() {
  return (
    <div className="min-h-screen bg-dark py-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/" className="text-gray-400 hover:text-primary transition-colors">
            Home
          </Link>
          <span className="text-gray-600 mx-2">/</span>
          <Link href="/resources" className="text-gray-400 hover:text-primary transition-colors">
            Resources
          </Link>
          <span className="text-gray-600 mx-2">/</span>
          <Link href="/resources/written-guides" className="text-gray-400 hover:text-primary transition-colors">
            Written Guides
          </Link>
          <span className="text-gray-600 mx-2">/</span>
          <span className="text-gray-300">Signs You're Ready for Automation</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full">
              Assessment
            </span>
            <span className="text-gray-500 text-sm">8 min read</span>
          </div>
          <h1 className="text-5xl font-bold mb-6 text-white">
            5 Signs Your Business is Ready for Automation
          </h1>
          <p className="text-xl text-gray-400">
            Identify the key indicators that automation will deliver immediate ROI for your operations
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none">
          <div className="space-y-8 text-gray-300 leading-relaxed">
            <p className="text-lg">
              Not every business is ready for automation. But if you're experiencing these five patterns, you're the perfect candidate for immediate ROI.
            </p>

            <section className="bg-dark-700 rounded-xl border border-primary/20 p-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold">1</span>
                You're Doing the Same Thing Over and Over
              </h2>
              <p>
                If you find yourself copying and pasting the same email, filling out the same form fields, or clicking through the same multi-step process daily, that's automation gold.
              </p>
              <p className="mt-4">
                <strong>The Test:</strong> Could you write step-by-step instructions for someone else to do this task? If yes, you can automate it.
              </p>
            </section>

            <section className="bg-dark-700 rounded-xl border border-primary/20 p-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold">2</span>
                Things Are Slipping Through the Cracks
              </h2>
              <p>
                Missed follow-ups. Leads that never got contacted. Documents that didn't get sent. When growth outpaces your ability to track everything, manual processes fail.
              </p>
              <p className="mt-4">
                <strong>The Reality:</strong> You can't scale memory. Systems scale. Automation never forgets.
              </p>
            </section>

            <section className="bg-dark-700 rounded-xl border border-primary/20 p-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold">3</span>
                You're Paying for Work You Could Automate
              </h2>
              <p>
                Data entry, document formatting, email scheduling, appointment booking—if you're paying someone hourly to do these tasks, you're spending 10-50x what automation would cost.
              </p>
              <p className="mt-4">
                <strong>The Math:</strong> A virtual assistant costs $15-25/hour. Automation handling the same work costs pennies per transaction.
              </p>
            </section>

            <section className="bg-dark-700 rounded-xl border border-primary/20 p-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold">4</span>
                You Need Information You Don't Have Time to Gather
              </h2>
              <p>
                Competitive intelligence. Market trends. Customer behavior patterns. Lead scoring. You know this information would help you make better decisions, but manually collecting and analyzing it isn't realistic.
              </p>
              <p className="mt-4">
                <strong>The Opportunity:</strong> AI can continuously monitor, collect, and summarize information that would take you hours to research manually.
              </p>
            </section>

            <section className="bg-dark-700 rounded-xl border border-primary/20 p-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold">5</span>
                You're Bottlenecked by Waiting for Approvals or Updates
              </h2>
              <p>
                If work sits idle waiting for someone to manually move it to the next stage, you're losing time and money. Workflow automation keeps things moving without constant intervention.
              </p>
              <p className="mt-4">
                <strong>The Impact:</strong> Most businesses find 30-50% of their process cycle time is just waiting for manual handoffs.
              </p>
            </section>

            <section className="bg-gradient-to-br from-primary/10 to-accent-purple/10 rounded-2xl border border-primary/30 p-8 my-8">
              <h2 className="text-3xl font-bold text-white mb-4">How Many Signs Did You Recognize?</h2>
              <div className="space-y-4">
                <p className="text-gray-300">
                  <strong className="text-white">1-2 signs:</strong> You have specific automation opportunities. Start with your biggest pain point.
                </p>
                <p className="text-gray-300">
                  <strong className="text-white">3-4 signs:</strong> Automation will deliver significant ROI across multiple areas. Consider a strategic roadmap.
                </p>
                <p className="text-gray-300">
                  <strong className="text-white">5 signs:</strong> You're leaving money on the table every day. Let's talk immediately.
                </p>
              </div>
              <div className="mt-6">
                <Link
                  href="/contact"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300"
                >
                  Book Your Assessment Call
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
