import { LandingHeader } from '@/components/landing/landing-header'
import { HeroSection } from '@/components/landing/hero-section'
import { ProblemSection } from '@/components/landing/problem-section'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
import { TimingStagesSection } from '@/components/landing/timing-stages-section'
import { DashboardSection } from '@/components/landing/dashboard-section'
import { UseCasesSection } from '@/components/landing/use-cases-section'
import { CTASection } from '@/components/landing/cta-section'
import { LandingFooter } from '@/components/landing/landing-footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingHeader />
      <main>
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <TimingStagesSection />
        <DashboardSection />
        <UseCasesSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  )
}
