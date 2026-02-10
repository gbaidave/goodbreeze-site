import Hero from "@/components/home/Hero";
import Problem from "@/components/home/Problem";
import Solution from "@/components/home/Solution";
import Tools from "@/components/home/Tools";
import Services from "@/components/home/Services";
import FAQ from "@/components/home/FAQ";
import FinalCTA from "@/components/home/FinalCTA";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Problem />
      <Solution />
      <Tools />
      <Services />
      <FAQ />
      <FinalCTA />
    </main>
  );
}
