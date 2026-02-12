import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Marcus Chen Case Study | Good Breeze AI",
  description: "How a real estate broker closed 30% more deals with automated lead management",
};

export default function MarcusChenCaseStudy() {
  return (
    <div className="min-h-screen bg-dark py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-gray-400 hover:text-primary transition-colors">Home</Link>
          <span className="text-gray-600 mx-2">/</span>
          <Link href="/case-studies" className="text-gray-400 hover:text-primary transition-colors">Case Studies</Link>
          <span className="text-gray-600 mx-2">/</span>
          <span className="text-gray-300">Marcus Chen</span>
        </div>

        <div className="bg-gradient-to-br from-[#3b82f6]/20 via-[#a855f7]/20 to-[#00adb5]/10 rounded-2xl p-12 mb-12">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative w-24 h-24 rounded-full border-2 border-primary/30 overflow-hidden flex-shrink-0">
              <Image src="/images/avatars/marcus-chen.png" alt="Marcus Chen" width={96} height={96} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Marcus Chen</h1>
              <p className="text-xl text-primary">Real Estate Broker</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-dark/50 rounded-xl border border-primary/20 p-6">
              <div className="text-sm text-gray-400 mb-2">Industry</div>
              <div className="text-white font-semibold">Residential Real Estate</div>
            </div>
            <div className="bg-dark/50 rounded-xl border border-primary/20 p-6">
              <div className="text-sm text-gray-400 mb-2">Market</div>
              <div className="text-white font-semibold">Austin, TX Metro</div>
            </div>
            <div className="bg-dark/50 rounded-xl border border-primary/20 p-6">
              <div className="text-sm text-gray-400 mb-2">Team Size</div>
              <div className="text-white font-semibold">6 Agents</div>
            </div>
          </div>
        </div>

        <div className="space-y-12 text-gray-300">
          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-red-400 text-2xl">⚠️</span>
              The Challenge
            </h2>
            <p className="text-lg leading-relaxed mb-4">
              "We're bleeding deals to agents who text back in 30 seconds," Marcus told us. In Austin's red hot real estate market, buyers expect instant gratification. When a perfect property hits the market, the agent who alerts their buyer first gets the showing. And the showing usually gets the deal.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Marcus's team was manually matching properties to buyers, which took 2 to 3 hours per listing. By the time they sent alerts, other agents had already scheduled showings. Meanwhile, lead response averaged 18 to 24 hours, an eternity when competitors responded in minutes. And the CRM? Less than 60% accurate because agents forgot to log interactions.
            </p>
            <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
              <h3 className="text-lg font-bold text-white mb-3">The Speed Problem:</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">• 18 to 24 hour lead response while competitors responded in under 60 seconds</li>
                <li className="flex items-start gap-2">• 2 to 3 hours to manually match each new listing to buyer preferences</li>
                <li className="flex items-start gap-2">• CRM only 60% accurate, agents too busy to update it</li>
                <li className="flex items-start gap-2">• Leads fell through when agents went on vacation</li>
                <li className="flex items-start gap-2">• Cold leads never got nurtured, just went stale</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-accent-purple text-2xl">🔄</span>
              How We Built Speed to Lead
            </h2>
            <p className="text-lg leading-relaxed mb-6">
              We asked Marcus to show us his buyer intake form and his MLS feed. "What criteria matter most?" we asked. He pulled up a buyer profile: 3 bed, 2 bath, under $500K, north Austin, near good schools. "Every buyer fills this out," he said. "Then we manually search MLS and email matches."
            </p>

            <div className="bg-dark-700 rounded-xl border border-primary/20 p-8 mb-6">
              <h4 className="font-bold text-white mb-4">Property Matching Flow</h4>
              <svg viewBox="0 0 750 280" className="w-full h-auto mb-4" role="img" aria-label="Property matching automation diagram">
                <text x="375" y="25" fill="#fff" fontSize="15" fontWeight="bold" textAnchor="middle">New Listing Appears on MLS</text>

                <rect x="50" y="50" width="280" height="80" rx="8" fill="#21272e" stroke="#ef4444" strokeWidth="2"/>
                <text x="190" y="75" fill="#ef4444" fontSize="13" fontWeight="bold" textAnchor="middle">BEFORE (Manual)</text>
                <text x="190" y="95" fill="#fff" fontSize="11" textAnchor="middle">Agent searches MLS</text>
                <text x="190" y="110" fill="#fff" fontSize="11" textAnchor="middle">Manually checks buyer preferences</text>
                <text x="190" y="125" fill="#9ca3af" fontSize="10" textAnchor="middle">2 to 3 hours delay</text>

                <rect x="420" y="50" width="280" height="80" rx="8" fill="#21272e" stroke="#10b981" strokeWidth="2"/>
                <text x="560" y="75" fill="#10b981" fontSize="13" fontWeight="bold" textAnchor="middle">AFTER (Automated)</text>
                <text x="560" y="95" fill="#fff" fontSize="11" textAnchor="middle">AI matches criteria instantly</text>
                <text x="560" y="110" fill="#fff" fontSize="11" textAnchor="middle">Sends personalized alerts</text>
                <text x="560" y="125" fill="#00adb5" fontSize="10" textAnchor="middle">Under 60 seconds</text>

                <rect x="140" y="160" width="100" height="50" rx="6" fill="#21272e" stroke="#00adb5" strokeWidth="2"/>
                <text x="190" y="185" fill="#fff" fontSize="11" textAnchor="middle">Buyer gets alert</text>
                <text x="190" y="200" fill="#9ca3af" fontSize="9" textAnchor="middle">(too late)</text>

                <rect x="510" y="160" width="100" height="50" rx="6" fill="#21272e" stroke="#10b981" strokeWidth="2"/>
                <text x="560" y="185" fill="#fff" fontSize="11" textAnchor="middle">Buyer gets alert</text>
                <text x="560" y="200" fill="#10b981" fontSize="9" textAnchor="middle">(instant)</text>

                <path d="M 190 130 L 190 160" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowred)"/>
                <path d="M 560 130 L 560 160" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowgreen)"/>

                <rect x="440" y="235" width="240" height="35" rx="6" fill="#00adb5" fillOpacity="0.2" stroke="#00adb5" strokeWidth="2"/>
                <text x="560" y="258" fill="#10b981" fontSize="13" fontWeight="bold" textAnchor="middle">First showing = First offer</text>

                <defs>
                  <marker id="arrowred" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
                  </marker>
                  <marker id="arrowgreen" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill="#10b981" />
                  </marker>
                </defs>
              </svg>
              <p className="text-sm text-gray-400 italic">Speed wins in real estate, instant matching beats manual searching every time</p>
            </div>

            <p className="text-lg leading-relaxed mb-4">
              That was the insight. We did not need a complex AI, we just needed to connect his MLS feed to buyer preferences and automate the match. New listing comes in? System checks all buyer profiles in under 60 seconds, sends personalized alerts with photos and scheduling links, and logs everything to the CRM automatically.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Same thing for new leads. Form submission triggers instant text and email with next steps, buyer preferences get captured, and follow ups happen on days 1, 3, 7, and 14 without anyone thinking about it.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-primary text-2xl">⚙️</span>
              The Solution
            </h2>
            <p className="text-lg leading-relaxed mb-4">
              Now every new lead gets instant follow up within 60 seconds. Every new MLS listing gets matched to buyer preferences automatically and alerts go out immediately. The CRM updates itself, no manual logging. And cold leads get nurtured with value driven content so they are warm when they are ready to buy.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <h4 className="font-bold text-white mb-2">Instant Lead Response</h4>
                <p className="text-sm">Text and email within 60 seconds with personalized next steps</p>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <h4 className="font-bold text-white mb-2">Smart Property Matching</h4>
                <p className="text-sm">AI matches MLS listings to buyer criteria, alerts in under 60 seconds</p>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <h4 className="font-bold text-white mb-2">Auto CRM Updates</h4>
                <p className="text-sm">Every interaction logged automatically, 100% data accuracy</p>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <h4 className="font-bold text-white mb-2">Nurture Sequences</h4>
                <p className="text-sm">Cold leads get value content on days 1, 3, 7, 14 — stay top-of-mind</p>
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
                <div className="text-3xl font-bold text-primary mb-2">5 weeks</div>
                <div className="text-sm text-gray-400">Full Deployment</div>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <div className="text-sm text-gray-400">CRM Accuracy</div>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">30%</div>
                <div className="text-sm text-gray-400">More Deals Closed</div>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">$420K</div>
                <div className="text-sm text-gray-400">Added Annual Commission</div>
              </div>
            </div>
            <p className="text-lg leading-relaxed mb-4">
              With instant property matching and automated follow-ups, Marcus's team closed 30% more deals with the same number of agents, adding $420K in annual commission revenue.
            </p>
            <div className="bg-gradient-to-br from-primary/10 to-accent-blue/10 rounded-xl border border-primary/30 p-6">
              <h4 className="font-bold text-white mb-2">Speed to Lead:</h4>
              <p>Response time dropped from 18+ hours to under 1 minute, giving the team a decisive competitive advantage in hot markets.</p>
            </div>
          </section>

          <section className="bg-dark-700 rounded-2xl border border-primary/30 p-8">
            <blockquote className="text-xl italic text-gray-300 border-l-4 border-primary pl-6 py-2">
              "Good Breeze AI transformed how we handle leads. Automated follow-ups, instant property alerts, and seamless CRM updates mean we close more deals with less manual work."
            </blockquote>
            <p className="text-gray-400 mt-4">— Marcus Chen, Real Estate Broker</p>
          </section>

          <section className="bg-gradient-to-br from-primary/10 to-accent-purple/10 rounded-2xl border border-primary/30 p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Win More Deals With Speed</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Book a strategy call to learn how automated lead management can give you a competitive edge.
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
