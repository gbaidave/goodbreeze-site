import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Rafael Moreno Case Study | Good Breeze AI",
  description: "How a CPA firm cut month-end close time in half with automated document collection",
};

export default function RafaelMorenoCaseStudy() {
  return (
    <div className="min-h-screen bg-dark py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-gray-400 hover:text-primary transition-colors">Home</Link>
          <span className="text-gray-600 mx-2">/</span>
          <Link href="/case-studies" className="text-gray-400 hover:text-primary transition-colors">Case Studies</Link>
          <span className="text-gray-600 mx-2">/</span>
          <span className="text-gray-300">Rafael Moreno</span>
        </div>

        <div className="bg-gradient-to-br from-[#3b82f6]/20 via-[#a855f7]/20 to-[#00adb5]/10 rounded-2xl p-12 mb-12">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative w-24 h-24 rounded-full border-2 border-primary/30 overflow-hidden flex-shrink-0">
              <Image src="/images/avatars/rafael-moreno.png" alt="Rafael Moreno" width={96} height={96} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Rafael Moreno</h1>
              <p className="text-xl text-primary">CPA</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-dark/50 rounded-xl border border-primary/20 p-6">
              <div className="text-sm text-gray-400 mb-2">Industry</div>
              <div className="text-white font-semibold">Accounting Services</div>
            </div>
            <div className="bg-dark/50 rounded-xl border border-primary/20 p-6">
              <div className="text-sm text-gray-400 mb-2">Clients</div>
              <div className="text-white font-semibold">50+ SMB Clients</div>
            </div>
            <div className="bg-dark/50 rounded-xl border border-primary/20 p-6">
              <div className="text-sm text-gray-400 mb-2">Team Size</div>
              <div className="text-white font-semibold">5 Accountants</div>
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
              Rafael's accounting firm dreaded month end close. Collecting documents from clients required endless email chains and phone calls. Manual reminders were inconsistent, exceptions got buried, and close processes routinely stretched 2-3 weeks due to missing information and manual reconciliation steps.
            </p>
            <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
              <h3 className="text-lg font-bold text-white mb-3">The Month-End Nightmare:</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">• 14-21 day close process (industry standard: 5-7 days)</li>
                <li className="flex items-start gap-2">• 50+ email threads per client for document requests</li>
                <li className="flex items-start gap-2">• Manual tracking of who submitted what in spreadsheets</li>
                <li className="flex items-start gap-2">• Exception handling required senior accountant review</li>
                <li className="flex items-start gap-2">• Staff burnout from repetitive follow-up work</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-primary text-2xl">⚙️</span>
              The Automation System
            </h2>
            <p className="text-lg leading-relaxed mb-4">
              We automated the entire document collection workflow with scheduled reminders sent at optimal times, automated escalation for non responders, exception flagging based on predefined rules, and integration with their accounting software for automatic reconciliation of standard transactions.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <h4 className="font-bold text-white mb-2">Scheduled Reminders</h4>
                <p className="text-sm">Automated emails sent 5, 3, and 1 days before month-end deadline</p>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <h4 className="font-bold text-white mb-2">Smart Escalation</h4>
                <p className="text-sm">Non-responders automatically escalated to account manager</p>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <h4 className="font-bold text-white mb-2">Exception Detection</h4>
                <p className="text-sm">AI flags unusual transactions for review based on historical patterns</p>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <h4 className="font-bold text-white mb-2">Auto-Reconciliation</h4>
                <p className="text-sm">Standard transactions reconciled automatically via accounting software integration</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-green-400 text-2xl">📈</span>
              The Results
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">4 weeks</div>
                <div className="text-sm text-gray-400">Implementation + Training</div>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">95%</div>
                <div className="text-sm text-gray-400">On-Time Submissions</div>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">7 days</div>
                <div className="text-sm text-gray-400">New Close Time</div>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">40+ hrs</div>
                <div className="text-sm text-gray-400">Freed Per Month</div>
              </div>
            </div>
            <p className="text-lg leading-relaxed mb-4">
              Month-end close went from 14-21 days to just 7 days, freeing up 40+ hours per month that the team now spends on higher-value advisory services.
            </p>
            <div className="bg-gradient-to-br from-primary/10 to-accent-blue/10 rounded-xl border border-primary/30 p-6">
              <h4 className="font-bold text-white mb-2">Business Impact:</h4>
              <p>The time savings allowed Rafael to take on 8 new clients without hiring additional staff, generating $120K in additional annual revenue.</p>
            </div>
          </section>

          <section className="bg-dark-700 rounded-2xl border border-primary/30 p-8">
            <blockquote className="text-xl italic text-gray-300 border-l-4 border-primary pl-6 py-2">
              "I'd recommend Dave in a heartbeat. His automations collect client documents, remind people nicely, and flag exceptions so month-end actually ends."
            </blockquote>
            <p className="text-gray-400 mt-4">— Rafael Moreno, CPA</p>
          </section>

          <section className="bg-gradient-to-br from-primary/10 to-accent-purple/10 rounded-2xl border border-primary/30 p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Tired of Manual Document Chasing?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Let's automate your recurring workflows and free up your team for higher-value work.
            </p>
            <Link href="/contact" className="inline-block px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300">
              Book Your Strategy Call
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
