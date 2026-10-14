import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import ProblemSection from '../components/landing/ProblemSection';
import HowItWorks from '../components/landing/HowItWorks';
import Features from '../components/landing/Features';
import AISection from '../components/landing/AISection';
import AudienceToggle from '../components/landing/AudienceToggle';
import Research from '../components/landing/Research';
import Pricing from '../components/landing/Pricing';
import CTABanner from '../components/landing/CTABanner';
import Footer from '../components/landing/Footer';
import SmoothScroll from '../components/SmoothScroll';

export default function Home() {
  return (
    <SmoothScroll>
    <main className="min-h-screen bg-mint text-ink font-dm-sans">
      <Navbar />
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <Features />
      <AISection />
      <AudienceToggle />
      <Research />
      <Pricing />
      <CTABanner />
      <Footer />
    </main>
    </SmoothScroll>
  );
}
