'use client'

import { useEffect, useState } from 'react'
import { BadgeCheck, Building2, FileText } from 'lucide-react'

import { readKairosAccountSession } from '@/lib/account-session'
import { enrichKairosIndustryByCompanyId } from '@/lib/business-api'
import { CorporateIndustryEnrichment } from '@/lib/types'

type CompanyIndustryEnrichmentProps = {
  readonly companyId: string
  readonly sourceDocumentNumber?: string | null
  readonly state: string
}

const supportedIndustryStates = ['CT', 'GA', 'CO', 'FL'] as const

export function CompanyIndustryEnrichment({
  companyId,
  sourceDocumentNumber,
  state,
}: CompanyIndustryEnrichmentProps) {
  const [enrichment, setEnrichment] = useState<CorporateIndustryEnrichment | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const normalizedState = state.toUpperCase()
  const canLoadEnrichment = isSupportedIndustryState(normalizedState) && hasRegistryId(sourceDocumentNumber)

  useEffect(() => {
    if (!canLoadEnrichment || sourceDocumentNumber === undefined || sourceDocumentNumber === null) {
      return
    }

    void loadIndustryEnrichment(normalizedState, sourceDocumentNumber)
  }, [canLoadEnrichment, normalizedState, sourceDocumentNumber])

  async function loadIndustryEnrichment(
    targetState: string,
    registryId: string,
  ): Promise<void> {
    const session = readKairosAccountSession()

    if (session === null) {
      setLoadError('Sign in again to load official industry details.')
      return
    }

    setIsLoading(true)
    setLoadError(null)

    try {
      setEnrichment(await enrichKairosIndustryByCompanyId(session.accessToken, targetState, registryId))
    } catch (error) {
      setLoadError(formatIndustryEnrichmentError(error))
    } finally {
      setIsLoading(false)
    }
  }

  if (!hasRegistryId(sourceDocumentNumber)) {
    return null
  }

  return (
    <div className="mt-3 grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
      <IndustryDetailTile icon={<FileText className="h-3.5 w-3.5" />} label="Registry ID" value={sourceDocumentNumber} />
      <IndustryDetailTile icon={<Building2 className="h-3.5 w-3.5" />} label="NAICS" value={resolveNaicsLabel(enrichment, isLoading, loadError)} />
      <IndustryDetailTile icon={<Building2 className="h-3.5 w-3.5" />} label="Industry detail" value={resolveIndustryLabel(enrichment, normalizedState)} />
      <IndustryDetailTile icon={<BadgeCheck className="h-3.5 w-3.5" />} label="Classification confidence" value={resolveConfidenceLabel(enrichment, normalizedState)} />
    </div>
  )
}

function IndustryDetailTile({
  icon,
  label,
  value,
}: {
  readonly icon: React.ReactNode
  readonly label: string
  readonly value: string
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-background px-3 py-2 hover:border-primary/30 transition-colors">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold leading-5 text-foreground break-words" title={value}>
        {value}
      </p>
    </div>
  )
}

function resolveNaicsLabel(
  enrichment: CorporateIndustryEnrichment | null,
  isLoading: boolean,
  loadError: string | null,
): string {
  if (enrichment !== null) {
    return enrichment.naics_code || 'Purpose only'
  }

  if (isLoading) {
    return 'Loading...'
  }

  return loadError ?? 'Not available'
}

function resolveIndustryLabel(
  enrichment: CorporateIndustryEnrichment | null,
  state: string,
): string {
  if (enrichment !== null) {
    return enrichment.industry
  }

  return isSupportedIndustryState(state) ? 'Loading classification' : 'Not in enrichment scope'
}

function resolveConfidenceLabel(
  enrichment: CorporateIndustryEnrichment | null,
  state: string,
): string {
  if (enrichment !== null) {
    return `${Math.round(enrichment.confidence_score * 100)}%`
  }

  return isSupportedIndustryState(state) ? 'Pending' : 'Registry only'
}

function hasRegistryId(sourceDocumentNumber: string | null | undefined): sourceDocumentNumber is string {
  return sourceDocumentNumber !== undefined && sourceDocumentNumber !== null && sourceDocumentNumber.trim().length > 0
}

function isSupportedIndustryState(state: string): state is (typeof supportedIndustryStates)[number] {
  return supportedIndustryStates.includes(state as (typeof supportedIndustryStates)[number])
}

function formatIndustryEnrichmentError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unable to load industry: received unknown error; expected Kairos API response'
}
