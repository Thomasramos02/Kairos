import Link from 'next/link'
import { ArrowRight, Bell, Bookmark, Download, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'

const companies = [
  {
    name: 'Bright Smile Dental LLC',
    market: 'Hartford, CT',
    industry: 'Healthcare - Dental',
    age: '27 days',
    score: 87,
    stage: 'Best Outreach Window',
    badge: 'timing-best-window',
    action: 'Reach out this week',
  },
  {
    name: 'Peak Fitness Studio LLC',
    market: 'New Haven, CT',
    industry: 'Fitness & Wellness',
    age: '35 days',
    score: 78,
    stage: 'Best Outreach Window',
    badge: 'timing-best-window',
    action: 'Reach out this week',
  },
  {
    name: 'Nova Clean Services LLC',
    market: 'Stamford, CT',
    industry: 'Cleaning Services',
    age: '14 days',
    score: 62,
    stage: 'Warming Up',
    badge: 'timing-warming-up',
    action: 'Add to watchlist',
  },
]

export function DashboardSection() {
  return (
    <section id="dashboard" className="py-20 lg:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Dashboard
            </p>
            <h2 className="mt-3 text-3xl font-bold text-foreground text-balance sm:text-4xl">
              Ranked by outreach readiness, not just listed by date.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              The dashboard keeps the workflow practical: filter your market, see the
              strongest timing windows, save companies, copy contextual outreach, or export.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ['12', 'companies entering best window'],
                ['72', 'average readiness score'],
                ['47', 'saved companies being monitored'],
                ['Daily', 'registry signal refresh'],
              ].map(([value, label]) => (
                <div key={label} className="surface-card rounded-xl p-4">
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>

            <Button className="mt-8 gap-2" asChild>
              <Link href="/dashboard">
                View dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="surface-card overflow-hidden rounded-[1.75rem] p-3">
            <div className="rounded-[1.35rem] border border-border bg-white">
              <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Today&apos;s outreach timing
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-foreground">Connecticut, United States</h3>
                </div>
                <div className="flex gap-2">
                  <button className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm text-muted-foreground">
                    <Search className="h-4 w-4" />
                    Filter
                  </button>
                  <button className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground">
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                </div>
              </div>

              <div className="grid lg:grid-cols-[1fr_18rem]">
                <div className="divide-y divide-border">
                  {companies.map((company) => (
                    <div key={company.name} className="p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{company.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {company.market} - {company.industry}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${company.badge}`}>
                              {company.stage}
                            </span>
                            <span className="inline-flex rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                              {company.age} old
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 sm:text-right">
                          <div>
                            <p className="text-2xl font-bold text-foreground">{company.score}</p>
                            <p className="text-xs text-muted-foreground">Timing Score</p>
                          </div>
                          <button className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground">
                            <Bookmark className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 rounded-xl bg-muted/60 p-3 text-sm">
                        <span className="font-medium text-foreground">Recommended action:</span>{' '}
                        <span className="text-primary">{company.action}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <aside className="border-t border-border bg-slate-50 p-4 lg:border-l lg:border-t-0">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-emerald-700" />
                      <p className="text-sm font-semibold text-emerald-900">Best window alert</p>
                    </div>
                    <p className="mt-3 text-sm text-emerald-900/80">
                      Bright Smile Dental is 27 days old and inside the strongest outreach window.
                    </p>
                  </div>

                  <div className="mt-4 rounded-xl border border-border bg-white p-4">
                    <p className="text-sm font-semibold text-foreground">Suggested approach</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Lead with website setup, Google Business profile support, and patient intake systems.
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-lg border border-border bg-white p-3">
                      <p className="text-lg font-bold text-foreground">92</p>
                      <p className="text-xs text-muted-foreground">Fit</p>
                    </div>
                    <div className="rounded-lg border border-border bg-white p-3">
                      <p className="text-lg font-bold text-foreground">88</p>
                      <p className="text-xs text-muted-foreground">Confidence</p>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
