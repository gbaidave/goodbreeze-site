import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Good Breeze AI is a boutique AI automation consultancy. We help small business owners and startup founders work smarter — without the enterprise price tag or big agency overhead.",
  openGraph: {
    title: "About Good Breeze AI | AI Automation Consulting",
    description:
      "Good Breeze AI is a boutique AI automation consultancy. We help small business owners and startup founders work smarter — without the enterprise price tag or big agency overhead.",
    url: "https://goodbreeze.ai/about",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
