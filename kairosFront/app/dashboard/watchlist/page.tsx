'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bookmark, Check, Eye, Trash2 } from 'lucide-react'

import { TimingBadge } from '@/components/dashboard/timing-badge'
import { Button } from '@/components/ui/button'
import {
  getKairosBusiness,
  listKairosWatchlist,
  removeKairosWatchlistItem,
  BusinessListItem,
  toCompany,
  WatchlistItem,
} from '@/lib/business-api'
import { readKairosAccountSession } from '@/lib/account-session'
import { readKairosMarketTargetSession } from '@/lib/market-target-session'
import { Company } from '@/lib/types'

export default function WatchlistPage() {
  const [companies, setCompanies] = useState<readonly Company[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [removedName, setRemovedName] = useState('')

  useEffect(() => {
    void loadWatchlist()
  }, [])

  const loadWatchlist = async () => {
    const session = readKairosAccountSession()

    if (session === null) {
      setLoadError('Sign in again to load your watchlist.')
      setIsLoading(false)
      return
    }

    try {
      const savedItems = await listKairosWatchlist(session.account.id, session.accessToken)
      const businesses = await loadSavedBusinesses(session.accessToken, savedItems)
      setCompanies(businesses.map(toCompany))
    } catch (error) {
      setLoadError(formatWatchlistError(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = async (company: Company) => {
    const session = readKairosAccountSession()

    if (session === null) {
      setLoadError('Sign in again to remove this company.')
      return
    }

    try {
      await removeKairosWatchlistItem(session.account.id, session.accessToken, company.id)
      setCompanies((current) => current.filter((item) => item.id !== company.id))
      setRemovedName(company.name)
      window.setTimeout(() => setRemovedName(''), 2500)
    } catch (error) {
      setLoadError(formatWatchlistError(error))
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Watchlist</h1>
          <p className="mt-1 text-muted-foreground">
            Monitor saved companies until their service-specific timing stage changes.
          </p>
        </div>
        <span className="text-sm text-muted-foreground">{companies.length} companies</span>
      </div>

      {loadError && (
        <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {loadError}
        </div>
      )}

      {removedName && (
        <div className="rounded-lg border border-[#A7F3D0] bg-[#D1FAE5]/60 p-4 text-sm text-[#065F46]">
          <Check className="mr-2 inline h-4 w-4" />
          {removedName} was removed from your watchlist.
        </div>
      )}

      {isLoading ? (
        <div className="surface-card rounded-lg p-12 text-center text-muted-foreground">
          Loading watchlist...
        </div>
      ) : companies.length === 0 ? (
        <EmptyWatchlist />
      ) : (
        <div className="surface-card overflow-hidden rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Company</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Stage</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Score</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Age</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Signals</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/company/${company.id}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {company.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {company.location.city}, {company.location.state}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <TimingBadge stage={company.timingStage} size="sm" />
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold">{company.timingScore}</td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {company.ageInDays} days
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {company.digitalSignals?.length ?? 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <Button variant="ghost" size="sm" className="h-8 gap-2" asChild>
                          <Link href={`/dashboard/company/${company.id}`}>
                            <Eye className="h-4 w-4" />
                            Details
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-2 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemove(company)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

async function loadSavedBusinesses(
  accessToken: string,
  savedItems: readonly WatchlistItem[],
): Promise<readonly BusinessListItem[]> {
  const offeredService = readKairosMarketTargetSession()?.offeredService
  const query = offeredService === undefined ? undefined : { offeredService }

  return await Promise.all(
    savedItems.map((item) =>
      getKairosBusiness(accessToken, item.businessId, query),
    ),
  )
}

function EmptyWatchlist() {
  return (
    <div className="surface-card rounded-lg p-12 text-center">
      <div className="mb-4 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Bookmark className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">No companies saved yet</h3>
      <p className="mx-auto mb-6 max-w-md text-muted-foreground">
        Save companies from the covered business list to monitor timing stage changes.
      </p>
      <Button asChild>
        <Link href="/dashboard/businesses">Browse Companies</Link>
      </Button>
    </div>
  )
}

function formatWatchlistError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unable to load watchlist: received unknown error; expected Kairos API response'
}
