'use client'

import { useEffect, useState } from 'react'
import { Building2, Target, Bookmark, TrendingUp } from 'lucide-react'
import { fetchDashboardStats } from '@/lib/business-api'
import type { DashboardStats } from '@/lib/business-api'

const defaultStats: DashboardStats = {
  newToday: 0,
  enteringBestWindow: 0,
  savedCompanies: 0,
  avgReadiness: 0,
}

const statConfigs = [
  {
    name: 'New businesses today',
    key: 'newToday' as const,
    icon: Building2,
    change: '+5 from yesterday',
    changeType: 'positive' as const,
  },
  {
    name: 'Entering best window',
    key: 'enteringBestWindow' as const,
    suffix: 'this week',
    icon: Target,
    change: 'Ready for outreach',
    changeType: 'highlight' as const,
  },
  {
    name: 'Saved companies',
    key: 'savedCompanies' as const,
    icon: Bookmark,
    change: 'Awaiting action',
    changeType: 'neutral' as const,
  },
  {
    name: 'Avg. outreach readiness',
    key: 'avgReadiness' as const,
    suffix: '/100',
    icon: TrendingUp,
    change: 'Across all stages',
    changeType: 'neutral' as const,
  },
]

export function StatsCards() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats)

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch(() => {})
  }, [])

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statConfigs.map((config) => {
        const value = stats[config.key]
        return (
          <div
            key={config.name}
            className="surface-card rounded-lg p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <config.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {value}
                {config.suffix && (
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {config.suffix}
                  </span>
                )}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{config.name}</p>
            </div>
            <p
              className={`text-xs mt-3 ${
                config.changeType === 'positive'
                  ? 'text-[#10B981]'
                  : config.changeType === 'highlight'
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground'
              }`}
            >
              {config.change}
            </p>
          </div>
        )
      })}
    </div>
  )
}
