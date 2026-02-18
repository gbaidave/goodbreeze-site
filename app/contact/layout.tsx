import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a Strategy Call",
  description:
    "Have a problem that's slowing your business down? Book a free strategy call with Good Breeze AI and find out what's possible — no commitment, just a straight conversation.",
  openGraph: {
    title: "Book a Strategy Call | Good Breeze AI",
    description:
      "Have a problem that's slowing your business down? Book a free strategy call with Good Breeze AI and find out what's possible — no commitment, just a straight conversation.",
    url: "https://goodbreeze.ai/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
