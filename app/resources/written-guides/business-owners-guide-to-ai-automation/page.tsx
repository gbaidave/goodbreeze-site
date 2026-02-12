import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Business Owner's Guide to AI Automation | Good Breeze AI",
  description: "Learn the fundamentals of AI automation in plain English, without the technical jargon",
};

export default function GuideAIAutomation() {
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
          <span className="text-gray-300">AI Automation Guide</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full">
              Getting Started
            </span>
            <span className="text-gray-500 text-sm">12 min read</span>
          </div>
          <h1 className="text-5xl font-bold mb-6 text-white">
            The Business Owner's Guide to AI Automation
          </h1>
          <p className="text-xl text-gray-400">
            Learn the fundamentals of AI automation in plain English, without the technical jargon
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none">
          <div className="space-y-8 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-3xl font-bold text-white mb-4">What is AI Automation?</h2>
              <p>
                AI automation combines artificial intelligence with workflow automation to handle tasks that traditionally required human judgment. Unlike simple automation that follows rigid rules, AI automation can adapt, learn patterns, and make decisions based on context.
              </p>
              <p>
                Think of it this way: regular automation is like a vending machine—press button A, get item A. AI automation is more like a smart assistant that understands what you need, considers your preferences, and suggests the best option.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-white mb-4">Why Now?</h2>
              <p>
                For the first time in history, powerful AI tools are accessible to small and medium businesses at affordable prices. What used to cost hundreds of thousands of dollars in enterprise software is now available for a fraction of the cost.
              </p>
              <p>
                The competitive advantage has shifted. It's no longer about who has the biggest budget—it's about who can implement automation fastest and most effectively.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-white mb-4">What Can You Automate?</h2>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6 my-6">
                <h3 className="text-xl font-bold text-white mb-4">Common Automation Opportunities:</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• <strong>Customer Follow-Ups:</strong> Automatically send personalized emails based on customer actions</li>
                  <li>• <strong>Proposal Generation:</strong> Create custom proposals from templates with pre-filled data</li>
                  <li>• <strong>Data Entry:</strong> Extract information from documents and update your systems</li>
                  <li>• <strong>Lead Qualification:</strong> Score and route leads based on predefined criteria</li>
                  <li>• <strong>Reporting:</strong> Generate executive summaries and performance dashboards automatically</li>
                  <li>• <strong>Competitive Intelligence:</strong> Monitor competitors and market changes in real-time</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-white mb-4">Where to Start?</h2>
              <p>
                The best automation projects start with pain points. Ask yourself:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>What tasks am I doing repeatedly that follow a pattern?</li>
                <li>Where do leads or customers fall through the cracks?</li>
                <li>What processes require waiting for someone to manually move things forward?</li>
                <li>What information do I need but don't have time to gather?</li>
              </ol>
              <p className="mt-4">
                Your answers will reveal the highest-impact automation opportunities.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-white mb-4">The ROI Reality Check</h2>
              <p>
                Good automation pays for itself within weeks or months, not years. If someone proposes a six-month implementation timeline, you're probably over-engineering it.
              </p>
              <p>
                Start small. Pick one process. Automate it. Measure the results. Then expand.
              </p>
            </section>

            <section className="bg-gradient-to-br from-primary/10 to-accent-purple/10 rounded-2xl border border-primary/30 p-8 my-8">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
              <p className="text-gray-300 mb-6">
                Book a free strategy call to identify your highest-impact automation opportunities.
              </p>
              <Link
                href="/contact"
                className="inline-block px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300"
              >
                Book Your Strategy Call
              </Link>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
