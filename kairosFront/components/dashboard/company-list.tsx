'use client'

import { useState, useMemo } from 'react'
import { CompanyCard } from './company-card'
import { CompanyFilters, type FilterState } from './company-filters'
import { sampleCompanies } from '@/lib/sample-data'
import { getTimingStageLabel, type TimingStage } from '@/lib/types'
import { Building2 } from 'lucide-react'

interface CompanyListProps {
  groupByStage?: boolean
}

export function CompanyList({ groupByStage = true }: CompanyListProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    state: 'all',
    city: '',
    industry: 'all',
    timingStage: 'all',
    minScore: '',
  })

  const filteredCompanies = useMemo(() => {
    return sampleCompanies.filter((company) => {
      if (filters.search) {
        const search = filters.search.toLowerCase()
        if (
          !company.name.toLowerCase().includes(search) &&
          !company.industry.toLowerCase().includes(search) &&
          !company.location.city.toLowerCase().includes(search)
        ) {
          return false
        }
      }

      if (filters.state !== 'all' && company.location.state !== filters.state) {
        return false
      }

      if (filters.city && !company.location.city.toLowerCase().includes(filters.city.toLowerCase())) {
        return false
      }

      if (filters.industry !== 'all' && company.industry !== filters.industry) {
        return false
      }

      if (filters.timingStage !== 'all' && company.timingStage !== filters.timingStage) {
        return false
      }

      if (filters.minScore && company.timingScore < parseInt(filters.minScore)) {
        return false
      }

      return true
    })
  }, [filters])

  const groupedCompanies = useMemo(() => {
    if (!groupByStage) return null

    const groups: Record<TimingStage, typeof filteredCompanies> = {
      'best-window': [],
      'warming-up': [],
      'too-early': [],
      'cooling-down': [],
      'old-lead': [],
    }

    filteredCompanies.forEach((company) => {
      groups[company.timingStage].push(company)
    })

    return groups
  }, [filteredCompanies, groupByStage])

  const stageOrder: TimingStage[] = ['best-window', 'warming-up', 'too-early', 'cooling-down', 'old-lead']

  return (
    <div className="space-y-6">
      <CompanyFilters onFilterChange={setFilters} />

      {filteredCompanies.length === 0 ? (
        <div className="surface-card rounded-lg p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No companies found for this market yet.</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Try expanding your city filter or check back after the next data refresh.
          </p>
        </div>
      ) : groupByStage && groupedCompanies ? (
        <div className="space-y-8">
          {stageOrder.map((stage) => {
            const companies = groupedCompanies[stage]
            if (companies.length === 0) return null

            return (
              <div key={stage}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-foreground">
                    {getTimingStageLabel(stage)}
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {companies.length} {companies.length === 1 ? 'company' : 'companies'}
                  </span>
                  </div>
                  <span className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                    Sorted by outreach readiness
                  </span>
                </div>
                <div className="space-y-3">
                  {companies.map((company) => (
                    <CompanyCard key={company.id} company={company} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCompanies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      )}
    </div>
  )
}
