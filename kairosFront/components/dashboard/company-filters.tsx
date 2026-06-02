'use client'

import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { states, industries } from '@/lib/sample-data'

interface FiltersProps {
  onFilterChange?: (filters: FilterState) => void
}

export interface FilterState {
  search: string
  state: string
  city: string
  industry: string
  timingStage: string
  minScore: string
}

const timingStages = [
  { value: 'all', label: 'All Stages' },
  { value: 'too-early', label: 'Too Early' },
  { value: 'warming-up', label: 'Warming Up' },
  { value: 'best-window', label: 'Best Outreach Window' },
  { value: 'cooling-down', label: 'Cooling Down' },
  { value: 'old-lead', label: 'Old Lead' },
]

export function CompanyFilters({ onFilterChange }: FiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    state: 'all',
    city: '',
    industry: 'all',
    timingStage: 'all',
    minScore: '',
  })

  const updateFilter = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      search: '',
      state: 'all',
      city: '',
      industry: 'all',
      timingStage: 'all',
      minScore: '',
    }
    setFilters(clearedFilters)
    onFilterChange?.(clearedFilters)
  }

  const hasActiveFilters =
    filters.search ||
    filters.state !== 'all' ||
    filters.city ||
    filters.industry !== 'all' ||
    filters.timingStage !== 'all' ||
    filters.minScore

  return (
    <div className="surface-card rounded-lg p-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search companies..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={filters.state} onValueChange={(v) => updateFilter('state', v)}>
            <SelectTrigger className="w-[140px] h-10">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {states.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.timingStage} onValueChange={(v) => updateFilter('timingStage', v)}>
            <SelectTrigger className="w-[180px] h-10">
              <SelectValue placeholder="Timing Stage" />
            </SelectTrigger>
            <SelectContent>
              {timingStages.map((stage) => (
                <SelectItem key={stage.value} value={stage.value}>
                  {stage.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="h-10 gap-2"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </Button>
        </div>
      </div>

      {showAdvanced && (
        <div className="pt-4 border-t border-border">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">City / Region</label>
              <Input
                type="text"
                placeholder="e.g. Miami"
                value={filters.city}
                onChange={(e) => updateFilter('city', e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Industry</label>
              <Select value={filters.industry} onValueChange={(v) => updateFilter('industry', v)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Min. Timing Score</label>
              <Input
                type="number"
                placeholder="e.g. 70"
                min="0"
                max="100"
                value={filters.minScore}
                onChange={(e) => updateFilter('minScore', e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                <X className="h-4 w-4 mr-1" />
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
