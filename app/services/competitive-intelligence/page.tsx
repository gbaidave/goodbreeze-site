import { Metadata } from "next";
import Link from "next/link";
import { ChartIcon } from "@/components/ui/ModernIcons";

export const metadata: Metadata = {
  title: "Competitive Intelligence Services | Good Breeze AI",
  description: "Stay ahead of competitors with automated competitive intelligence services that monitor pricing, positioning, and market moves—so you never miss an opportunity.",
};

export default function CompetitiveIntelligenceServices() {
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
          <span className="text-gray-300">Competitive Intelligence</span>
        </div>

        {/* H1 with target keyword */}
        <div className="flex items-center gap-4 mb-6">
          <ChartIcon className="w-16 h-16" />
          <h1 className="text-4xl sm:text-5xl font-bold text-white">
            Competitive Intelligence Services
          </h1>
        </div>

        {/* First sentence with target keyword */}
        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
          <strong>Competitive intelligence services</strong> help businesses track competitor pricing, messaging, product launches, and market positioning automatically—so you can make informed strategic decisions without manual research.
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
                <h3 className="text-lg font-semibold text-white mb-1">Automated Competitor Monitoring</h3>
                <p className="text-gray-300">We set up systems that continuously track competitor websites, pricing pages, product launches, and marketing campaigns.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">AI-Powered Analysis Reports</h3>
                <p className="text-gray-300">Get automated reports that analyze competitor strengths, weaknesses, and strategic positioning—delivered on your schedule.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Real-Time Alerts</h3>
                <p className="text-gray-300">Get notified instantly when competitors make significant changes—new pricing, product features, or messaging shifts.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Strategic Recommendations</h3>
                <p className="text-gray-300">We don't just give you data—we provide actionable insights on how to capitalize on competitive gaps and opportunities.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Common use cases */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">What We Monitor</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[#3b82f6] via-[#a855f7] to-[#00adb5] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Pricing Changes</h3>
              <p className="text-white/90">Track competitor pricing updates so you can adjust your strategy before losing deals.</p>
            </div>

            <div className="bg-gradient-to-br from-[#3b82f6] via-[#a855f7] to-[#3b82f6] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Product Launches</h3>
              <p className="text-white/90">Know when competitors release new features or products—and how they position them.</p>
            </div>

            <div className="bg-gradient-to-br from-[#a855f7] via-[#00adb5] to-[#a855f7] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Messaging & Positioning</h3>
              <p className="text-white/90">Analyze how competitors talk about themselves and identify opportunities to differentiate.</p>
            </div>

            <div className="bg-gradient-to-br from-[#00adb5] via-[#3b82f6] to-[#a855f7] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Market Trends</h3>
              <p className="text-white/90">Spot emerging trends in your industry before they become mainstream.</p>
            </div>
          </div>
        </div>

        {/* ROI section */}
        <div className="bg-gradient-to-br from-primary/10 to-accent-purple/10 rounded-2xl border border-primary/30 p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Why Manual Competitive Research Fails</h2>
          <p className="text-gray-300 mb-6">
            Most businesses check competitor websites once a quarter, if at all. By the time you notice a pricing change or new feature, you've already lost deals to competitors who moved faster.
          </p>
          <p className="text-gray-300">
            Automated competitive intelligence catches changes the moment they happen—giving you a strategic advantage and helping you stay one step ahead.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center bg-dark-700 rounded-2xl border border-primary/20 p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Stop Guessing What Competitors Are Doing</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Get real time competitive intelligence delivered to your inbox—or try our free Sales Analyzer tool to see how you stack up right now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tools/sales-analyzer"
              className="px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105"
            >
              Try Sales Analyzer Free
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary hover:text-white transition-all duration-300"
            >
              Schedule Strategy Call
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
