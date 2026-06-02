'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TimingBadge } from '@/components/dashboard/timing-badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { watchlistCompanies as initialWatchlistCompanies } from '@/lib/sample-data'
import { Eye, Trash2, Bell, BellOff, Bookmark, Check } from 'lucide-react'
import { type TimingStage, type WatchlistStatus } from '@/lib/types'

const statusLabels: Record<WatchlistStatus, { label: string; color: string }> = {
  'waiting': { label: 'Waiting', color: 'bg-muted text-muted-foreground' },
  'ready-to-contact': { label: 'Ready to Contact', color: 'bg-[#D1FAE5] text-[#065F46]' },
  'contacted': { label: 'Contacted', color: 'bg-primary/10 text-primary' },
  'archived': { label: 'Archived', color: 'bg-muted text-muted-foreground' },
  'not-a-fit': { label: 'Not a Fit', color: 'bg-destructive/10 text-destructive' },
}

export default function WatchlistPage() {
  const [companies, setCompanies] = useState(initialWatchlistCompanies)
  const [statusFilter, setStatusFilter] = useState<WatchlistStatus | 'all'>('all')
  const [stageFilter, setStageFilter] = useState<TimingStage | 'all'>('all')
  const [removedName, setRemovedName] = useState('')

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      if (statusFilter !== 'all' && company.watchlistStatus !== statusFilter) return false
      if (stageFilter !== 'all' && company.timingStage !== stageFilter) return false
      return true
    })
  }, [companies, stageFilter, statusFilter])

  const updateStatus = (companyId: string, watchlistStatus: WatchlistStatus) => {
    setCompanies((current) =>
      current.map((company) => (company.id === companyId ? { ...company, watchlistStatus } : company))
    )
  }

  const toggleAlert = (companyId: string) => {
    setCompanies((current) =>
      current.map((company) =>
        company.id === companyId ? { ...company, alertEnabled: !company.alertEnabled } : company
      )
    )
  }

  const removeCompany = (companyId: string) => {
    const company = companies.find((item) => item.id === companyId)
    if (company) {
      setRemovedName(company.name)
      setTimeout(() => setRemovedName(''), 2500)
    }
    setCompanies((current) => current.filter((item) => item.id !== companyId))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Watchlist</h1>
          <p className="text-muted-foreground mt-1">
            Monitor saved companies until they change stage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{companies.length} companies</span>
        </div>
      </div>

      {removedName && (
        <div className="surface-card rounded-lg border-[#A7F3D0] bg-[#D1FAE5]/60 p-4 text-sm text-[#065F46]">
          <Check className="mr-2 inline h-4 w-4" />
          {removedName} was removed from your mock watchlist.
        </div>
      )}

      {/* Filters */}
      <div className="surface-card rounded-lg p-4 flex flex-wrap items-center gap-4">
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as WatchlistStatus | 'all')}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="waiting">Waiting</SelectItem>
            <SelectItem value="ready-to-contact">Ready to Contact</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="not-a-fit">Not a Fit</SelectItem>
          </SelectContent>
        </Select>

        <Select value={stageFilter} onValueChange={(value) => setStageFilter(value as TimingStage | 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Timing Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="too-early">Too Early</SelectItem>
            <SelectItem value="best-window">Best Window</SelectItem>
            <SelectItem value="warming-up">Warming Up</SelectItem>
            <SelectItem value="cooling-down">Cooling Down</SelectItem>
            <SelectItem value="old-lead">Old Lead</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Watchlist Table */}
      {filteredCompanies.length === 0 ? (
        <div className="surface-card rounded-lg p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Bookmark className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {companies.length === 0 ? 'No companies in your watchlist' : 'No companies match these filters'}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            {companies.length === 0
              ? 'Save companies from the dashboard to track them and get notified when they change stage.'
              : 'Adjust your status or timing stage filters to see more saved companies.'}
          </p>
          <Button asChild>
            <Link href="/dashboard">Browse Companies</Link>
          </Button>
        </div>
      ) : (
        <div className="surface-card rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Company</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Timing Stage</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Score</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Age</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Source</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Expected Change</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Alert</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company) => {
                  const status = statusLabels[company.watchlistStatus]
                  return (
                    <tr key={company.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="py-4 px-6">
                        <Link
                          href={`/dashboard/company/${company.id}`}
                          className="font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {company.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {company.location.city}, {company.location.state}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <TimingBadge stage={company.timingStage} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-sm font-semibold text-foreground">
                        {company.timingScore}
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {company.ageInDays} days
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {company.source}
                      </td>
                      <td className="py-4 px-4">
                        <Select
                          value={company.watchlistStatus}
                          onValueChange={(value) => updateStatus(company.id, value as WatchlistStatus)}
                        >
                          <SelectTrigger className="h-8 w-[150px]">
                            <SelectValue>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                {status.label}
                              </span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="waiting">Waiting</SelectItem>
                            <SelectItem value="ready-to-contact">Ready to Contact</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                            <SelectItem value="not-a-fit">Not a Fit</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {company.expectedStageChange}
                      </td>
                      <td className="py-4 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => toggleAlert(company.id)}
                          aria-label={company.alertEnabled ? 'Disable alert' : 'Enable alert'}
                        >
                          {company.alertEnabled ? (
                            <Bell className="h-4 w-4 text-primary" />
                          ) : (
                            <BellOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                            <Link href={`/dashboard/company/${company.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => removeCompany(company.id)}
                            aria-label={`Remove ${company.name} from watchlist`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
