export type HelpTopic =
  | 'Getting Started'
  | 'Understanding Your Reports'
  | 'Billing & Plans'
  | 'Referrals'
  | 'Account & Profile'

export interface HelpArticle {
  slug: string
  title: string
  topic: HelpTopic
  content: string // paragraphs separated by \n\n
}

export const HELP_TOPICS: HelpTopic[] = [
  'Getting Started',
  'Understanding Your Reports',
  'Billing & Plans',
  'Referrals',
  'Account & Profile',
]

export const helpArticles: HelpArticle[] = [
  // ─── Getting Started ──────────────────────────────────────────────────────

  {
    slug: 'how-to-run-first-report',
    title: 'How do I run my first report?',
    topic: 'Getting Started',
    content: `Go to the Tools page and choose a report type. Each tool has a short form — typically asking for your website URL, a competitor URL, or a target keyword. Fill in the details and click Run.

Your report is processed in the background (usually 3–5 minutes) and delivered to your email as a PDF. You can also track the status in your dashboard and view the report directly once it's complete.

If you're on the Free plan, you get one report from the Analyzer tools (Head-to-Head or Top 3 Competitors) and one from the Brand Visibility tools (SEO Audit or Landing Page Optimizer) — no credit card required.`,
  },
  {
    slug: 'what-free-reports-do-i-get',
    title: 'What free reports do I get?',
    topic: 'Getting Started',
    content: `Every account gets two free reports — one per system.

Analyzer system: one free report from either the Head-to-Head Analyzer or the Top 3 Competitors report. You choose which one to use.

Brand Visibility system: one free report from either the SEO Audit or the Landing Page Optimizer.

Once you've used both free reports, you can purchase a credit pack (Spark Pack: 3 reports for $5, Boost Pack: 10 reports for $10) or upgrade to a monthly plan (Starter $20/mo, Growth $30/mo, or Pro $40/mo). You can also earn additional free credits by submitting a testimonial or referring a friend.`,
  },
  {
    slug: 'how-long-does-a-report-take',
    title: 'How long does a report take?',
    topic: 'Getting Started',
    content: `Most reports complete in 3–5 minutes. The PDF will arrive in your inbox once it's ready.

More complex reports (such as the Top 3 Competitors analysis or Multi-Page SEO Audit) may take slightly longer — up to 8 minutes — due to the volume of data being analyzed.

If you haven't received your report after 10 minutes, check your spam folder first. If it's still missing, contact support from the Get Help page in your dashboard.`,
  },
  {
    slug: 'how-to-access-completed-report',
    title: 'How do I access my completed report?',
    topic: 'Getting Started',
    content: `Completed reports are delivered in two ways:

1. By email — a PDF is sent to your registered email address as soon as the report finishes. The email includes a direct download link.

2. In your dashboard — go to your dashboard and scroll to Report History. Once a report is complete, you'll see a "View Report" link. Clicking it opens the full report in your browser with a PDF download option.

Reports are available in your dashboard for 7 days after generation. The PDF you receive by email is yours to keep indefinitely.`,
  },

  // ─── Understanding Your Reports ───────────────────────────────────────────

  {
    slug: 'what-is-head-to-head-analyzer',
    title: 'What is the Head-to-Head Analyzer?',
    topic: 'Understanding Your Reports',
    content: `The Head-to-Head Analyzer compares your website directly against one competitor across key performance dimensions: SEO authority, content quality, keyword positioning, backlink profile, and technical health.

The report tells you where you're ahead, where you're behind, and — most importantly — what specific actions to take to close the gap. It's structured to give you a prioritized action plan, not just a data dump.

Use this when you want a deep comparison against your primary competitor or a site that's consistently outranking you.`,
  },
  {
    slug: 'what-is-top-3-competitors',
    title: 'What is the Top 3 Competitors report?',
    topic: 'Understanding Your Reports',
    content: `The Top 3 Competitors report compares your site against three competitors simultaneously. It surfaces the patterns that all three have in common — the strategies your strongest competitors are all using — and highlights where each one is vulnerable.

The output includes a competitive landscape summary, a gap analysis showing which keywords and content areas you're missing, and a prioritized list of quick wins.

This is a good starting point if you're entering a new market or want a broad view of the competitive landscape before going deeper.`,
  },
  {
    slug: 'what-is-seo-audit',
    title: 'What is the SEO Audit?',
    topic: 'Understanding Your Reports',
    content: `The SEO Audit analyzes your website for technical SEO issues, on-page optimization gaps, keyword opportunities, and content quality signals that affect how search engines rank your pages.

The report covers: page speed and Core Web Vitals, crawlability and indexation, title tags and meta descriptions, header structure, internal linking, and keyword density for your target terms.

You'll receive a prioritized list of issues to fix, from quick wins (like missing meta descriptions) to more involved improvements (like site structure changes). The report is written in plain language — no SEO background required.`,
  },
  {
    slug: 'what-is-landing-page-optimizer',
    title: 'What is the Landing Page Optimizer?',
    topic: 'Understanding Your Reports',
    content: `The Landing Page Optimizer analyzes a specific page on your site — typically a homepage, service page, or campaign landing page — and identifies what's holding it back from converting visitors and ranking better.

The report covers: headline clarity, call-to-action strength, page structure, trust signals, keyword alignment, and load performance.

You'll get specific, actionable rewrites and structural suggestions — not just a checklist. It's useful when you're about to run paid traffic to a page or when a key page isn't converting at the rate you expect.`,
  },
  {
    slug: 'what-is-ai-seo-optimizer',
    title: 'What is the AI SEO Optimizer?',
    topic: 'Understanding Your Reports',
    content: `The AI SEO Optimizer analyzes your site and provides a tailored content and keyword strategy built for AI search and traditional search engines simultaneously.

As AI tools like ChatGPT and Perplexity increasingly influence how people discover businesses, the strategies for appearing in AI recommendations differ from classic SEO. This report bridges both worlds.

The output includes: recommended content topics, keyword clusters, suggested page structures, and guidance on how to position your site as an authoritative source that AI tools cite and recommend.`,
  },

  // ─── Billing & Plans ──────────────────────────────────────────────────────

  {
    slug: 'whats-included-in-free-plan',
    title: "What's included in the Free plan?",
    topic: 'Billing & Plans',
    content: `The Free plan gives you access to all report types, with one free report from the Analyzer system and one from the Brand Visibility system (2 reports total).

You can sign up with just an email address — no credit card required. Your dashboard, report history, and account features are all fully available on the Free plan.

Once your two free reports are used, you can earn more by submitting a testimonial (1–5 credits) or referring a friend (1 credit per signup). Or you can upgrade to an Impulse credit pack or the Starter plan.`,
  },
  {
    slug: 'what-are-impulse-credits',
    title: 'What are Impulse credits?',
    topic: 'Billing & Plans',
    content: `Impulse is a one-time credit pack: $10 for 3 report credits. There's no subscription — you pay once and use the credits whenever you need them.

Each credit runs one report of any type. Credits expire 90 days after purchase.

This is the right option if you only need reports occasionally or want to try the full tool set before committing to a monthly subscription. If you find yourself running reports regularly, a monthly plan is better value — starting at $20/month for 25 reports.`,
  },
  {
    slug: 'what-is-starter-plan',
    title: 'What is the Starter plan?',
    topic: 'Billing & Plans',
    content: `The Starter plan is $20/month and gives you 25 reports per month across all tool types. The Growth plan ($30/month) gives you 40, and the Pro plan ($40/month) gives you 50.

This is the right choice if you're actively working on SEO, monitoring competitors, or running reports for clients on a regular basis.

Your subscription renews monthly. You can cancel at any time from the Account page, and you'll retain access until the end of your current billing period.`,
  },
  {
    slug: 'how-to-cancel-subscription',
    title: 'How do I cancel my subscription?',
    topic: 'Billing & Plans',
    content: `You can cancel your Starter subscription at any time from the Account page. Click "Manage billing, invoices & payment method" to open the Stripe billing portal, then select "Cancel subscription."

Your access continues until the end of the current billing period — you won't be charged again after cancelling.

If you cancel and want to continue running occasional reports, you can purchase Impulse credits ($10 for 3 reports) without a subscription.`,
  },
  {
    slug: 'do-credits-expire',
    title: 'Do report credits expire?',
    topic: 'Billing & Plans',
    content: `Yes. Impulse credit packs expire 90 days after purchase. Your dashboard shows your credit balance and expiry date on the Account page.

Free reports (the ones included with your Free plan) don't expire — they're a permanent entitlement, one per system.

Credits earned from testimonials and referrals don't have a set expiry, though we reserve the right to apply a policy in the future with reasonable notice.

Monthly plan subscribers don't use credits — reports count against your monthly plan limit (25, 40, or 50 depending on your plan). Unused monthly reports don't roll over.`,
  },

  // ─── Referrals ────────────────────────────────────────────────────────────

  {
    slug: 'how-does-referral-program-work',
    title: 'How does the referral program work?',
    topic: 'Referrals',
    content: `When someone signs up using your referral link, you automatically receive 1 free report credit. The credit is granted immediately — no minimum purchase required from the person you referred.

There's no cap on how many credits you can earn. If 10 people sign up through your link, you get 10 credits.

The person you refer gets access to their two free reports just like any new user. Your referral credit is separate and doesn't come at their expense.`,
  },
  {
    slug: 'where-is-my-referral-link',
    title: 'Where is my referral link?',
    topic: 'Referrals',
    content: `Your referral link is in the Referral section of your dashboard — scroll down past your report stats to find it.

Your link looks like: goodbreeze.ai/ref/YOURCODE

Copy and share it anywhere — email, social media, Slack, or direct message. Anyone who clicks it and signs up will be attributed to your referral.

The link is tied to your account permanently — you don't need to regenerate it.`,
  },
  {
    slug: 'when-do-i-receive-referral-credit',
    title: 'When do I receive my referral credit?',
    topic: 'Referrals',
    content: `Your credit is granted automatically as soon as the person you referred creates their account. You don't need to do anything — it appears in your credit balance immediately.

You'll also receive a notification in the dashboard bell icon when a referral credit is added.

If you believe a referral wasn't credited correctly, contact support with the email address of the person you referred and we'll investigate.`,
  },

  // ─── Account & Profile ────────────────────────────────────────────────────

  {
    slug: 'how-to-update-name',
    title: 'How do I update my name?',
    topic: 'Account & Profile',
    content: `Go to Account Settings (link in the top navigation or at the bottom of your dashboard). In the Profile section, you'll see your current name with an edit field.

Type your new name and click Save. Your name is updated immediately and will appear in reports and emails going forward.

Your name on existing completed reports won't change — only new reports generated after the update will use the new name.`,
  },
  {
    slug: 'can-i-change-email',
    title: 'Can I change my email address?',
    topic: 'Account & Profile',
    content: `Email changes aren't available through self-service at the moment. Your email is tied to your login and report delivery, so changing it requires a manual process to avoid delivery issues.

If you need to change your email address, please contact support through the Get Help page and we'll assist you.`,
  },
  {
    slug: 'how-to-contact-support',
    title: 'How do I contact support?',
    topic: 'Account & Profile',
    content: `The easiest way is through the Get Help page — linked in your dashboard header and at the bottom of the Account page.

The form auto-fills your account context (email, plan, last report) so our team can respond faster without back-and-forth. Describe your issue and click Send. We reply to your registered email address, typically within 1 business day.

For urgent issues, you can also email support@goodbreeze.ai directly. Include your account email and a description of the issue.`,
  },
  {
    slug: 'how-to-sign-out',
    title: 'How do I sign out?',
    topic: 'Account & Profile',
    content: `To sign out, go to Account Settings and click "Sign out" in the bottom-right corner of the page.

You can also sign out from the user menu in the top navigation — click your avatar or name to open the menu, then select Sign Out.

If you're sharing a device, always sign out before leaving. Your session will also expire automatically after a period of inactivity.`,
  },
]
