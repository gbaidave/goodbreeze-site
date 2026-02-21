import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | Competitor Analysis Report Plans for Small Business",
  description:
    "Start free, buy a credit pack for occasional use, or subscribe monthly for AI-powered competitive and SEO intelligence. Plans from $5. No contracts, cancel anytime.",
  openGraph: {
    title: "Pricing | Good Breeze AI | Competitor Analysis Report Plans",
    description:
      "Start free, buy a credit pack for occasional use, or subscribe monthly for AI-powered competitive and SEO intelligence. Plans from $5. No contracts, cancel anytime.",
    url: "https://goodbreeze.ai/pricing",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
