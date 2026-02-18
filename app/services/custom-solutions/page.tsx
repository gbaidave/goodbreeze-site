import { Metadata } from "next";
import Link from "next/link";
import { CustomIcon } from "@/components/ui/ModernIcons";

export const metadata: Metadata = {
  title: "Custom Automation Solutions",
  description: "Your business isn't generic — your automation shouldn't be either. Bespoke solutions built exactly for your processes, your tools, and the way your team actually works.",
  openGraph: {
    title: "Custom Automation Solutions | Good Breeze AI",
    description: "Your business isn't generic — your automation shouldn't be either. Bespoke solutions built exactly for your processes, your tools, and the way your team actually works.",
    url: "https://goodbreeze.ai/services/custom-solutions",
  },
};

export default function CustomSolutionsServices() {
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
          <span className="text-gray-300">Custom Solutions</span>
        </div>

        {/* H1 with target keyword */}
        <div className="flex items-center gap-4 mb-6">
          <CustomIcon className="w-16 h-16" />
          <h1 className="text-4xl sm:text-5xl font-bold text-white">
            Custom Automation Solutions
          </h1>
        </div>

        {/* First sentence with target keyword */}
        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
          <strong>Custom automation solutions</strong> are built from scratch to match your unique business processes, integrations, and workflows—going beyond standard templates to solve problems that off the shelf tools can't handle.
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
                <h3 className="text-lg font-semibold text-white mb-1">Deep Discovery Process</h3>
                <p className="text-gray-300">We start by understanding your exact business process, data flows, systems, and pain points—no assumptions, just thorough research.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Tailored Architecture Design</h3>
                <p className="text-gray-300">We design a solution architecture that fits your tech stack, integrations, and business requirements perfectly.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Custom Development & Integration</h3>
                <p className="text-gray-300">We build the automation from the ground up, including custom integrations with proprietary systems or legacy software.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Ongoing Support & Evolution</h3>
                <p className="text-gray-300">As your business changes, we adapt and expand your custom solution to keep pace with new requirements.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Common use cases */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">When Custom Solutions Make Sense</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[#3b82f6] via-[#a855f7] to-[#00adb5] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Complex Multi System Integration</h3>
              <p className="text-white/90">Connect proprietary software, legacy systems, and modern tools into a unified automated workflow.</p>
            </div>

            <div className="bg-gradient-to-br from-[#3b82f6] via-[#a855f7] to-[#3b82f6] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Industry Specific Processes</h3>
              <p className="text-white/90">Automate workflows unique to your industry that no standard template addresses—healthcare, legal, manufacturing, finance, etc.</p>
            </div>

            <div className="bg-gradient-to-br from-[#a855f7] via-[#00adb5] to-[#a855f7] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Advanced Data Processing</h3>
              <p className="text-white/90">Build custom data pipelines that transform, analyze, and route information across your business systems intelligently.</p>
            </div>

            <div className="bg-gradient-to-br from-[#00adb5] via-[#3b82f6] to-[#a855f7] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Scalable Enterprise Automation</h3>
              <p className="text-white/90">Design and implement automation that can handle enterprise scale complexity, compliance requirements, and security standards.</p>
            </div>
          </div>
        </div>

        {/* ROI section */}
        <div className="bg-gradient-to-br from-primary/10 to-accent-purple/10 rounded-2xl border border-primary/30 p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">When Off the Shelf Doesn't Cut It</h2>
          <p className="text-gray-300 mb-6">
            Standard automation templates work great for common problems. But if your business has unique processes, proprietary systems, or specific compliance requirements, you need a solution built around your reality—not a template you're forced to adapt to.
          </p>
          <p className="text-gray-300">
            Custom solutions cost more upfront but save significantly more time and money in the long run by eliminating workarounds, manual steps, and the frustration of trying to fit square pegs into round holes.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center bg-dark-700 rounded-2xl border border-primary/20 p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Let's Build Exactly What You Need</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Book a discovery call and tell us about your unique automation challenge—we'll design a solution that fits your business perfectly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105"
            >
              Schedule Discovery Call
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
