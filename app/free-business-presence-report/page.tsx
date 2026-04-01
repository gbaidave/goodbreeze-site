'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { isDisposableEmail } from '@/lib/disposable-email'
import { captureEvent } from '@/lib/analytics'
import TurnstileWidget from '@/components/auth/TurnstileWidget'

import type { Metadata } from 'next'

// ============================================================================
// Hide root Header/Footer — this landing page renders its own stripped nav
// ============================================================================

function useHideRootChrome() {
  useEffect(() => {
    const header = document.querySelector('header') as HTMLElement | null
    const footer = document.querySelector('footer[data-root-footer]') as HTMLElement | null
    const main = document.querySelector('main') as HTMLElement | null
    if (header) header.style.display = 'none'
    if (footer) footer.style.display = 'none'
    if (main) main.style.paddingTop = '0'
    return () => {
      if (header) header.style.display = ''
      if (footer) footer.style.display = ''
      if (main) main.style.paddingTop = ''
    }
  }, [])
}

// ============================================================================
// Sign-up form component (reused in hero modal + final CTA)
// ============================================================================

function SignupForm({ id, onSuccess }: { id: string; onSuccess?: () => void }) {
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (isDisposableEmail(email)) {
      setError('Please use a real email address to create an account.')
      return
    }
    setSubmitting(true)
    try {
      const supabase = createClient()
      const returnUrl = `/reports/business-presence?url=${encodeURIComponent(url)}`
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          captchaToken: captchaToken ?? undefined,
          data: { name, marketing_opt_in: true },
          emailRedirectTo: `${window.location.origin}/auth/callback?returnUrl=${encodeURIComponent(returnUrl)}`,
        },
      })
      if (signUpError) {
        setError(signUpError.message.includes('already registered')
          ? 'Looks like you already have an account. Sign in instead.'
          : signUpError.message)
        return
      }
      // Supabase returns a fake success for existing emails (to prevent enumeration).
      // Detect this: user object exists but identities array is empty.
      if (signUpData?.user && (!signUpData.user.identities || signUpData.user.identities.length === 0)) {
        setError('Looks like you already have an account. Sign in instead.')
        return
      }
      try { captureEvent('signup_completed', { method: 'email', source: 'landing_page_business_presence' }) } catch {}
      if (signUpData?.session) {
        window.location.href = `/reports/business-presence?url=${encodeURIComponent(url)}`
        return
      }
      onSuccess?.()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = 'w-full px-4 py-3 bg-dark border border-gray-700 text-white rounded-xl focus:outline-none focus:border-primary transition-colors text-sm placeholder-gray-600'
  const labelClass = 'block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide'

  return (
    <form id={id} onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
          {error.includes('Sign in') && (
            <Link href={`/login?returnUrl=${encodeURIComponent('/reports/business-presence')}`} className="block mt-1 text-primary hover:underline text-sm">Go to sign in →</Link>
          )}
        </div>
      )}
      <div><label className={labelClass}>Business URL</label><input type="url" value={url} onChange={e => setUrl(e.target.value)} className={inputClass} placeholder="https://yourbusiness.com" required /></div>
      <div><label className={labelClass}>Full Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="Jane Smith" required /></div>
      <div><label className={labelClass}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="jane@company.com" required /></div>
      <div><label className={labelClass}>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} placeholder="At least 12 characters" required minLength={12} /></div>
      <TurnstileWidget onVerify={(token) => setCaptchaToken(token)} />
      <button type="submit" disabled={submitting} className="w-full py-3 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
        {submitting ? 'Creating account…' : 'Get My Free Report'}
      </button>
      <p className="text-center text-xs text-gray-500">
        Already have an account? <Link href={`/login?returnUrl=${encodeURIComponent('/reports/business-presence')}`} className="text-primary hover:underline">Sign in</Link>
      </p>
    </form>
  )
}

// ============================================================================
// Helpers
// ============================================================================

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`bg-dark-800 border rounded-xl overflow-hidden transition-colors ${open ? 'border-primary/20' : 'border-gray-800'}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left text-white font-medium text-sm hover:text-primary transition-colors">
        {question}
        <svg className={`w-4 h-4 flex-shrink-0 text-gray-500 transition-transform ${open ? 'rotate-180 text-primary' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-60 pb-4 px-5' : 'max-h-0'}`}>
        <p className="text-sm text-gray-400 leading-relaxed">{answer}</p>
      </div>
    </div>
  )
}

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-30px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay }} className={className}>
      {children}
    </motion.div>
  )
}

function CheckIcon() {
  return (
    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center mt-0.5">
      <svg className="w-3.5 h-3.5 text-primary" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
      </svg>
    </div>
  )
}

// ============================================================================
// Main Page
// ============================================================================

export default function FreeBusinessPresenceReportPage() {
  useHideRootChrome()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [signupComplete, setSignupComplete] = useState(false)
  const heroRef = useRef<HTMLElement>(null)
  const [showFloating, setShowFloating] = useState(false)
  const [floatingMinimized, setFloatingMinimized] = useState(true)

  // If already logged in, redirect to the report page
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/reports/business-presence')
    }
  }, [authLoading, user, router])

  // Floating form: show when scrolled past hero
  useEffect(() => {
    function onScroll() {
      if (!heroRef.current) return
      setShowFloating(heroRef.current.getBoundingClientRect().bottom < 200)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // If user became authenticated (e.g. confirmed email in another tab), redirect immediately
  // This must come before the signupComplete check so the "Check Your Email" screen
  // doesn't block the redirect when auth state changes.
  if (!authLoading && user) {
    return <div className="min-h-screen bg-dark flex items-center justify-center"><div className="text-gray-500">Redirecting...</div></div>
  }

  if (signupComplete) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Check Your Email</h1>
          <p className="text-gray-400 mb-2">We sent a confirmation link to your email address.</p>
          <p className="text-gray-500 text-sm">Click the link to confirm your account and your Business Presence Report will start generating automatically.</p>
        </div>
      </div>
    )
  }

  const faqs = [
    { q: 'How much does the report cost?', a: 'Nothing. Your first business presence report is completely free. No credit card required.' },
    { q: 'Do I need to create an account?', a: 'Yes, a free account. It takes 30 seconds and gives you a place to view your report and download the PDF.' },
    { q: 'How long does the report take?', a: "Most reports are ready within a few minutes. You'll get an email when it's done." },
    { q: 'What data sources do you use?', a: 'We analyze your website, search engine visibility, online reviews, social presence, and competitor positioning using multiple live data sources.' },
    { q: "Can I run a report for a competitor's business?", a: "Yes. Enter any business URL and we'll analyze it." },
    { q: 'What happens after my free report?', a: "You can purchase additional reports with credits, or subscribe to a plan for monthly reports. There's no obligation." },
  ]

  return (
    <>
      {/* Landing page nav — stripped for conversion */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-lg border-b border-gray-800">
        <nav className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-white">Good Breeze<span className="text-primary"> AI</span></Link>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-gray-300 hover:text-primary text-sm transition-colors">Sign in</Link>
              <button onClick={() => setShowModal(true)} className="px-6 py-2 bg-gradient-to-r from-primary to-accent-blue text-white font-semibold text-sm rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300">
                Get My Free Report
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative pt-32 pb-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)' }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">Get Your Free Business Presence Report</h1>
              <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-lg">Find out how your business actually shows up online. We check your visibility, your competitors, and your reputation across the platforms that matter. Results delivered to your inbox.</p>
              <div className="space-y-3 mb-8">
                {['See exactly where your business stands online in minutes', 'Know what to fix first to start getting more customers', 'Understand how you compare to your local competitors'].map((text, i) => (
                  <div key={i} className="flex items-start gap-3"><CheckIcon /><p className="text-gray-300">{text}</p></div>
                ))}
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-2 mb-8"><span className="w-1.5 h-1.5 rounded-full bg-primary" />Free account. No credit card. Results in your inbox before you know it.</p>
              <button onClick={() => setShowModal(true)} className="px-10 py-4 bg-gradient-to-r from-primary to-accent-blue text-white text-lg font-bold rounded-full hover:shadow-2xl hover:shadow-primary/40 transition-all border-2 border-white/15">
                Get My Free Report →
              </button>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="relative hidden lg:block">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary via-accent-blue to-accent-purple rounded-2xl blur-2xl opacity-20" />
              <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-dark-800 to-[#1a1a2e] rounded-2xl border-2 border-primary/30 shadow-2xl shadow-primary/15 flex items-center justify-center overflow-hidden">
                <div className="w-[85%] p-5 bg-black/30 rounded-xl border border-gray-800">
                  <div className="flex items-center gap-2 mb-4"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-500" /><div className="w-2.5 h-2.5 rounded-full bg-green-500" /><span className="ml-auto text-[10px] text-gray-500">Business Presence Report</span></div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center"><div className="text-2xl font-bold text-primary">78</div><div className="text-[10px] text-gray-500 uppercase">Visibility Score</div></div>
                    <div className="bg-accent-blue/10 border border-accent-blue/20 rounded-lg p-3 text-center"><div className="text-2xl font-bold text-accent-blue">B+</div><div className="text-[10px] text-gray-500 uppercase">Reputation</div></div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden"><div className="w-[78%] h-full bg-primary rounded-full" /></div>
                    <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden"><div className="w-[62%] h-full bg-accent-blue rounded-full" /></div>
                    <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden"><div className="w-[91%] h-full bg-accent-purple rounded-full" /></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="py-20 lg:py-28 px-6"><div className="max-w-7xl mx-auto">
        <Reveal><h2 className="text-3xl sm:text-4xl font-semibold text-white mb-5">You Shouldn&apos;t Have to Guess Where Your Business Stands</h2></Reveal>
        <Reveal delay={0.1}><p className="text-lg text-gray-300 leading-relaxed max-w-2xl mb-8">Most business owners know something isn&apos;t working, but they can&apos;t pinpoint what. Meanwhile, decisions get made on gut feelings instead of data.</p></Reveal>
        <ul className="space-y-4">
          {["You're not getting enough customers and you have no idea why","Your competitors are showing up in places you didn't even know existed","Customers are searching for what you offer and finding someone else","Your online presence has gaps you can't see without the right data","You're spending money on marketing but can't tell what's actually working"].map((text, i) => (
            <Reveal key={i} delay={0.1 * (i + 1)}><li className="flex items-start gap-4 text-gray-300"><CheckIcon />{text}</li></Reveal>
          ))}
        </ul>
      </div></section>

      {/* ── SOLUTION ── */}
      <section className="py-20 lg:py-28 px-6"><div className="max-w-7xl mx-auto">
        <Reveal><h2 className="text-3xl sm:text-4xl font-semibold text-white mb-5">One Report. A Complete Picture of Your Business Online.</h2></Reveal>
        <div className="mb-10">
          <Reveal delay={0.1}><p className="text-lg text-gray-300 leading-relaxed max-w-2xl mb-4">The Business Presence Report scans your website, your search visibility, your competitor landscape, and your online reputation. Then it scores each area and tells you exactly what to focus on first.</p></Reveal>
          <Reveal delay={0.2}><p className="text-lg text-gray-300 leading-relaxed max-w-2xl">Good Breeze AI built this report because we kept seeing the same thing: business owners making big decisions with incomplete information. This report gives you the full picture in one place so you can make smarter moves right now.</p></Reveal>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[{ title: 'Real Data, Not Guesswork', desc: 'We pull from live sources to show you where you actually stand today.' },{ title: 'Competitor Context', desc: 'See how you compare to the businesses your customers are also considering.' },{ title: 'Clear Next Steps', desc: 'Every section tells you what matters most and what to do about it.' }].map((card, i) => (
            <Reveal key={i} delay={0.1 * (i + 1)}><div className="relative bg-dark-800 border border-gray-800 rounded-xl p-7 hover:border-primary/30 transition-all"><div className="absolute top-0 left-6 right-6 h-0.5 bg-primary rounded-b" /><h4 className="text-lg font-semibold text-white mb-2">{card.title}</h4><p className="text-sm text-gray-300 leading-relaxed">{card.desc}</p></div></Reveal>
          ))}
        </div>
      </div></section>

      {/* ── BENEFITS ── */}
      <section className="py-20 lg:py-28 px-6"><div className="max-w-7xl mx-auto">
        <Reveal><h2 className="text-3xl sm:text-4xl font-semibold text-white mb-10">What You&apos;ll See in Your Report</h2></Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {[{ title: 'Online Visibility Score', desc: 'How easily customers can find your business when they search for what you do.', icon: 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z' },{ title: 'Competitor Comparison', desc: 'Side by side look at where you lead and where your competitors have the edge.', icon: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },{ title: 'Reputation Snapshot', desc: 'What your reviews, ratings, and online mentions say about your business.', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },{ title: 'Website Health Check', desc: 'Whether your site is helping or hurting your ability to convert visitors.', icon: 'M3 3h18v18H3V3zm0 6h18M9 21V9' },{ title: 'Priority Action List', desc: 'The specific things worth fixing first, ranked by potential impact.', icon: 'M12 20V10M18 20V4M6 20v-4' }].map((b, i) => (
            <Reveal key={i} delay={0.08 * (i + 1)}><div className="bg-dark-800 border border-gray-800 rounded-xl p-6 hover:border-primary/30 transition-all"><div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center mb-3"><svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={b.icon}/></svg></div><h4 className="font-semibold text-white mb-1 text-sm">{b.title}</h4><p className="text-xs text-gray-400 leading-relaxed">{b.desc}</p></div></Reveal>
          ))}
        </div>
      </div></section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 lg:py-28 px-6 text-center"><div className="max-w-7xl mx-auto">
        <Reveal><h2 className="text-3xl sm:text-4xl font-semibold text-white mb-12">Three Steps. Five Minutes. Real Answers.</h2></Reveal>
        <div className="grid md:grid-cols-3 gap-10 relative">
          <div className="hidden md:block absolute top-7 left-[calc(16.66%+20px)] right-[calc(16.66%+20px)] h-px bg-gradient-to-r from-primary via-accent-blue to-accent-purple opacity-25" />
          {[{ num: '1', title: 'Enter Your Business URL', desc: "Tell us which business to analyze. That's the only input we need." },{ num: '2', title: 'We Run the Analysis', desc: 'Our system checks your visibility, competitors, reputation, and website across multiple data sources.' },{ num: '3', title: 'Get Your Report', desc: 'A complete business presence report lands in your inbox. Review it online or download the PDF.' }].map((step, i) => (
            <Reveal key={i} delay={0.1 * (i + 1)}><div className="relative"><div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-bold text-primary bg-dark-800 border border-primary/25 shadow-lg shadow-primary/10 relative z-10">{step.num}</div><h4 className="font-semibold text-white mb-2">{step.title}</h4><p className="text-sm text-gray-400 max-w-xs mx-auto">{step.desc}</p></div></Reveal>
          ))}
        </div>
      </div></section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 lg:py-28 px-6"><div className="max-w-7xl mx-auto">
        <Reveal><h2 className="text-3xl sm:text-4xl font-semibold text-white mb-10 text-center">What Business Owners Are Saying</h2></Reveal>
        <div className="grid md:grid-cols-3 gap-6">
          {[{ quote: "The free business presence report showed us we were invisible on Google Maps and had zero review presence compared to our top competitor. We fixed both in two weeks and saw a 35% increase in inbound calls that month.", name: 'Sarah Mitchell', image: '/images/testimonials/sarah-mitchell.webp', role: 'Owner, Greenleaf Interior Design' },{ quote: "I had no idea my competitors were outranking us on every keyword that mattered. The report made it obvious. Good Breeze then built us an automated content system that closed the gap in 90 days. Revenue is up 22% this quarter.", name: 'Marcus Chen', image: '/images/testimonials/marcus-chen.webp', role: 'Founder, Ridgeline Home Services' },{ quote: "We were spending $4,000 a month on ads with no idea what was actually converting. The presence report identified three free channels we weren't using at all. We cut ad spend in half and leads actually went up.", name: 'Jennifer Okafor', image: '/images/testimonials/jennifer-okator.webp', role: 'CEO, Lantern Bookkeeping' }].map((t, i) => (
            <Reveal key={i} delay={0.1 * (i + 1)}><div className="bg-dark-800 border border-gray-800 rounded-xl p-7"><div className="text-yellow-400 text-sm tracking-wider mb-4">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p className="text-sm text-gray-300 leading-relaxed italic mb-5">&ldquo;{t.quote}&rdquo;</p><div className="flex items-center gap-3"><img src={t.image} alt={t.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover flex-shrink-0" /><div><div className="text-sm font-semibold text-white">{t.name}</div><div className="text-xs text-gray-500">{t.role}</div></div></div></div></Reveal>
          ))}
        </div>
      </div></section>

      {/* ── FAQ ── */}
      <section className="py-20 lg:py-28 px-6 text-center"><div className="max-w-7xl mx-auto">
        <Reveal><h2 className="text-3xl sm:text-4xl font-semibold text-white mb-10">Common Questions</h2></Reveal>
        <div className="max-w-2xl mx-auto space-y-3 text-left">
          {faqs.map((faq, i) => (<Reveal key={i} delay={0.05 * (i + 1)}><FaqItem question={faq.q} answer={faq.a} /></Reveal>))}
        </div>
      </div></section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 lg:py-28 px-6" id="signup-form"><div className="max-w-5xl mx-auto"><Reveal>
        <div className="relative bg-dark-800 border border-white/10 rounded-3xl p-10 sm:p-16 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent-purple/8 pointer-events-none rounded-3xl" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-3">See Where Your Business Stands</h2>
            <p className="text-lg text-gray-300 max-w-lg mx-auto mb-8">Your first business presence report is free. Get the data you need to make better decisions starting today.</p>
            <div className="max-w-sm mx-auto"><SignupForm id="final-signup-form" onSuccess={() => setSignupComplete(true)} /></div>
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2 mt-6"><span className="w-1.5 h-1.5 rounded-full bg-primary" />Free account. No credit card. Results in your inbox before you know it.</p>
          </div>
        </div>
      </Reveal></div></section>

      {/* Landing page footer — minimal */}
      <footer className="border-t border-gray-800 bg-dark">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} Good Breeze AI. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Terms of Service</Link>
              <Link href="/contact" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ── MODAL OVERLAY ── */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-sm mx-4 bg-dark-800 border border-gray-800 rounded-2xl p-6 shadow-2xl">
            <button onClick={() => setShowModal(false)} className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-dark-800 border border-gray-700 text-gray-400 hover:text-white flex items-center justify-center text-lg transition-colors">&times;</button>
            <h3 className="text-lg font-semibold text-white mb-1">Start your free report</h3>
            <p className="text-xs text-gray-500 mb-4">Takes 30 seconds. No credit card.</p>
            <SignupForm id="modal-signup-form" onSuccess={() => { setShowModal(false); setSignupComplete(true) }} />
          </div>
        </div>
      )}

      {/* ── FLOATING FORM ── */}
      {showFloating && !showModal && (
        <div className="fixed bottom-6 right-6 z-[90] w-96 max-w-[calc(100vw-2rem)]">
          <div className="bg-dark-800 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
            <button onClick={() => setFloatingMinimized(!floatingMinimized)} className="w-full flex items-center justify-between px-5 py-3 bg-primary/5 border-b border-primary/10">
              <div><p className="text-sm font-semibold text-white text-left">Get My Free Report</p><p className="text-[10px] text-gray-500 text-left">Free account. No credit card.</p></div>
              <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                <svg className={`w-3.5 h-3.5 transition-transform ${floatingMinimized ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
              </div>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${floatingMinimized ? 'max-h-0' : 'max-h-[500px] p-5'}`}>
              <SignupForm id="floating-signup-form" onSuccess={() => setSignupComplete(true)} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
