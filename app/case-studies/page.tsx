import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Case Studies | Good Breeze AI",
  description: "Real results from real businesses. See how we've helped consultants, attorneys, CPAs, and real estate brokers automate their operations and scale efficiently.",
};

const caseStudies = [
  {
    name: "Alana Shaw",
    role: "Consultant",
    avatar: "/images/avatars/alana-shaw.png",
    problem: "Alana's consulting firm was losing leads due to slow intake processes and inconsistent proposal delivery. Manual follow ups meant opportunities slipped through the cracks, and proposal creation took hours of repetitive work that could have been spent on billable client time.",
    solution: "We built an automated intake workflow that captures lead information, auto fills proposal templates based on service type, and schedules follow up reminders at optimal intervals. The system integrates with her CRM to ensure nothing falls through the cracks.",
    results: {
      timeToMarket: "Deployed in 2 weeks",
      effectiveness: "100% proposal consistency, zero missed follow ups",
      roi: "12 hours saved per week, equivalent to adding a part time admin without the overhead",
      metrics: "Streamlined intake & proposals"
    },
    quote: "Call Dave at Good Breeze AI. He built us a simple flow that handles intake, auto-fills proposals, and keeps follow-ups on track so nothing slips."
  },
  {
    name: "Julia Lawson",
    role: "Attorney",
    avatar: "/images/avatars/julia-lawson.png",
    problem: "Julia's law practice was hemorrhaging potential clients due to missed calls and slow response times. Without a system to track intake and follow up, leads would call once and never hear back. After hours inquiries went completely unanswered, meaning business walked straight to competitors.",
    solution: "We implemented an automated client intake system that books consultations instantly, sends immediate confirmation emails, tracks next steps for each prospect, and routes after hours inquiries to an AI assistant that provides basic information and schedules callbacks for the next business day.",
    results: {
      timeToMarket: "Live in 3 weeks including testing",
      effectiveness: "24/7 lead capture, automated follow up sequence with 95% engagement rate",
      roi: "Recovered 30% of previously lost leads, adding $180K in annual revenue",
      metrics: "Zero missed leads"
    },
    quote: "Good Breeze AI fixed our intake and follow-up mess overnight. Their system books consults, tracks next steps, and even handles after-hours calls so we don't lose leads."
  },
  {
    name: "Rafael Moreno",
    role: "CPA",
    avatar: "/images/avatars/rafael-moreno.png",
    problem: "Rafael's accounting firm dreaded month end close. Collecting documents from clients required endless email chains and phone calls. Manual reminders were inconsistent, exceptions got buried, and close processes routinely stretched 2-3 weeks due to missing information and manual reconciliation steps.",
    solution: "We automated the entire document collection workflow with scheduled reminders sent at optimal times, automated escalation for non responders, exception flagging based on predefined rules, and integration with their accounting software for automatic reconciliation of standard transactions.",
    results: {
      timeToMarket: "Implemented over 4 weeks with staff training",
      effectiveness: "95% on time document submission, automated exception detection",
      roi: "Month end close completed in 7 days instead of 14-21 days, freeing 40+ hours per month",
      metrics: "Month end close in half the time"
    },
    quote: "I'd recommend Dave in a heartbeat. His automations collect client documents, remind people nicely, and flag exceptions so month-end actually ends."
  },
  {
    name: "Marcus Chen",
    role: "Real Estate Broker",
    avatar: "/images/avatars/marcus-chen.png",
    problem: "Marcus was losing deals because his team couldn't keep up with lead follow ups and property alerts. Manual CRM updates meant data was always outdated, leads received inconsistent communication, and hot properties weren't matched to interested buyers fast enough. In real estate, speed wins deals.",
    solution: "We built an automated lead management system that sends instant follow ups based on lead source and interest level, triggers property alerts when new listings match buyer criteria, updates the CRM automatically as leads progress through the pipeline, and sequences nurture emails for cold leads to keep them warm.",
    results: {
      timeToMarket: "Full deployment in 5 weeks",
      effectiveness: "Instant property matching, 100% CRM accuracy, zero manual data entry",
      roi: "Closed 30% more deals with the same team size, adding $420K in annual commission",
      metrics: "30% increase in closed deals"
    },
    quote: "Good Breeze AI transformed how we handle leads. Automated follow-ups, instant property alerts, and seamless CRM updates mean we close more deals with less manual work."
  },
];

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-dark py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/" className="text-gray-400 hover:text-primary transition-colors">
            Home
          </Link>
          <span className="text-gray-600 mx-2">/</span>
          <span className="text-gray-300">Case Studies</span>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent-blue bg-clip-text text-transparent">
            Real Results from Real Businesses
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            See how we've helped businesses like yours reclaim time, eliminate busywork, and scale operations without adding headcount.
          </p>
        </div>

        {/* Case Studies */}
        <div className="space-y-12">
          {caseStudies.map((study, index) => (
            <div
              key={index}
              className="bg-dark-700 rounded-2xl border border-primary/20 p-8 lg:p-12"
            >
              {/* Header with avatar */}
              <div className="flex items-center gap-4 mb-8">
                <div className="relative w-16 h-16 rounded-full border-2 border-primary/30 overflow-hidden flex-shrink-0">
                  <Image
                    src={study.avatar}
                    alt={study.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{study.name}</h2>
                  <p className="text-primary">{study.role}</p>
                </div>
              </div>

              {/* Problem */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-red-400">⚠️</span>
                  The Problem
                </h3>
                <p className="text-gray-300 leading-relaxed">{study.problem}</p>
              </div>

              {/* Solution */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-primary">⚙️</span>
                  The Solution
                </h3>
                <p className="text-gray-300 leading-relaxed">{study.solution}</p>
              </div>

              {/* Results */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-green-400">📈</span>
                  The Results
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-dark rounded-xl border border-primary/20 p-4">
                    <div className="text-sm text-gray-400 mb-1">Time to Market</div>
                    <div className="text-white font-semibold">{study.results.timeToMarket}</div>
                  </div>
                  <div className="bg-dark rounded-xl border border-primary/20 p-4">
                    <div className="text-sm text-gray-400 mb-1">Effectiveness</div>
                    <div className="text-white font-semibold">{study.results.effectiveness}</div>
                  </div>
                  <div className="bg-dark rounded-xl border border-primary/20 p-4">
                    <div className="text-sm text-gray-400 mb-1">ROI</div>
                    <div className="text-white font-semibold">{study.results.roi}</div>
                  </div>
                  <div className="bg-dark rounded-xl border border-primary/20 p-4">
                    <div className="text-sm text-gray-400 mb-1">Key Metric</div>
                    <div className="text-primary font-semibold">{study.results.metrics}</div>
                  </div>
                </div>
              </div>

              {/* Quote */}
              <div className="border-l-4 border-primary pl-6 py-2 bg-primary/5 rounded-r-xl">
                <p className="text-lg italic text-gray-300">
                  "{study.quote}"
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  — {study.name}, {study.role}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-dark-700 rounded-2xl border border-primary/20 p-12">
          <h2 className="text-3xl font-bold mb-4">Ready for Your Own Success Story?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Every business we work with starts exactly where you are now. Book a strategy call and let's map out how automation can transform your operations.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-4 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105"
          >
            Book Your Strategy Call
          </Link>
        </div>
      </div>
    </div>
  );
}
