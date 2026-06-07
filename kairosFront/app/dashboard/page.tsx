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
          Coverage: <span className="font-medium text-foreground">Connecticut active</span>
        </div>
      </div>

      <StatsCards />

      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">Companies by Timing Stage</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cards include source, registration date, score breakdown, current stage, and quick actions.
          </p>
        </div>
        <CompanyList groupByStage={true} />
      </div>
    </div>
  )
}
