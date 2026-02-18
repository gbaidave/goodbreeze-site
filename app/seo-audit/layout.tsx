import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free SEO Audit Tool",
  description:
    "Get a free technical SEO audit of your website. Find out what's holding you back in search results and get a prioritized fix list — delivered as a PDF to your inbox.",
  openGraph: {
    title: "Free SEO Audit Tool | Good Breeze AI",
    description:
      "Get a free technical SEO audit of your website. Find out what's holding you back in search results and get a prioritized fix list — delivered as a PDF to your inbox.",
    url: "https://goodbreeze.ai/seo-audit",
  },
};

export default function SeoAuditLayout({ children }: { children: React.ReactNode }) {
  return children;
}
