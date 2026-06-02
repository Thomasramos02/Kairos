import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight } from 'lucide-react'

const profiles = ['Agency', 'SDR', 'Freelancer', 'Consultant', 'SaaS']

export function CTASection() {
  return (
    <section id="pricing" className="py-20 lg:py-28 bg-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground text-balance">
            Get early access to Kairos.
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80 text-pretty">
            Join the waitlist for the visual beta and be first to track newly registered
            companies by timing stage, score, and recommended action.
          </p>

          <form className="mx-auto mt-8 max-w-2xl rounded-2xl border border-white/15 bg-white/10 p-3 text-left backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="cta-email">Work email</label>
              <Input
                id="cta-email"
                type="email"
                placeholder="you@company.com"
                className="h-11 border-white/20 bg-white text-foreground"
              />
              <Button type="button" size="lg" variant="secondary" className="h-11 shrink-0 gap-2">
                Get early access
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary-foreground/60">
                What best describes you? <span className="normal-case tracking-normal">(optional)</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {profiles.map((profile) => (
                  <label
                    key={profile}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-primary-foreground/80 transition-colors hover:bg-white/20 hover:text-primary-foreground"
                  >
                    <input className="h-3.5 w-3.5 accent-white" type="radio" name="cta-profile" />
                    {profile}
                  </label>
                ))}
              </div>
            </div>
          </form>

          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" asChild className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <Link href="/dashboard">View Demo</Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-primary-foreground/60">
            Free during beta. Starter plans are expected to begin around $19/month after launch.
          </p>
        </div>
      </div>
    </section>
  )
}
