import { StatsCards } from '@/components/dashboard/stats-cards'
import { CompanyList } from '@/components/dashboard/company-list'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Today&apos;s Outreach Timing</h1>
          <p className="text-muted-foreground mt-1">
            Which new businesses should you pay attention to today, and why now?
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
          Coverage: <span className="font-medium text-foreground">Connecticut + Rhode Island active</span>
        </div>
      </div>

      <StatsCards />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">Companies by Timing Stage</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Cards include source, registration date, score breakdown, current stage, and quick actions.
            </p>
          </div>
          <CompanyList groupByStage={true} />
        </div>

        <div className="space-y-6">
          <section className="surface-card rounded-lg p-5 border border-amber-200/50 bg-amber-50/50">
            <h3 className="text-sm font-semibold text-amber-800 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-200 text-amber-800 text-xs font-bold">!</span>
              Need Attention
            </h3>
            <p className="mt-2 text-xs text-amber-700">
              Companies in their best outreach window with high timing scores — prioritize these.
            </p>
          </section>

          <section className="surface-card rounded-lg p-5 border border-emerald-200/50 bg-emerald-50/50">
            <h3 className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-200 text-emerald-800 text-xs font-bold">N</span>
              Recently Launched
            </h3>
            <p className="mt-2 text-xs text-emerald-700">
              Businesses registered within the last 7 days. Early signals are still forming.
            </p>
          </section>

          <section className="surface-card rounded-lg p-5 border border-orange-200/50 bg-orange-50/50">
            <h3 className="text-sm font-semibold text-orange-800 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-200 text-orange-800 text-xs font-bold">&gt;</span>
              Expiring Soon
            </h3>
            <p className="mt-2 text-xs text-orange-700">
              Companies approaching the end of their best outreach window. Act soon.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
