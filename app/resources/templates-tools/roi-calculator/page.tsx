import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ROI Calculator | Good Breeze AI",
  description: "Calculate the potential time and cost savings from automating specific processes in your business",
};

export default function ROICalculator() {
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
          <span className="text-gray-300">ROI Calculator</span>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 text-white">Automation ROI Calculator</h1>
          <p className="text-xl text-gray-400">Calculate how much time and money you could save with automation</p>
        </div>

        <div className="bg-dark-700 rounded-2xl border border-primary/20 p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent-blue mb-6">
              <span className="text-4xl">🧮</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Interactive Calculator Coming Soon</h2>
            <p className="text-gray-300 mb-8">
              We're building an interactive ROI calculator that will help you estimate the time and cost savings from automating your business processes. In the meantime, book a strategy call for a personalized assessment.
            </p>

            <div className="bg-dark rounded-xl border border-primary/30 p-6 text-left max-w-2xl mx-auto mb-8">
              <h3 className="text-xl font-bold text-white mb-4">What This Tool Will Calculate:</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-primary">✓</span>
                  <span>Hours saved per week from automating repetitive tasks</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">✓</span>
                  <span>Annual cost savings compared to hiring additional staff</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">✓</span>
                  <span>Expected payback period for automation investment</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">✓</span>
                  <span>Revenue growth potential from faster processes</span>
                </li>
              </ul>
            </div>

            <Link
              href="/contact"
              className="inline-block px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300"
            >
              Get a Free ROI Assessment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
