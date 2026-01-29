import {
  Navbar,
  HeroSection,
  FeatureSection,
  CTASection,
  Footer,
} from "@/components/landing";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeatureSection />
      <CTASection />
      <Footer />
    </main>
  );
}

