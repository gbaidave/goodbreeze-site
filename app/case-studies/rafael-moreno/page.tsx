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
              "Month end is a war zone," Rafael said. Every month, the same nightmare: 50+ clients who needed to submit receipts, invoices, and bank statements. His team sent initial requests, then follow up emails, then phone calls. Some clients responded immediately. Others took weeks. Meanwhile, Rafael's accountants could not close the books until every document was in.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              The industry standard is 5 to 7 days for month end close. Rafael's firm was averaging 14 to 21 days. His senior accountants were spending hours chasing documents instead of doing actual accounting work. And when unusual transactions appeared, they often got missed in the chaos until someone noticed weeks later.
            </p>
            <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
              <h3 className="text-lg font-bold text-white mb-3">The Month End Grind:</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">• 14 to 21 days to close books (should be 5 to 7 days)</li>
                <li className="flex items-start gap-2">• 50+ email threads per client, "Did you send the receipts yet?"</li>
                <li className="flex items-start gap-2">• Manual spreadsheet tracking of who submitted what</li>
                <li className="flex items-start gap-2">• Exception handling ate senior accountant time</li>
                <li className="flex items-start gap-2">• Team burnout from repetitive follow-ups</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-accent-purple text-2xl">🔄</span>
              How We Cut Close Time in Half
            </h2>
            <p className="text-lg leading-relaxed mb-6">
              We sat down with Rafael's team during month end close. Watched them work for half a day. The pattern was obvious: same questions, same documents, same reminder emails, just copy paste with different client names. "How do you know who to chase?" we asked. They pointed at a shared Excel spreadsheet.
            </p>

            <div className="bg-dark-700 rounded-xl border border-primary/20 p-8 mb-6">
              <h4 className="font-bold text-white mb-4 text-center">Month End Close Timeline</h4>
              <p className="text-base text-white font-semibold mb-2 text-center">BEFORE: 14 to 21 Days</p>
              <p className="text-xs text-gray-400 mb-4 text-center">Manual document chasing, email threads, spreadsheet tracking</p>
              <svg viewBox="0 0 800 240" className="w-full h-auto mb-6" role="img" aria-label="Month end close timeline comparison">
                <rect x="125" y="20" width="550" height="50" rx="6" fill="#ef4444" fillOpacity="0.2" stroke="#ef4444" strokeWidth="2"/>

                <rect x="151" y="35" width="90" height="20" rx="4" fill="#fbbf24" fillOpacity="0.3" stroke="#fbbf24" strokeWidth="1"/>
                <text x="196" y="50" fill="#fbbf24" fontSize="9" textAnchor="middle">Initial request</text>

                <rect x="253" y="35" width="90" height="20" rx="4" fill="#fbbf24" fillOpacity="0.3" stroke="#fbbf24" strokeWidth="1"/>
                <text x="298" y="50" fill="#fbbf24" fontSize="9" textAnchor="middle">Follow up 1</text>

                <rect x="355" y="35" width="90" height="20" rx="4" fill="#fbbf24" fillOpacity="0.3" stroke="#fbbf24" strokeWidth="1"/>
                <text x="400" y="50" fill="#fbbf24" fontSize="9" textAnchor="middle">Follow up 2</text>

                <rect x="457" y="35" width="90" height="20" rx="4" fill="#ef4444" fillOpacity="0.3" stroke="#ef4444" strokeWidth="1"/>
                <text x="502" y="50" fill="#ef4444" fontSize="9" textAnchor="middle">Phone calls</text>

                <rect x="559" y="35" width="90" height="20" rx="4" fill="#ef4444" fillOpacity="0.3" stroke="#ef4444" strokeWidth="1"/>
                <text x="604" y="50" fill="#ef4444" fontSize="9" textAnchor="middle">Manual reconcile</text>

                <text x="400" y="120" fill="#fff" fontSize="16" fontWeight="bold" textAnchor="middle">AFTER: 7 Days</text>
                <text x="400" y="140" fill="#9ca3af" fontSize="11" textAnchor="middle">Automated reminders, instant tracking, AI exception flagging</text>

                <rect x="225" y="160" width="350" height="50" rx="6" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="2"/>

                <rect x="255" y="175" width="65" height="20" rx="4" fill="#00adb5" fillOpacity="0.3" stroke="#00adb5" strokeWidth="1"/>
                <text x="287" y="190" fill="#00adb5" fontSize="9" textAnchor="middle">Day -5</text>

                <rect x="330" y="175" width="65" height="20" rx="4" fill="#00adb5" fillOpacity="0.3" stroke="#00adb5" strokeWidth="1"/>
                <text x="362" y="190" fill="#00adb5" fontSize="9" textAnchor="middle">Day -3</text>

                <rect x="405" y="175" width="65" height="20" rx="4" fill="#00adb5" fillOpacity="0.3" stroke="#00adb5" strokeWidth="1"/>
                <text x="437" y="190" fill="#00adb5" fontSize="9" textAnchor="middle">Day -1</text>

                <rect x="480" y="175" width="65" height="20" rx="4" fill="#10b981" fillOpacity="0.3" stroke="#10b981" strokeWidth="1"/>
                <text x="512" y="190" fill="#10b981" fontSize="9" textAnchor="middle">Auto reconcile</text>
              </svg>
              <p className="text-sm text-primary font-semibold mb-2">95% on time submission, 40+ hours saved per month</p>
              <p className="text-sm text-gray-400 italic">Automated reminders and smart escalation cut close time from 14 to 21 days to 7 days</p>
            </div>

            <p className="text-lg leading-relaxed mb-4">
              We built reminders that send automatically 5 days before month end, then 3 days, then 1 day. If a client does not respond after three attempts, it escalates to their account manager, no manual tracking needed. The system knows who submitted what, flags missing documents, and even detects unusual transactions based on historical patterns.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Standard transactions? They reconcile automatically through the accounting software integration. Exceptions get flagged for review. Four weeks later, Rafael's close time dropped to 7 days, right in line with industry standards.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-primary text-2xl">⚙️</span>
              The Automation System
            </h2>
            <p className="text-lg leading-relaxed mb-4">
              Now document requests go out automatically at day -5, -3, and -1. Non responders escalate to account managers after three attempts. AI flags unusual transactions for review based on each client's historical patterns. Standard transactions reconcile automatically through their accounting software. The team sees everything in a real time dashboard, no more spreadsheets.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <h4 className="font-bold text-white mb-2">Scheduled Reminders</h4>
                <p className="text-sm">Automated emails at day -5, -3, -1 with personalized document lists</p>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <h4 className="font-bold text-white mb-2">Smart Escalation</h4>
                <p className="text-sm">Non responders escalate to account manager after 3 attempts</p>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <h4 className="font-bold text-white mb-2">Exception Detection</h4>
                <p className="text-sm">AI flags unusual transactions based on historical patterns</p>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <h4 className="font-bold text-white mb-2">Auto Reconciliation</h4>
                <p className="text-sm">Standard transactions reconciled automatically via software integration</p>
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
