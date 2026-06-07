import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, Clock, ShieldCheck, Sparkles, Target } from 'lucide-react'

const profiles = ['Agency', 'SDR', 'Freelancer', 'Consultant', 'SaaS']

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 lg:pt-32 lg:pb-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_15%,rgba(37,99,235,0.14),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(6,182,212,0.14),transparent_28%),linear-gradient(180deg,#F7F9FC_0%,#EEF6FB_58%,#F7F9FC_100%)]" />
      <div className="absolute left-1/2 top-24 -z-10 h-72 w-[56rem] -translate-x-1/2 rounded-full bg-white/70 blur-3xl" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
              <Clock className="h-4 w-4" />
              Commercial timing for outbound teams
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              Find new businesses while they&apos;re still choosing suppliers.
            </h1>
            
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 text-pretty">
              Kairos tracks newly registered companies, scores their outreach timing,
              and helps SDRs, agencies, and consultants act before competitors crowd the account.
            </p>

            <form className="surface-card mt-8 rounded-xl p-3 text-left">
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="sr-only" htmlFor="hero-email">Work email</label>
                <Input
                  id="hero-email"
                  type="email"
                  placeholder="you@company.com"
                  className="h-11 bg-white"
                />
                <Button type="button" size="lg" className="h-11 shrink-0 gap-2">
                  Get early access
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  What best describes you? <span className="normal-case tracking-normal">(optional)</span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {profiles.map((profile) => (
                    <label
                      key={profile}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      <input className="h-3.5 w-3.5 accent-primary" type="radio" name="profile" />
                      {profile}
                    </label>
                  ))}
                </div>
              </div>
            </form>

            <p className="mt-4 text-sm text-muted-foreground">
              Connecticut active coverage. No credit card required.
            </p>

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

          <div className="relative">
            <div className="surface-card relative overflow-hidden rounded-[2rem] p-4 sm:p-6">
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <div className="rounded-[1.5rem] border border-border bg-[#0F172A] p-4 text-white shadow-2xl shadow-slate-900/20 sm:p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Result card</p>
                    <h2 className="mt-2 text-2xl font-semibold">BrightWave Roofing</h2>
                  </div>
                  <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                    Best Window
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs text-slate-300">Registered</p>
                    <p className="mt-2 text-2xl font-semibold">12 days ago</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4">
                    <p className="text-xs text-emerald-100">Timing Score</p>
                    <p className="mt-2 text-4xl font-bold text-emerald-200">91</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Best Outreach Window</p>
                  <p className="mt-2 text-xl font-semibold">Now - 14 days</p>
                </div>

                <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">Suggested Approach</p>
                  <p className="mt-2 text-lg font-semibold text-cyan-50">
                    Website, CRM and Google Business setup
                  </p>
                </div>

                <div className="mt-5 grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  {[
                    ['Source', 'State Registry'],
                    ['Market', 'Connecticut, United States'],
                    ['Action', 'Send contextual intro'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-slate-400">{label}</span>
                      <span className="font-medium text-slate-100">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-white p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Why now?</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      The company has moved past setup chaos, but supplier decisions are still likely open.
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-white p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">What to do</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Start with setup help, not a generic sales pitch.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-3 hidden rounded-2xl border border-border bg-white px-4 py-3 shadow-xl sm:block">
              <p className="text-xs text-muted-foreground">Today&apos;s ready opportunities</p>
              <p className="text-2xl font-bold text-foreground">12</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
