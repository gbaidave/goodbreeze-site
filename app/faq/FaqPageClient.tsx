'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const sections = [
  {
    heading: 'Getting Started',
    faqs: [
      {
        question: 'Do I need an account to run a report?',
        answer: 'No account is needed for your first free report. Enter your URL, add your email, and the PDF lands in your inbox in 2–3 minutes. We create a free account for you automatically so you can access your results anytime.',
      },
      {
        question: 'Do I need SEO experience to use this?',
        answer: "No. Reports are written in plain English with specific, prioritized action items — not raw data dumps. If you can read a summary and follow a to-do list, you can act on these reports immediately. We write for business owners, not SEO specialists.",
      },
      {
        question: 'How long does a report take?',
        answer: 'Most reports are delivered in 2–3 minutes. The AI analyzes your page, pulls competitor and keyword data, and assembles the PDF while you wait. You\'ll get an email with a download link.',
      },
      {
        question: 'What information do I need to provide?',
        answer: 'Just a URL — the page or website you want analyzed. Depending on the report type, you may also provide a competitor\'s URL, a target keyword, or your company name. Everything else is handled automatically.',
      },
    ],
  },
  {
    heading: 'About the Reports',
    faqs: [
      {
        question: 'What\'s in each report?',
        answer: 'It depends on the report type. The AI SEO Optimizer covers on-page SEO, keyword gaps, content quality, and AI search optimization. The Head-to-Head Analyzer compares your site against a competitor across keywords, content, and positioning. Keyword Research delivers keyword clusters with intent, difficulty, and content recommendations. Each report includes specific action items — not just scores.',
      },
      {
        question: 'How accurate is the AI analysis?',
        answer: 'Reports combine live web data with AI reasoning across dozens of signals. They\'re designed to surface the most impactful issues and opportunities, not to be an exhaustive technical crawl. Think of them as a sharp, prioritized strategic brief rather than an all-inclusive data export.',
      },
      {
        question: 'How is this different from Semrush or Ahrefs?',
        answer: 'Those tools give you raw data and expect you to figure out what it means and what to do next — which takes hours of expertise you may not have. Good Breeze AI delivers an AI-curated PDF report with specific, prioritized recommendations. No learning curve. No endless dashboards. Just a report you can act on today.',
      },
      {
        question: 'Can I share the PDF with my team?',
        answer: 'Yes. The PDF is yours. Share it however you like — with your team, your agency, or a contractor. It\'s designed to be readable by anyone without technical context.',
      },
    ],
  },
  {
    heading: 'Pricing & Plans',
    faqs: [
      {
        question: 'Is the first report really free?',
        answer: 'Yes. Your first report is completely free — no credit card required. After that, reports are included in your plan or available as one-off credits.',
      },
      {
        question: 'What happens after my free report?',
        answer: 'You\'ll have a free account where you can see your report history and manage your profile. To run more reports, you can upgrade to a monthly plan or purchase individual credits. Pricing details are on the pricing page.',
      },
      {
        question: 'Can I cancel anytime?',
        answer: 'Yes. Monthly plans can be cancelled at any time. You\'ll keep access until the end of your billing period. No lock-ins, no cancellation fees.',
      },
    ],
  },
  {
    heading: 'Results',
    faqs: [
      {
        question: 'How quickly will I see results?',
        answer: "Your report is in your inbox in 2–3 minutes. Most users identify their first quick wins within the first read — and see measurable improvements within 1–2 weeks of acting on the recommendations. SEO is a longer game, but the report shows you exactly where to focus first.",
      },
      {
        question: 'What if I don\'t understand something in my report?',
        answer: 'Each report section is written to be self-explanatory. If you\'re still stuck, reach out via the contact page and we\'ll help you interpret it. We want you to act on it, not just read it.',
      },
      {
        question: 'Does this work for any industry?',
        answer: 'Yes. The AI analyzes your specific page and competitive landscape regardless of industry. It\'s been used by e-commerce stores, service businesses, SaaS companies, and local businesses. The recommendations are tailored to your actual content and competitors, not generic templates.',
      },
    ],
  },
]

export default function FaqPageClient() {
  const [openKey, setOpenKey] = useState<string | null>(null)

  return (
    <div className="space-y-12">
      {sections.map((section, si) => (
        <div key={si}>
          <h2 className="text-lg font-semibold text-primary mb-4 uppercase tracking-wider">{section.heading}</h2>
          <div className="space-y-3">
            {section.faqs.map((faq, fi) => {
              const key = `${si}-${fi}`
              const isOpen = openKey === key
              return (
                <motion.div
                  key={fi}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: fi * 0.04 }}
                  className="rounded-xl border border-primary/20 bg-dark-700 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenKey(isOpen ? null : key)}
                    className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-dark-800 transition-all duration-200"
                  >
                    <span className="font-medium text-white pr-8">{faq.question}</span>
                    <span className="text-primary text-2xl flex-shrink-0">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-gray-300 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      ))}

      <div className="mt-16 p-8 rounded-2xl bg-dark-700 border border-primary/20 text-center">
        <p className="text-gray-300 mb-2">Still have a question?</p>
        <Link href="/contact" className="text-primary hover:underline font-medium">
          Reach out — we reply fast →
        </Link>
      </div>
    </div>
  )
}
