import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import Problem from "@/components/home/Problem";
import Solution from "@/components/home/Solution";
import Tools from "@/components/home/Tools";
import Services from "@/components/home/Services";
import SocialProof from "@/components/home/SocialProof";
import FounderSection from "@/components/home/FounderSection";
import Partners from "@/components/home/Partners";
import TechStack from "@/components/home/TechStack";
import FAQ from "@/components/home/FAQ";
import TopicPages from "@/components/home/TopicPages";
import FinalCTA from "@/components/home/FinalCTA";

export const metadata: Metadata = {
  title: "Good Breeze AI | Competitor Analysis and SEO Audit Reports for Small Business",
  description:
    "Get AI-powered SEO audits, keyword research, and competitor analysis reports delivered to your inbox in minutes. Free to try. No account needed.",
  openGraph: {
    title: "Good Breeze AI | Competitor Analysis and SEO Audit Reports for Small Business",
    description:
      "Get AI-powered SEO audits, keyword research, and competitor analysis reports delivered to your inbox in minutes. Free to try. No account needed.",
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
      <Services />
      <SocialProof />
      <FounderSection />
      <Partners />
      <TechStack />
      <FAQ />
      <TopicPages />
      <FinalCTA />
    </main>
  );
}
