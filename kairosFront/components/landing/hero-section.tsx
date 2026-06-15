import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Check, Clock, Search, ShieldCheck, Sparkles, Target } from 'lucide-react'

const opportunityFilters = [
  'No website detected',
  'New entity under 30 days',
  'Local business',
  'High confidence',
  'Contact detected',
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-[linear-gradient(180deg,#F7F9FC_0%,#EEF6FB_55%,#FFFFFF_100%)] pt-28 pb-16 lg:pt-32 lg:pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
              <Clock className="h-4 w-4" />
              Opportunity timing for digital presence freelancers
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              Find newly opened local businesses before they fix their online presence.
            </h1>
            
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 text-pretty">
              Kairos helps web designers, landing page builders, branding freelancers,
              and local SEO freelancers spot missing websites, weak local presence,
              public contacts, and fresh timing signals.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
              <Button size="lg" className="h-11 gap-2" asChild>
                <Link href="/signup">
                  Try now for free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-11 gap-2 bg-white" asChild>
                <Link href="/dashboard">
                  View demo
                </Link>
              </Button>
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground lg:justify-start">
              {['No credit card', 'Connecticut active coverage', 'Built for focused outreach'].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" />
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
              {[
                { label: 'Newly registered companies', value: 'Daily', icon: Sparkles },
                { label: 'Outreach readiness', value: '0-100', icon: ShieldCheck },
                { label: 'Lifecycle stages', value: '5', icon: Target },
              ].map((item) => (
                <div key={item.label} className="surface-card rounded-lg p-3">
                  <item.icon className="mb-2 h-4 w-4 text-primary" />
                  <p className="text-base font-semibold text-foreground">{item.value}</p>
                  <p className="mt-1 text-xs leading-4 text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="overflow-hidden rounded-lg border border-border bg-white shadow-xl shadow-slate-900/10">
              <div className="border-b border-border bg-slate-950 p-4 text-white sm:p-5">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Result card</p>
                    <h2 className="mt-2 text-2xl font-semibold">Bright Smile Dental</h2>
                  </div>
                  <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                    High Confidence
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <p className="text-xs text-slate-300">Registered</p>
                    <p className="mt-2 text-2xl font-semibold">12 days ago</p>
                  </div>
                  <div className="rounded-lg border border-emerald-300/20 bg-emerald-400/10 p-4">
                    <p className="text-xs text-emerald-100">Opportunity Score</p>
                    <p className="mt-2 text-4xl font-bold text-emerald-200">91</p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Website status</p>
                  <p className="mt-2 text-xl font-semibold">No website detected</p>
                </div>

                <div className="mt-4 rounded-lg border border-cyan-300/20 bg-cyan-400/10 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">Why approach now?</p>
                  <p className="mt-2 text-lg font-semibold text-cyan-50">
                    New local entity with contact detected
                  </p>
                </div>

                <div className="mt-5 grid gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  {[
                    ['Source', 'State Registry'],
                    ['Market', 'Connecticut, United States'],
                    ['Filter', 'No website detected'],
                    ['Action', 'Offer website or local SEO audit'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-slate-400">{label}</span>
                      <span className="font-medium text-slate-100">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 bg-slate-50 p-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-white p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Why now?</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      The business is new, local, visible in registry data, and still missing basic web presence.
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-white p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">What to do</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Lead with a specific website, landing page, or Google Business Profile gap.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-border bg-white p-3">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Search className="h-4 w-4 text-primary" />
                Opportunity filters
              </div>
              <div className="flex flex-wrap gap-2">
                {opportunityFilters.map((filter) => (
                  <span key={filter} className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    {filter}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
