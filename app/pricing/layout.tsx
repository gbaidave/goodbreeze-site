import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Free, Impulse & Starter Plans",
  description:
    "Start free with 2 reports, buy a credit pack for occasional use, or subscribe for unlimited AI-powered competitive and SEO intelligence. No contracts, cancel anytime.",
  openGraph: {
    title: "Pricing | Good Breeze AI — Free, Impulse & Starter Plans",
    description:
      "Start free with 2 reports, buy a credit pack for occasional use, or subscribe for unlimited AI-powered competitive and SEO intelligence. No contracts, cancel anytime.",
    url: "https://goodbreeze.ai/pricing",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
