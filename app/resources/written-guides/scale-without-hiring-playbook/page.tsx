import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Scale Without Hiring: A Real-World Playbook | Good Breeze AI",
  description: "Step-by-step strategies for using automation to grow revenue without increasing headcount",
};

export default function GuideScaleWithoutHiring() {
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
          <span className="text-gray-300">Scale Without Hiring Playbook</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full">
              Growth
            </span>
            <span className="text-gray-500 text-sm">15 min read</span>
          </div>
          <h1 className="text-5xl font-bold mb-6 text-white">
            How to Scale Without Hiring: A Real-World Playbook
          </h1>
          <p className="text-xl text-gray-400">
            Step-by-step strategies for using automation to grow revenue without increasing headcount
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none">
          <div className="space-y-8 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-3xl font-bold text-white mb-4">The Hiring Trap</h2>
              <p>
                Most businesses scale the same way: more customers means more employees. The problem? Hiring is expensive, slow, and risky. Training takes months. Quality is inconsistent. Turnover resets the clock.
              </p>
              <p>
                Smart businesses are breaking this pattern. They're growing 30-50% year-over-year with the same team size—or smaller.
              </p>
              <p className="font-semibold text-white">
                The secret? Automation that handles the work of multiple full-time employees.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-white mb-4">The Framework: Identify, Automate, Scale</h2>

              <div className="bg-dark-700 rounded-xl border border-primary/20 p-8 my-6">
                <h3 className="text-2xl font-bold text-white mb-4">Step 1: Identify the Bottlenecks</h3>
                <p>
                  Before you automate anything, map your current workflow. Where does work pile up? Where do you need to hire next?
                </p>
                <div className="mt-4 space-y-2">
                  <p><strong className="text-primary">Common bottlenecks:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Lead response time (you can't follow up fast enough)</li>
                    <li>Proposal generation (custom quotes take hours)</li>
                    <li>Onboarding (new clients require manual setup)</li>
                    <li>Reporting (executives want data you don't have time to compile)</li>
                    <li>Customer support (same questions asked repeatedly)</li>
                  </ul>
                </div>
              </div>

              <div className="bg-dark-700 rounded-xl border border-primary/20 p-8 my-6">
                <h3 className="text-2xl font-bold text-white mb-4">Step 2: Automate the Repetitive Work</h3>
                <p>
                  Start with the tasks that follow a pattern. If you can write instructions for it, you can automate it.
                </p>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="font-semibold text-white mb-2">Example: Lead Response Automation</p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li>Lead fills out form → System immediately sends personalized welcome email</li>
                      <li>System scores lead based on criteria → Routes to appropriate sales rep</li>
                      <li>Follow-up sequence triggers automatically → No lead falls through cracks</li>
                      <li>Reminders sent to sales rep → Ensures timely outreach</li>
                    </ul>
                    <p className="mt-2 text-sm text-gray-400">
                      <strong>Result:</strong> You respond in seconds instead of hours. Conversion rates increase 40-60%.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-dark-700 rounded-xl border border-primary/20 p-8 my-6">
                <h3 className="text-2xl font-bold text-white mb-4">Step 3: Scale with Confidence</h3>
                <p>
                  Once automation handles the repetitive work, your existing team can focus on high-value activities—closing deals, strategic planning, client relationships.
                </p>
                <p className="mt-4">
                  Instead of hiring 3 people to handle growth, you hire 1 person and let automation handle the rest.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-white mb-4">Real Numbers: What This Looks Like</h2>
              <div className="bg-gradient-to-br from-primary/10 to-accent-blue/10 rounded-xl border border-primary/30 p-8 my-6">
                <p className="font-semibold text-white mb-4">Traditional Scaling Model:</p>
                <ul className="space-y-2 mb-6">
                  <li>• Hire 3 employees at $50K each = $150K/year</li>
                  <li>• Add recruiting, benefits, equipment = $200K+ total cost</li>
                  <li>• 3-6 months to full productivity</li>
                  <li>• Risk of turnover and inconsistency</li>
                </ul>

                <p className="font-semibold text-white mb-4">Automation-First Model:</p>
                <ul className="space-y-2">
                  <li>• Automate 70% of repetitive work = $15-30K/year in automation costs</li>
                  <li>• Hire 1 strategic employee = $70K total</li>
                  <li>• Live in 2-6 weeks</li>
                  <li>• Scales instantly as business grows</li>
                </ul>

                <p className="mt-6 text-xl font-bold text-primary">
                  Savings: $130K+ per year, plus faster time to value
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-white mb-4">The Automation-First Mindset</h2>
              <p>
                The next time you think "I need to hire someone for this," ask instead:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 my-4">
                <li>Can this be automated?</li>
                <li>What parts require human judgment vs. what's just repetitive?</li>
                <li>Could automation handle 70% of this role?</li>
              </ul>
              <p>
                You'll find that most roles can be split: automation handles the busywork, humans focus on the strategic decisions.
              </p>
            </section>

            <section className="bg-gradient-to-br from-primary/10 to-accent-purple/10 rounded-2xl border border-primary/30 p-8 my-8">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Scale Smarter?</h2>
              <p className="text-gray-300 mb-6">
                Book a free strategy call. We'll review your workflows, identify automation opportunities, and map out a plan to grow without the hiring burden.
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
