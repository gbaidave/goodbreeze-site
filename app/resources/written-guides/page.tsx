import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Written Guides | Good Breeze AI",
  description: "In-depth guides on implementing AI automation in your business",
};

const guides = [
  {
    title: "The Business Owner's Guide to AI Automation",
    description: "Learn the fundamentals of AI automation in plain English, without the technical jargon",
    slug: "business-owners-guide-to-ai-automation",
    readTime: "12 min read",
    category: "Getting Started",
  },
  {
    title: "5 Signs Your Business is Ready for Automation",
    description: "Identify the key indicators that automation will deliver immediate ROI for your operations",
    slug: "signs-your-business-is-ready-for-automation",
    readTime: "8 min read",
    category: "Assessment",
  },
  {
    title: "How to Scale Without Hiring: A Real-World Playbook",
    description: "Step-by-step strategies for using automation to grow revenue without increasing headcount",
    slug: "scale-without-hiring-playbook",
    readTime: "15 min read",
    category: "Growth",
  },
];

export default function WrittenGuidesPage() {
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
          <span className="text-gray-300">Written Guides</span>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 text-white">
            Written Guides
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            In-depth articles on scaling with automation. Everything you need to know, explained in plain English.
          </p>
        </div>

        {/* Guides List */}
        <div className="space-y-6">
          {guides.map((guide, index) => (
            <Link key={index} href={`/resources/written-guides/${guide.slug}`}>
              <div className="group bg-dark-700 rounded-xl border border-primary/20 p-8 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full">
                        {guide.category}
                      </span>
                      <span className="text-gray-500 text-sm">{guide.readTime}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white group-hover:text-primary transition-colors mb-3">
                      {guide.title}
                    </h2>
                    <p className="text-gray-400 leading-relaxed">{guide.description}</p>
                  </div>
                  <svg className="w-6 h-6 text-primary flex-shrink-0 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center bg-gradient-to-br from-primary/10 to-accent-purple/10 rounded-2xl border border-primary/30 p-12">
          <h2 className="text-3xl font-bold mb-4">Need Help Getting Started?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Book a free strategy call to discuss your automation opportunities.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105"
          >
            Book Your Strategy Call
          </Link>
        </div>
      </div>
    </div>
  );
}
