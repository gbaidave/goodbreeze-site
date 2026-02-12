import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Julia Lawson Case Study | Good Breeze AI",
  description: "How an attorney recovered 30% of lost leads with automated client intake",
};

export default function JuliaLawsonCaseStudy() {
  return (
    <div className="min-h-screen bg-dark py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-gray-400 hover:text-primary transition-colors">Home</Link>
          <span className="text-gray-600 mx-2">/</span>
          <Link href="/case-studies" className="text-gray-400 hover:text-primary transition-colors">Case Studies</Link>
          <span className="text-gray-600 mx-2">/</span>
          <span className="text-gray-300">Julia Lawson</span>
        </div>

        <div className="bg-gradient-to-br from-[#3b82f6]/20 via-[#a855f7]/20 to-[#00adb5]/10 rounded-2xl p-12 mb-12">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative w-24 h-24 rounded-full border-2 border-primary/30 overflow-hidden flex-shrink-0">
              <Image src="/images/avatars/julia-lawson.png" alt="Julia Lawson" width={96} height={96} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Julia Lawson</h1>
              <p className="text-xl text-primary">Attorney</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-dark/50 rounded-xl border border-primary/20 p-6">
              <div className="text-sm text-gray-400 mb-2">Industry</div>
              <div className="text-white font-semibold">Legal Services</div>
            </div>
            <div className="bg-dark/50 rounded-xl border border-primary/20 p-6">
              <div className="text-sm text-gray-400 mb-2">Practice Area</div>
              <div className="text-white font-semibold">Family Law</div>
            </div>
            <div className="bg-dark/50 rounded-xl border border-primary/20 p-6">
              <div className="text-sm text-gray-400 mb-2">Team Size</div>
              <div className="text-white font-semibold">3 Attorneys + Support Staff</div>
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
              Julia called us frustrated. "I just lost another client," she said. Someone had filled out the contact form at 7 PM on Friday. By the time her assistant called back Monday morning, they had already retained another attorney who responded immediately with an automated booking link.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              The math was brutal: 40% of leads never got callbacks because they came in after hours or when staff was tied up. Every consultation required 5 to 7 emails just to find a time that worked. And Julia had no idea which leads were hot, which were warm, or which had gone cold because nobody followed up.
            </p>
            <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
              <h3 className="text-lg font-bold text-white mb-3">The Leaky Funnel:</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">• 40% of leads never received callbacks</li>
                <li className="flex items-start gap-2">• After hours inquiries had 0% conversion, pure lost revenue</li>
                <li className="flex items-start gap-2">• 5 to 7 back and forth emails just to schedule one consultation</li>
                <li className="flex items-start gap-2">• Zero pipeline visibility, could not tell who needed follow up</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-accent-purple text-2xl">🔄</span>
              How We Fixed It
            </h2>
            <p className="text-lg leading-relaxed mb-6">
              We started by asking Julia to pull up her last 50 leads and tell us what happened to each one. We color coded them: green for retained, yellow for in progress, red for lost. The pattern jumped out immediately. Most reds came in after 5 PM or on weekends.
            </p>

            <div className="bg-dark-700 rounded-xl border border-primary/20 p-8 mb-6">
              <h4 className="font-bold text-white mb-4">Lead Recovery Funnel</h4>
              <svg viewBox="0 0 700 340" className="w-full h-auto mb-4" role="img" aria-label="Lead recovery funnel diagram">
                <text x="350" y="30" fill="#fff" fontSize="16" fontWeight="bold" textAnchor="middle">100 Monthly Leads</text>

                <polygon points="200,60 500,60 450,150 250,150" fill="#ef4444" fillOpacity="0.3" stroke="#ef4444" strokeWidth="2"/>
                <text x="350" y="100" fill="#fff" fontSize="14" textAnchor="middle">BEFORE: 40 Lost</text>
                <text x="350" y="120" fill="#9ca3af" fontSize="10" textAnchor="middle">(No callback / After hours /</text>
                <text x="350" y="135" fill="#9ca3af" fontSize="10" textAnchor="middle">Slow response)</text>

                <polygon points="250,150 450,150 400,240 300,240" fill="#fbbf24" fillOpacity="0.3" stroke="#fbbf24" strokeWidth="2"/>
                <text x="350" y="190" fill="#fff" fontSize="14" textAnchor="middle">60 Contacted</text>
                <text x="350" y="210" fill="#9ca3af" fontSize="10" textAnchor="middle">(But scheduling took</text>
                <text x="350" y="225" fill="#9ca3af" fontSize="10" textAnchor="middle">5 to 7 emails)</text>

                <polygon points="300,240 400,240 380,305 320,305" fill="#10b981" fillOpacity="0.3" stroke="#10b981" strokeWidth="2"/>
                <text x="350" y="278" fill="#fff" fontSize="14" textAnchor="middle">35 Retained</text>

                <rect x="520" y="140" width="160" height="140" rx="8" fill="#21272e" stroke="#00adb5" strokeWidth="2"/>
                <text x="600" y="165" fill="#00adb5" fontSize="14" fontWeight="bold" textAnchor="middle">AFTER:</text>
                <text x="600" y="190" fill="#10b981" fontSize="20" fontWeight="bold" textAnchor="middle">95%</text>
                <text x="600" y="210" fill="#fff" fontSize="12" textAnchor="middle">get instant response</text>
                <text x="600" y="235" fill="#10b981" fontSize="20" fontWeight="bold" textAnchor="middle">65</text>
                <text x="600" y="255" fill="#fff" fontSize="12" textAnchor="middle">retained clients</text>
                <text x="600" y="270" fill="#9ca3af" fontSize="10" textAnchor="middle">(+30% conversion)</text>
              </svg>
              <p className="text-sm text-gray-400 italic">From 35% to 65% conversion by capturing after hours leads and instant scheduling</p>
            </div>

            <p className="text-lg leading-relaxed mb-4">
              Then we asked, "What questions do people ask when they call?" She rattled off the same five questions every time: Do you handle my case type? What's the cost? How long does it take? What do I need to bring? Can I schedule a consultation?
            </p>
            <p className="text-lg leading-relaxed mb-4">
              We built an AI assistant that answers those questions 24/7, captures their information, and drops a Calendly link right in the confirmation email. Now leads book themselves instantly, and Julia's team only handles actual consultations, not scheduling ping pong.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-primary text-2xl">⚙️</span>
              The Solution
            </h2>
            <p className="text-lg leading-relaxed mb-4">
              Every inquiry, whether 3 PM on Tuesday or 9 PM on Saturday, gets an instant response. The AI assistant answers common questions, captures case details, and sends a booking link. The lead schedules their own consultation, receives confirmation, and enters Julia's CRM automatically. No manual work, no missed follow ups.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <h4 className="font-bold text-white mb-2">24/7 Lead Capture</h4>
                <p className="text-sm">AI assistant answers common questions and collects case details any time</p>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <h4 className="font-bold text-white mb-2">Instant Scheduling</h4>
                <p className="text-sm">Calendar link in confirmation email, prospects book themselves</p>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <h4 className="font-bold text-white mb-2">Smart Follow Ups</h4>
                <p className="text-sm">Automated sequences based on lead source and urgency, 95% engagement</p>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <h4 className="font-bold text-white mb-2">Pipeline Dashboard</h4>
                <p className="text-sm">Real-time view of all prospects and their current status</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-green-400 text-2xl">📈</span>
              The Impact
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">3 weeks</div>
                <div className="text-sm text-gray-400">Implementation Time</div>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <div className="text-sm text-gray-400">Lead Capture</div>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">30%</div>
                <div className="text-sm text-gray-400">More Leads Converted</div>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">$180K</div>
                <div className="text-sm text-gray-400">Annual Revenue Added</div>
              </div>
            </div>
            <p className="text-lg leading-relaxed">
              By recovering previously lost leads, Julia's practice added $180K in annual revenue without any marketing spend increase.
            </p>
          </section>

          <section className="bg-dark-700 rounded-2xl border border-primary/30 p-8">
            <blockquote className="text-xl italic text-gray-300 border-l-4 border-primary pl-6 py-2">
              "Good Breeze AI fixed our intake and follow-up mess overnight. Their system books consults, tracks next steps, and even handles after-hours calls so we don't lose leads."
            </blockquote>
            <p className="text-gray-400 mt-4">— Julia Lawson, Attorney</p>
          </section>

          <section className="bg-gradient-to-br from-primary/10 to-accent-purple/10 rounded-2xl border border-primary/30 p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Stop Losing Leads to Slow Response Times</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Book a strategy call to see how automated intake can transform your client acquisition.
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
