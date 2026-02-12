import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Automation Readiness Checklist | Good Breeze AI",
  description: "Assess your business's readiness for automation and identify your best starting points",
};

export default function AutomationReadinessChecklist() {
  return (
    <div className="min-h-screen bg-dark py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-gray-400 hover:text-primary transition-colors">Home</Link>
          <span className="text-gray-600 mx-2">/</span>
          <Link href="/resources" className="text-gray-400 hover:text-primary transition-colors">Resources</Link>
          <span className="text-gray-600 mx-2">/</span>
          <Link href="/resources/templates-tools" className="text-gray-400 hover:text-primary transition-colors">Templates & Tools</Link>
          <span className="text-gray-600 mx-2">/</span>
          <span className="text-gray-300">Automation Readiness Checklist</span>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 text-white">Automation Readiness Checklist</h1>
          <p className="text-xl text-gray-400">Is your business ready for automation? Use this checklist to find out.</p>
        </div>

        <div className="bg-dark-700 rounded-2xl border border-primary/20 p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent-blue mb-6">
              <span className="text-4xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Downloadable Checklist Coming Soon</h2>
            <p className="text-gray-300 mb-8">
              We're preparing a comprehensive checklist to help you assess your automation readiness. Until then, book a free assessment call where we'll walk through this checklist together.
            </p>

            <div className="bg-dark rounded-xl border border-primary/30 p-6 text-left max-w-2xl mx-auto mb-8">
              <h3 className="text-xl font-bold text-white mb-4">What This Checklist Will Cover:</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-primary">✓</span>
                  <span>Process maturity and documentation level</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">✓</span>
                  <span>Current technology stack and integration readiness</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">✓</span>
                  <span>Team capacity and change management readiness</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">✓</span>
                  <span>Data quality and accessibility</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">✓</span>
                  <span>Budget and ROI expectations</span>
                </li>
              </ul>
            </div>

            <Link
              href="/contact"
              className="inline-block px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300"
            >
              Get a Free Readiness Assessment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
