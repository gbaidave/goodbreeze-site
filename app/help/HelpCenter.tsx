'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { helpArticles, HELP_TOPICS, type HelpTopic } from '@/lib/help-articles'

const TOPIC_COLORS: Record<HelpTopic, string> = {
  'Getting Started':            'bg-primary/10 text-primary border-primary/30',
  'Understanding Your Reports': 'bg-accent-blue/10 text-accent-blue border-accent-blue/30',
  'Billing & Plans':            'bg-green-500/10 text-green-400 border-green-500/30',
  'Referrals':                  'bg-purple-500/10 text-purple-400 border-purple-500/30',
  'Account & Profile':          'bg-gray-500/10 text-gray-400 border-gray-500/30',
}

function ArticleItem({ article }: { article: typeof helpArticles[0] }) {
  const [open, setOpen] = useState(false)
  const paragraphs = article.content.split('\n\n')

  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-dark-700 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full border ${TOPIC_COLORS[article.topic]}`}
          >
            {article.topic}
          </span>
          <span className="text-white text-sm font-medium leading-snug">{article.title}</span>
        </div>
        <svg
          className={`flex-shrink-0 w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-gray-800 space-y-3">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-gray-400 text-sm leading-relaxed">{p}</p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function HelpCenter() {
  const [search, setSearch] = useState('')
  const [activeTopic, setActiveTopic] = useState<HelpTopic | 'All'>('All')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return helpArticles.filter((a) => {
      const matchesTopic = activeTopic === 'All' || a.topic === activeTopic
      const matchesSearch = !q || a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)
      return matchesTopic && matchesSearch
    })
  }, [search, activeTopic])

  // Group filtered articles by topic for display
  const grouped = useMemo(() => {
    const result: Record<string, typeof helpArticles> = {}
    for (const article of filtered) {
      if (!result[article.topic]) result[article.topic] = []
      result[article.topic].push(article)
    }
    return result
  }, [filtered])

  const topicsToShow = HELP_TOPICS.filter((t) => grouped[t]?.length > 0)

  return (
    <div className="min-h-screen bg-dark py-16 px-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">Help Center</h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Answers to common questions about Good Breeze AI reports, plans, and your account.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search help articles…"
            className="w-full pl-11 pr-4 py-3.5 bg-dark-700 border border-gray-700 text-white rounded-xl focus:outline-none focus:border-primary transition-colors text-sm placeholder-gray-600"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Topic filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(['All', ...HELP_TOPICS] as const).map((topic) => (
            <button
              key={topic}
              onClick={() => setActiveTopic(topic)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                activeTopic === topic
                  ? 'bg-primary/20 text-primary border-primary/50'
                  : 'bg-dark border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Results */}
        {topicsToShow.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">No articles found for &ldquo;{search}&rdquo;</p>
            <button
              onClick={() => { setSearch(''); setActiveTopic('All') }}
              className="mt-3 text-primary text-sm hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {topicsToShow.map((topic) => (
              <section key={topic}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{topic}</h2>
                <div className="space-y-2">
                  {grouped[topic].map((article) => (
                    <ArticleItem key={article.slug} article={article} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Support CTA */}
        <div className="mt-12 text-center border-t border-gray-800 pt-8">
          <p className="text-gray-500 text-sm mb-3">Can&apos;t find what you&apos;re looking for?</p>
          <a
            href="/support"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold text-sm rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            Contact support
          </a>
        </div>

      </div>
    </div>
  )
}
