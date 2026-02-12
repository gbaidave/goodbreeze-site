import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Video Guides | Good Breeze AI",
  description: "Step-by-step video tutorials on automation and AI - coming soon",
};

export default function VideoGuidesPage() {
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
          <span className="text-gray-300">Video Guides</span>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 text-white">
            Video Guides
          </h1>
          <p className="text-xl text-gray-300">
            Step-by-step video tutorials on automation and AI
          </p>
        </div>

        {/* Coming Soon Content */}
        <div className="bg-dark-700 rounded-2xl border border-primary/20 p-12 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent-blue mb-8">
            <span className="text-5xl">🎥</span>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">Coming Soon</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            We're creating comprehensive video tutorials to help you implement automation in your business. These guides will walk you through real-world examples, best practices, and step-by-step implementation.
          </p>

          <div className="bg-dark rounded-xl border border-primary/30 p-8 text-left max-w-2xl mx-auto mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Planned Video Topics:</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-primary">•</span>
                <span>How AI Automation Can Save Your Business 20+ Hours/Week</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">•</span>
                <span>The 5 Processes Every SMB Should Automate First</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">•</span>
                <span>How We Use Our Own Automation Tools at Good Breeze AI</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">•</span>
                <span>Building Your First AI Workflow (Start to Finish)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">•</span>
                <span>Automating Client Onboarding and Follow-ups</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-gray-400">
              In the meantime, check out our written guides or book a call to see these concepts in action.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/resources/written-guides"
                className="px-8 py-4 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary hover:text-white transition-all duration-300"
              >
                Read Written Guides
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300"
              >
                Book a Strategy Call
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
