import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import Problem from "@/components/home/Problem";
import Services from "@/components/home/Services";
import HowItWorks from "@/components/home/HowItWorks";
import Tools from "@/components/home/Tools";
import SocialProof from "@/components/home/SocialProof";
import FounderSection from "@/components/home/FounderSection";
import FinalCTA from "@/components/home/FinalCTA";

export const metadata: Metadata = {
  title: "Good Breeze AI | Business Automation Systems for Small Business",
  description:
    "Custom AI automation systems for small businesses. We find what's holding your operation back and build the systems to fix it. Start with a free report.",
  openGraph: {
    title: "Good Breeze AI | Business Automation Systems for Small Business",
    description:
      "Custom AI automation systems for small businesses. We find what's holding your operation back and build the systems to fix it. Start with a free report.",
    url: "https://goodbreeze.ai",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Problem />
      <Services />
      <HowItWorks />
      <Tools />
      <SocialProof />
      <FounderSection />
      <FinalCTA />
    </main>
  );
}
