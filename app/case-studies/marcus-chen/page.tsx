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
              Marcus was losing deals because his team couldn't keep up with lead follow ups and property alerts. Manual CRM updates meant data was always outdated, leads received inconsistent communication, and hot properties weren't matched to interested buyers fast enough. In real estate, speed wins deals.
            </p>
            <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
              <h3 className="text-lg font-bold text-white mb-3">Critical Issues:</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">• Average 18-24 hour lead response time (competitors: minutes)</li>
                <li className="flex items-start gap-2">• Manual property matching took 2-3 hours per new listing</li>
                <li className="flex items-start gap-2">• CRM data accuracy below 60% due to manual entry</li>
                <li className="flex items-start gap-2">• Leads slipped through cracks during agent vacations</li>
                <li className="flex items-start gap-2">• No systematic nurture for cold leads</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-primary text-2xl">⚙️</span>
              The Solution
            </h2>
            <p className="text-lg leading-relaxed mb-4">
              We built an automated lead management system that sends instant follow ups based on lead source and interest level, triggers property alerts when new listings match buyer criteria, updates the CRM automatically as leads progress through the pipeline, and sequences nurture emails for cold leads to keep them warm.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <h4 className="font-bold text-white mb-2">Instant Lead Response</h4>
                <p className="text-sm">Automated follow-up within 60 seconds of inquiry with personalized messaging</p>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <h4 className="font-bold text-white mb-2">Smart Property Matching</h4>
                <p className="text-sm">AI matches new listings to buyer preferences and sends instant alerts</p>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <h4 className="font-bold text-white mb-2">Auto-CRM Updates</h4>
                <p className="text-sm">Every interaction logged automatically with 100% accuracy</p>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <h4 className="font-bold text-white mb-2">Nurture Sequences</h4>
                <p className="text-sm">Cold leads receive value-driven emails to stay top-of-mind</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-accent-purple text-2xl">🔄</span>
              Our Process
            </h2>
            <p className="text-lg leading-relaxed mb-6">
              We implemented our automation methodology to give Marcus's team a competitive edge in speed to lead:
            </p>
            <div className="space-y-4">
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">1</div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Discovery & Audit (Week 1-2)</h4>
                    <p className="text-sm text-gray-300">Mapped current lead flow and CRM update processes, analyzed buyer preferences and property matching accuracy, identified gaps in follow-up and nurture sequences</p>
                  </div>
                </div>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">2</div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Roadmap & Design (Week 2-3)</h4>
                    <p className="text-sm text-gray-300">Designed instant response templates based on lead source, built AI matching logic for properties and buyers, created nurture email sequences for different buyer stages</p>
                  </div>
                </div>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">3</div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Build & Implementation (Week 3-5)</h4>
                    <p className="text-sm text-gray-300">Built automated lead response system with 60-second SLA, configured property matching engine with AI preferences, integrated CRM for automatic logging and status updates, deployed nurture sequences for cold lead warming</p>
                  </div>
                </div>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">4</div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Optimize & Handoff (Ongoing)</h4>
                    <p className="text-sm text-gray-300">Trained 6-agent team on system usage and overrides, fine-tuned property matching based on conversion data, established reporting dashboard for pipeline visibility</p>
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
