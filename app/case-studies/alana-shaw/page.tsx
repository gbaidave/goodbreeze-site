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
              When Alana first reached out, she was drowning. Every new lead meant hours of back and forth emails just to get basic information. Proposals that should take 30 minutes were eating 3 to 4 hours because she had to manually copy data from intake forms into Word templates. Worse, her follow up system was "whenever I remember to check my calendar," which meant 30% of prospects never heard back at all.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              The breaking point came when she lost a $45K contract because she took 48 hours to respond with a proposal. The prospect had already signed with a competitor who sent theirs the same day.
            </p>
            <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">The Daily Reality:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary">•</span>
                  <span>24 to 48 hour response times while competitors responded in minutes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">•</span>
                  <span>3 to 4 hours per proposal spent copying and pasting the same information</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">•</span>
                  <span>30% of leads never received follow-ups because they slipped through the cracks</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">•</span>
                  <span>Inconsistent proposal quality, some great, some rushed</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-accent-purple text-2xl">🔄</span>
              How We Figured It Out
            </h2>
            <p className="text-lg leading-relaxed mb-6">
              We asked Alana to walk us through her last three proposals, not just the final docs, but every email, every question, every piece of information she needed. That's when the pattern emerged.
            </p>

            <div className="bg-dark-700 rounded-xl border border-primary/20 p-8 mb-6">
              <h4 className="font-bold text-white mb-4">The Intake Workflow (Before & After)</h4>
              <svg viewBox="0 0 900 300" className="w-full h-auto mb-4" role="img" aria-label="Workflow comparison diagram">
                <text x="50" y="30" fill="#9ca3af" fontSize="14" fontWeight="bold">BEFORE (Manual)</text>
                <rect x="50" y="50" width="120" height="60" rx="8" fill="#21272e" stroke="#00adb5" strokeWidth="2"/>
                <text x="110" y="85" fill="#fff" fontSize="12" textAnchor="middle">Lead fills form</text>
                <path d="M 170 80 L 230 80" stroke="#9ca3af" strokeWidth="2" markerEnd="url(#arrowgray)"/>
                <text x="200" y="70" fill="#9ca3af" fontSize="10" textAnchor="middle">24 to 48hrs</text>
                <rect x="230" y="50" width="120" height="60" rx="8" fill="#21272e" stroke="#00adb5" strokeWidth="2"/>
                <text x="290" y="75" fill="#fff" fontSize="11" textAnchor="middle">Alana reads email,</text>
                <text x="290" y="90" fill="#fff" fontSize="11" textAnchor="middle">copies to Word</text>
                <path d="M 350 80 L 410 80" stroke="#9ca3af" strokeWidth="2" markerEnd="url(#arrowgray)"/>
                <text x="380" y="70" fill="#9ca3af" fontSize="10" textAnchor="middle">3 to 4hrs</text>
                <rect x="410" y="50" width="120" height="60" rx="8" fill="#21272e" stroke="#00adb5" strokeWidth="2"/>
                <text x="470" y="75" fill="#fff" fontSize="11" textAnchor="middle">Manual proposal</text>
                <text x="470" y="90" fill="#fff" fontSize="11" textAnchor="middle">creation</text>
                <path d="M 530 80 L 590 80" stroke="#9ca3af" strokeWidth="2" markerEnd="url(#arrowgray)"/>
                <text x="560" y="70" fill="#9ca3af" fontSize="10" textAnchor="middle">?</text>
                <rect x="590" y="50" width="120" height="60" rx="8" fill="#21272e" stroke="#ef4444" strokeWidth="2"/>
                <text x="650" y="75" fill="#ef4444" fontSize="11" textAnchor="middle">Follow up</text>
                <text x="650" y="90" fill="#ef4444" fontSize="11" textAnchor="middle">(or forget)</text>

                <text x="50" y="170" fill="#9ca3af" fontSize="14" fontWeight="bold">AFTER (Automated)</text>
                <rect x="50" y="190" width="120" height="60" rx="8" fill="#21272e" stroke="#00adb5" strokeWidth="2"/>
                <text x="110" y="225" fill="#fff" fontSize="12" textAnchor="middle">Lead fills form</text>
                <path d="M 170 220 L 230 220" stroke="#00adb5" strokeWidth="2" markerEnd="url(#arrowprimary)"/>
                <text x="200" y="210" fill="#00adb5" fontSize="10" textAnchor="middle">instant</text>
                <rect x="230" y="190" width="120" height="60" rx="8" fill="#21272e" stroke="#00adb5" strokeWidth="2"/>
                <text x="290" y="215" fill="#fff" fontSize="11" textAnchor="middle">Auto populate</text>
                <text x="290" y="230" fill="#fff" fontSize="11" textAnchor="middle">template</text>
                <path d="M 350 220 L 410 220" stroke="#00adb5" strokeWidth="2" markerEnd="url(#arrowprimary)"/>
                <text x="380" y="210" fill="#00adb5" fontSize="10" textAnchor="middle">instant</text>
                <rect x="410" y="190" width="120" height="60" rx="8" fill="#21272e" stroke="#00adb5" strokeWidth="2"/>
                <text x="470" y="215" fill="#fff" fontSize="11" textAnchor="middle">Send proposal</text>
                <text x="470" y="230" fill="#fff" fontSize="11" textAnchor="middle">+ confirm email</text>
                <path d="M 530 220 L 590 220" stroke="#00adb5" strokeWidth="2" markerEnd="url(#arrowprimary)"/>
                <text x="560" y="210" fill="#00adb5" fontSize="10" textAnchor="middle">auto</text>
                <rect x="590" y="190" width="120" height="60" rx="8" fill="#21272e" stroke="#10b981" strokeWidth="2"/>
                <text x="650" y="215" fill="#10b981" fontSize="11" textAnchor="middle">Follow up</text>
                <text x="650" y="230" fill="#10b981" fontSize="11" textAnchor="middle">days 3, 7, 14</text>

                <defs>
                  <marker id="arrowgray" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill="#9ca3af" />
                  </marker>
                  <marker id="arrowprimary" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill="#00adb5" />
                  </marker>
                </defs>
              </svg>
              <p className="text-sm text-gray-400 italic">From 2 to 3 days and manual work to instant, automated delivery</p>
            </div>

            <p className="text-lg leading-relaxed mb-4">
              She was asking the same questions every time: company size, service needed, budget range, timeline. Each proposal followed the same template, just different names and numbers. The follow ups were supposed to happen at day 3, day 7, and day 14, but only if Alana remembered to set calendar reminders.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              So we built a system that captures everything once, populates the right template automatically, and handles follow-ups like clockwork. Two weeks from start to finish.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-primary text-2xl">⚙️</span>
              The Solution
            </h2>
            <p className="text-lg leading-relaxed mb-6">
              Every intake form submission now triggers an instant confirmation email, auto fills the proposal template based on service type, and queues follow up reminders at exactly day 3, 7, and 14. Everything logs to her CRM automatically. No manual entry, no missed follow ups.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <h4 className="font-bold text-white mb-2">Instant Response</h4>
                <p className="text-sm">Form submission triggers immediate confirmation with next steps</p>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <h4 className="font-bold text-white mb-2">Smart Templates</h4>
                <p className="text-sm">Service type determines template, data auto populates, pricing rules apply</p>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <h4 className="font-bold text-white mb-2">Scheduled Follow Ups</h4>
                <p className="text-sm">Automated reminders at day 3, 7, 14, escalates after 3 attempts</p>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <h4 className="font-bold text-white mb-2">CRM Sync</h4>
                <p className="text-sm">All interactions logged automatically, status updates in real-time</p>
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
