import {
  Navbar,
  HeroSection,
  ProblemSolution,
  HowItWorks,
  FeatureSection,
  Testimonials,
  PricingSection,
  CTASection,
  Footer,
} from "@/components/landing";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      <HeroSection />
      <ProblemSolution />
      <HowItWorks />
      <FeatureSection />
      <Testimonials />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
