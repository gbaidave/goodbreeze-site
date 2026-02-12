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
              Julia's law practice was hemorrhaging potential clients due to missed calls and slow response times. Without a system to track intake and follow up, leads would call once and never hear back. After hours inquiries went completely unanswered, meaning business walked straight to competitors.
            </p>
            <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
              <h3 className="text-lg font-bold text-white mb-3">Before Automation:</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">• 40% of leads never received callbacks</li>
                <li className="flex items-start gap-2">• After-hours inquiries had 0% conversion rate</li>
                <li className="flex items-start gap-2">• Consultation scheduling took 5-7 back-and-forth emails</li>
                <li className="flex items-start gap-2">• No visibility into lead pipeline or follow-up status</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-primary text-2xl">⚙️</span>
              The Solution
            </h2>
            <p className="text-lg leading-relaxed mb-4">
              We implemented an automated client intake system that books consultations instantly, sends immediate confirmation emails, tracks next steps for each prospect, and routes after hours inquiries to an AI assistant that provides basic information and schedules callbacks for the next business day.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <h4 className="font-bold text-white mb-2">24/7 Lead Capture</h4>
                <p className="text-sm">Automated intake forms with instant confirmation and AI-powered after-hours assistant</p>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <h4 className="font-bold text-white mb-2">Instant Scheduling</h4>
                <p className="text-sm">Calendar integration allows prospects to book consultations without email ping-pong</p>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <h4 className="font-bold text-white mb-2">Automated Follow-Ups</h4>
                <p className="text-sm">95% engagement rate with sequenced follow-up emails based on prospect actions</p>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <h4 className="font-bold text-white mb-2">Pipeline Visibility</h4>
                <p className="text-sm">Real-time dashboard shows all prospects and their current status</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-accent-purple text-2xl">🔄</span>
              Our Process
            </h2>
            <p className="text-lg leading-relaxed mb-6">
              We applied our proven automation framework to transform Julia's client acquisition system:
            </p>
            <div className="space-y-4">
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">1</div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Discovery & Audit (Week 1)</h4>
                    <p className="text-sm text-gray-300">Analyzed lead sources and conversion rates, tracked time from inquiry to first contact, identified after-hours inquiry volume and missed opportunities</p>
                  </div>
                </div>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">2</div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Roadmap & Design (Week 1-2)</h4>
                    <p className="text-sm text-gray-300">Designed intake forms optimized for legal services, built AI assistant conversation flows for common questions, created follow-up sequences based on lead source and urgency</p>
                  </div>
                </div>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">3</div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Build & Implementation (Week 2-3)</h4>
                    <p className="text-sm text-gray-300">Deployed 24/7 lead capture forms with instant confirmation, configured AI assistant for after-hours support, integrated calendar for direct consultation booking, built pipeline dashboard for visibility</p>
                  </div>
                </div>
              </div>
              <div className="bg-dark-700 rounded-xl border border-primary/20 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">4</div>
                  <div>
                    <h4 className="font-bold text-white mb-2">Optimize & Handoff (Ongoing)</h4>
                    <p className="text-sm text-gray-300">Trained staff on dashboard usage and exception handling, fine-tuned AI responses based on client feedback, monitored conversion rates and adjusted follow-up timing</p>
                  </div>
                </div>
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
