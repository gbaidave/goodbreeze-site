import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Process Mapping Template | Good Breeze AI",
  description: "Document your workflows to identify automation opportunities and bottlenecks",
};

export default function ProcessMappingTemplate() {
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
          <span className="text-gray-300">Process Mapping Template</span>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 text-white">Process Mapping Template</h1>
          <p className="text-xl text-gray-400">Visualize your workflows to identify automation opportunities</p>
        </div>

        <div className="bg-dark-700 rounded-2xl border border-primary/20 p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent-blue mb-6">
              <span className="text-4xl">🗺️</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Template Coming Soon</h2>
            <p className="text-gray-300 mb-8">
              We're creating an easy-to-use process mapping template that will help you document your workflows and identify bottlenecks. In the meantime, we can map your processes together on a strategy call.
            </p>

            <div className="bg-dark rounded-xl border border-primary/30 p-6 text-left max-w-2xl mx-auto mb-8">
              <h3 className="text-xl font-bold text-white mb-4">What This Template Will Help You Map:</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-primary">✓</span>
                  <span>Step-by-step workflow for each business process</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">✓</span>
                  <span>Decision points and approval gates</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">✓</span>
                  <span>Time spent on each step</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">✓</span>
                  <span>Pain points and bottlenecks</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">✓</span>
                  <span>Automation opportunities highlighted</span>
                </li>
              </ul>
            </div>

            <Link
              href="/contact"
              className="inline-block px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300"
            >
              Map Your Processes With Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
