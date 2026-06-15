import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Check } from 'lucide-react'

const benefits = ['No credit card', 'Focused opportunity filters', 'Built for web and local SEO freelancers']

export function CTASection() {
  return (
    <section id="pricing" className="bg-primary py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground text-balance">
            Find the next local business before its website exists.
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80 text-pretty">
            Join the beta for web designers, landing page builders, branding freelancers,
            and local SEO freelancers who want cleaner, better-timed prospects.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button type="button" size="lg" variant="secondary" className="h-11 gap-2" asChild>
              <Link href="/signup">
                Try now for free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-11 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <Link href="/dashboard">View Demo</Link>
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-primary-foreground/75">
            {benefits.map((benefit) => (
              <span key={benefit} className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4" />
                {benefit}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
