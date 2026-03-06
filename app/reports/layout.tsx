import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Business Intelligence Tools",
  description:
    "Free and paid AI-powered tools for small businesses: competitor analysis, SEO audits, keyword research, landing page optimization. Full PDF reports delivered to your inbox.",
  openGraph: {
    title: "AI Business Intelligence Tools | Good Breeze AI",
    description:
      "Free and paid AI-powered tools for small businesses: competitor analysis, SEO audits, keyword research, landing page optimization. Full PDF reports delivered to your inbox.",
    url: "https://goodbreeze.ai/tools",
  },
};

// Report form pages are publicly viewable. Auth is enforced at submit time:
// - Free reports (ai-seo, competitive-analyzer): guests use frictionless flow
// - Paid reports: form shows "Create account / Sign in" prompt instead of submit button
// - /reports/[id] viewer: server-side redirect to login (handled in page.tsx)
export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
