import { Metadata } from "next";
import Link from "next/link";
import { ContentIcon } from "@/components/ui/ModernIcons";

export const metadata: Metadata = {
  title: "Content Management & Delivery Services",
  description: "Get off the content treadmill. Custom workflows that plan, create, and schedule content across platforms — so your business stays visible without consuming your week.",
  openGraph: {
    title: "Content Management & Delivery Services | Good Breeze AI",
    description: "Get off the content treadmill. Custom workflows that plan, create, and schedule content across platforms — so your business stays visible without consuming your week.",
    url: "https://goodbreeze.ai/services/content-management",
  },
};

export default function ContentManagementServices() {
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
          <span className="text-gray-300">Content Management & Delivery</span>
        </div>

        {/* H1 with target keyword */}
        <div className="flex items-center gap-4 mb-6">
          <ContentIcon className="w-16 h-16" />
          <h1 className="text-4xl sm:text-5xl font-bold text-white">
            Content Management & Delivery Services
          </h1>
        </div>

        {/* First sentence with target keyword */}
        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
          <strong>Content management and delivery services</strong> help businesses automate the entire content lifecycle—from planning and creation to scheduling and publishing across multiple platforms—so you can maintain consistent social media presence without the daily grind.
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
                <h3 className="text-lg font-semibold text-white mb-1">Automated Content Planning</h3>
                <p className="text-gray-300">We set up systems that help you plan content themes, topics, and publishing schedules weeks or months in advance.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Multi Platform Distribution</h3>
                <p className="text-gray-300">Automatically format and publish content to LinkedIn, Twitter, Instagram, Facebook, and other platforms from a single source.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Content Repurposing Workflows</h3>
                <p className="text-gray-300">Turn long form content into bite sized social posts, email newsletters, and other formats automatically.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Performance Tracking & Optimization</h3>
                <p className="text-gray-300">Monitor engagement metrics across platforms and get automated reports on what content performs best.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Common use cases */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Common Content Automation Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[#3b82f6] via-[#a855f7] to-[#00adb5] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Social Media Scheduling</h3>
              <p className="text-white/90">Plan and schedule weeks of social media content in one sitting, then let automation handle the posting.</p>
            </div>

            <div className="bg-gradient-to-br from-[#3b82f6] via-[#a855f7] to-[#3b82f6] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Blog to Social Distribution</h3>
              <p className="text-white/90">Automatically turn new blog posts into social media threads, LinkedIn articles, and email newsletter content.</p>
            </div>

            <div className="bg-gradient-to-br from-[#a855f7] via-[#00adb5] to-[#a855f7] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Engagement Monitoring</h3>
              <p className="text-white/90">Track mentions, comments, and engagement across platforms in a unified dashboard without switching tabs.</p>
            </div>

            <div className="bg-gradient-to-br from-[#00adb5] via-[#3b82f6] to-[#a855f7] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Content Calendar Management</h3>
              <p className="text-white/90">Centralize your content calendar with approval workflows, deadlines, and automated reminders for your team.</p>
            </div>
          </div>
        </div>

        {/* ROI section */}
        <div className="bg-gradient-to-br from-primary/10 to-accent-purple/10 rounded-2xl border border-primary/30 p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Stop Trading Time for Content</h2>
          <p className="text-gray-300 mb-6">
            Most businesses spend 10-15 hours per week on social media management—creating posts, scheduling content, monitoring engagement, and reporting on performance. That's nearly half a full time position dedicated just to content logistics.
          </p>
          <p className="text-gray-300">
            Automated content management systems reclaim 70-80% of that time, letting you focus on strategy and creativity while automation handles the repetitive scheduling, formatting, and distribution tasks.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center bg-dark-700 rounded-2xl border border-primary/20 p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Automate Your Content Pipeline?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Let's build a content management system that keeps you consistent without burning out your team.
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
              Try Free Reports First
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
