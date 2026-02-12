import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Alana Shaw Case Study | Good Breeze AI",
  description: "How a consultant streamlined intake and proposal processes with automation",
};

export default function AlanaShawCaseStudy() {
  return (
    <div className="min-h-screen bg-dark py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-gray-400 hover:text-primary transition-colors">Home</Link>
          <span className="text-gray-600 mx-2">/</span>
          <Link href="/case-studies" className="text-gray-400 hover:text-primary transition-colors">Case Studies</Link>
          <span className="text-gray-600 mx-2">/</span>
          <span className="text-gray-300">Alana Shaw</span>
        </div>

        <div className="bg-gradient-to-br from-[#3b82f6]/20 via-[#a855f7]/20 to-[#00adb5]/10 rounded-2xl p-12 mb-12">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative w-24 h-24 rounded-full border-2 border-primary/30 overflow-hidden flex-shrink-0">
              <Image src="/images/avatars/alana-shaw.png" alt="Alana Shaw" width={96} height={96} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Alana Shaw</h1>
              <p className="text-xl text-primary">Consultant</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-dark/50 rounded-xl border border-primary/20 p-6">
              <div className="text-sm text-gray-400 mb-2">Industry</div>
              <div className="text-white font-semibold text-lg">Business Consulting</div>
            </div>
            <div className="bg-dark/50 rounded-xl border border-primary/20 p-6">
              <div className="text-sm text-gray-400 mb-2">Team Size</div>
              <div className="text-white font-semibold text-lg">Solo Consultant + 2 Part-Time Staff</div>
            </div>
          </div>
        </div>

        <div className="space-y-12 text-gray-300">
          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-red-400 text-2xl">⚠️</span>
              The Problem
            </h2>
            <p className="text-lg leading-relaxed mb-4">
              Alana's consulting firm was losing leads due to slow intake processes and inconsistent proposal delivery. Manual follow ups meant opportunities slipped through the cracks, and proposal creation took hours of repetitive work that could have been spent on billable client time.
            </p>
            <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Specific Pain Points:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary">•</span>
                  <span>Lead response time averaged 24-48 hours (competitors responded within minutes)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">•</span>
                  <span>Proposal creation took 3-4 hours per client due to manual data entry and formatting</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">•</span>
                  <span>Follow-up reminders relied on memory and calendar entries, resulting in 30% missed follow-ups</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">•</span>
                  <span>Inconsistent proposal quality depending on who created them</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-primary text-2xl">⚙️</span>
              The Solution
            </h2>
            <p className="text-lg leading-relaxed mb-6">
              We built an automated intake workflow that captures lead information, auto fills proposal templates based on service type, and schedules follow up reminders at optimal intervals. The system integrates with her CRM to ensure nothing falls through the cracks.
            </p>
            <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Implementation Details:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary">1.</span>
                  <div>
                    <strong className="text-white">Lead Capture & Response:</strong> Automated form submission triggers instant confirmation email with next steps
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">2.</span>
                  <div>
                    <strong className="text-white">Proposal Automation:</strong> Service type determines template, client data auto-populates fields, custom pricing rules apply based on scope
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">3.</span>
                  <div>
                    <strong className="text-white">Follow-Up Sequencing:</strong> Automated reminders sent at day 3, 7, and 14 if no response, escalation to manual review after 3 attempts
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">4.</span>
                  <div>
                    <strong className="text-white">CRM Integration:</strong> All interactions logged automatically, status updates tracked in real-time
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-accent-purple text-2xl">🔄</span>
              Our Process
            </h2>
            <p className="text-lg leading-relaxed mb-6">
              We follow a proven four-phase methodology adapted from leading automation agency frameworks to deliver results quickly and reliably:
            </p>
            <div className="space-y-4">
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">1</div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Discovery & Audit (Week 1)</h4>
                    <p className="text-sm text-gray-300">Mapped Alana's current intake and proposal workflow, identified bottlenecks through process observation, analyzed competitor response times and proposal quality benchmarks</p>
                  </div>
                </div>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">2</div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Roadmap & Design (Week 1)</h4>
                    <p className="text-sm text-gray-300">Created automation blueprint showing exact workflow logic, designed proposal templates with smart autofill rules, mapped CRM integration points and data flow</p>
                  </div>
                </div>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">3</div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Build & Implementation (Week 2)</h4>
                    <p className="text-sm text-gray-300">Built intake forms and automated email responses, configured proposal templates with autofill logic, integrated with existing CRM system, set up follow-up sequencing rules</p>
                  </div>
                </div>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">4</div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Optimize & Handoff (Ongoing)</h4>
                    <p className="text-sm text-gray-300">Trained team on system usage and exception handling, monitored performance for 30 days and adjusted timing, established feedback loop for continuous improvement</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-green-400 text-2xl">📈</span>
              The Results
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <div className="text-sm text-gray-400 mb-2">Time to Market</div>
                <div className="text-white font-semibold text-lg">Deployed in 2 weeks</div>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <div className="text-sm text-gray-400 mb-2">Effectiveness</div>
                <div className="text-white font-semibold text-lg">100% proposal consistency</div>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <div className="text-sm text-gray-400 mb-2">Time Saved</div>
                <div className="text-white font-semibold text-lg">12 hours per week</div>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <div className="text-sm text-gray-400 mb-2">Key Metric</div>
                <div className="text-primary font-semibold text-lg">Zero missed follow-ups</div>
              </div>
            </div>
            <p className="text-lg leading-relaxed">
              The automation freed up the equivalent of adding a part-time admin without the overhead, allowing Alana to focus on billable client work and strategic growth.
            </p>
          </section>

          <section className="bg-dark-700 rounded-2xl border border-primary/30 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">What Alana Says</h2>
            <blockquote className="text-xl italic text-gray-300 border-l-4 border-primary pl-6 py-2">
              "Call Dave at Good Breeze AI. He built us a simple flow that handles intake, auto-fills proposals, and keeps follow-ups on track so nothing slips."
            </blockquote>
            <p className="text-gray-400 mt-4">— Alana Shaw, Consultant</p>
          </section>

          <section className="bg-gradient-to-br from-primary/10 to-accent-purple/10 rounded-2xl border border-primary/30 p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready for Similar Results?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Book a free strategy call to discuss how automation can transform your intake and proposal processes.
            </p>
            <Link href="/contact" className="inline-block px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105">
              Book Your Strategy Call
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
