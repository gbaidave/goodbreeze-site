import { Metadata } from "next";
import Link from "next/link";
import NewsletterSignup from "@/components/newsletter/NewsletterSignup";

export const metadata: Metadata = {
  title: "Templates & Tools | Good Breeze AI",
  description: "Free resources and templates to help you get started with automation",
};

const templates = [
  {
    title: "ROI Calculator: How Much Time Could You Save?",
    description: "Calculate the potential time and cost savings from automating specific processes in your business",
    slug: "roi-calculator",
    type: "Interactive Tool",
    icon: "🧮",
  },
  {
    title: "Automation Readiness Checklist for SMBs",
    description: "Assess your business's readiness for automation and identify your best starting points",
    slug: "automation-readiness-checklist",
    type: "Checklist",
    icon: "✓",
  },
  {
    title: "Process Mapping Template",
    description: "Document your workflows to identify automation opportunities and bottlenecks",
    slug: "process-mapping-template",
    type: "Template",
    icon: "🗺️",
  },
];

export default function TemplatesToolsPage() {
  return (
    <div className="min-h-screen bg-dark py-24 px-6">
      <div className="max-w-5xl mx-auto">
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
          <span className="text-gray-300">Templates & Tools</span>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 text-white">
            Templates & Tools
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Free resources to help you get started with automation. No signup required.
          </p>
        </div>

        {/* Templates List */}
        <div className="space-y-6">
          {templates.map((template, index) => (
            <Link key={index} href={`/resources/templates-tools/${template.slug}`}>
              <div className="group bg-dark-700 rounded-xl border border-primary/20 p-8 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent-blue flex items-center justify-center text-3xl">
                    {template.icon}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full">
                        {template.type}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white group-hover:text-primary transition-colors mb-3">
                      {template.title}
                    </h2>
                    <p className="text-gray-400 leading-relaxed mb-4">{template.description}</p>
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      <span>Use This Tool</span>
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16">
          <NewsletterSignup />
        </div>
      </div>
    </div>
  );
}
