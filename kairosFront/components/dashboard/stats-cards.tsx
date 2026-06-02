import { Building2, Target, Bookmark, TrendingUp } from 'lucide-react'
import { dashboardStats } from '@/lib/sample-data'

const stats = [
  {
    name: 'New businesses today',
    value: dashboardStats.newToday,
    icon: Building2,
    change: '+5 from yesterday',
    changeType: 'positive' as const,
  },
  {
    name: 'Entering best window',
    value: dashboardStats.enteringBestWindow,
    suffix: 'this week',
    icon: Target,
    change: 'Ready for outreach',
    changeType: 'highlight' as const,
  },
  {
    name: 'Saved companies',
    value: dashboardStats.savedCompanies,
    icon: Bookmark,
    change: '8 awaiting action',
    changeType: 'neutral' as const,
  },
  {
    name: 'Avg. outreach readiness',
    value: dashboardStats.avgReadiness,
    suffix: '/100',
    icon: TrendingUp,
    change: '+3 from last week',
    changeType: 'positive' as const,
  },
]

export function StatsCards() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="surface-card rounded-lg p-5 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {stat.value}
              {stat.suffix && (
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  {stat.suffix}
                </span>
              )}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{stat.name}</p>
          </div>
          <p
            className={`text-xs mt-3 ${
              stat.changeType === 'positive'
                ? 'text-[#10B981]'
                : stat.changeType === 'highlight'
                ? 'text-primary font-medium'
                : 'text-muted-foreground'
            }`}
          >
            {stat.change}
          </p>
        </div>
      ))}
    </div>
  )
}
