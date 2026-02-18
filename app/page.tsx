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
  title: "AI Automation & Competitive Intelligence for Small Business",
  description:
    "Stop drowning in busywork. Good Breeze AI builds custom AI automation and delivers competitive intelligence tools so small businesses and startups can operate like a team twice their size.",
  openGraph: {
    title: "AI Automation & Competitive Intelligence for Small Business | Good Breeze AI",
    description:
      "Stop drowning in busywork. Good Breeze AI builds custom AI automation and delivers competitive intelligence tools so small businesses and startups can operate like a team twice their size.",
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
