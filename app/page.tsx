import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import Problem from "@/components/home/Problem";
import Solution from "@/components/home/Solution";
import Tools from "@/components/home/Tools";
import HowItWorks from "@/components/home/HowItWorks";
import Services from "@/components/home/Services";
import SocialProof from "@/components/home/SocialProof";
import FounderSection from "@/components/home/FounderSection";
import FinalCTA from "@/components/home/FinalCTA";

export const metadata: Metadata = {
  title: "Good Breeze AI | Competitor Analysis and SEO Audit Reports for Small Business",
  description:
    "Get competitor analysis and SEO audit reports delivered to your inbox in minutes. See exactly what keeps competitors above you in Google. Free to try, no account needed.",
  openGraph: {
    title: "Good Breeze AI | Competitor Analysis and SEO Audit Reports for Small Business",
    description:
      "Get competitor analysis and SEO audit reports delivered to your inbox in minutes. See exactly what keeps competitors above you in Google. Free to try, no account needed.",
    url: "https://goodbreeze.ai",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Problem />
      <Solution />
      <Tools />
      <HowItWorks />
      <Services />
      <SocialProof />
      <FounderSection />
      <FinalCTA />
    </main>
  );
}
