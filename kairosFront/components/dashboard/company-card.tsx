'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TimingBadge } from './timing-badge'
import { Bookmark, Eye, MapPin, Calendar, Building2, Check, FileText, Gauge, Mail } from 'lucide-react'
import { type Company } from '@/lib/types'
import { buildOutreachMessage, copyToClipboard } from '@/lib/mock-actions'

interface CompanyCardProps {
  company: Company
}

export function CompanyCard({ company }: CompanyCardProps) {
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  const formattedDate = company.registeredDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const handleCopyOutreach = async () => {
    await copyToClipboard(buildOutreachMessage(company))
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <article className="surface-card rounded-lg p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
              {company.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/dashboard/company/${company.id}`}
                className="text-base font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
              >
                {company.name}
              </Link>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {company.location.city}, {company.location.state}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {company.industry}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  {company.source}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end gap-3">
          <TimingBadge stage={company.timingStage} />
          <div className="min-w-20 text-right">
            <p className="text-2xl font-bold leading-none text-foreground">{company.timingScore}</p>
            <p className="mt-1 text-xs text-muted-foreground">Timing Score</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t border-border pt-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
              Registered {formattedDate}
          </span>
            <span className="flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5" />
              {company.ageInDays} days old
            </span>
            <span className="font-medium text-primary">{company.recommendedAction}</span>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            {[
              ['Age Window', company.scoreBreakdown.ageWindow],
              ['Fit', company.scoreBreakdown.businessFit],
              ['Contact', company.scoreBreakdown.contactability],
              ['Confidence', company.scoreBreakdown.dataConfidence],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button
            variant={saved ? 'default' : 'outline'}
            size="sm"
            className="h-9 gap-2"
            title={saved ? 'Saved to Watchlist' : 'Save to Watchlist'}
            aria-label={saved ? 'Saved to Watchlist' : 'Save to Watchlist'}
            onClick={() => setSaved(!saved)}
          >
            {saved ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            <span className="hidden sm:inline">{saved ? 'Saved' : 'Save'}</span>
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-2" asChild title="View Details">
            <Link href={`/dashboard/company/${company.id}`}>
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Details</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2"
            onClick={handleCopyOutreach}
            title={copied ? 'Copied' : 'Copy Outreach'}
            aria-label={copied ? 'Copied outreach message' : 'Copy outreach message'}
          >
            {copied ? <Check className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </Button>
        </div>
      </div>
    </article>
  )
}
