import { Company, getTimingStageLabel } from './types'

export function buildOutreachMessage(company: Company) {
  const firstWord = company.name.split(' ')[0]

  return `Hi ${firstWord} team,

I noticed your business was recently registered in ${company.location.city}, ${company.location.state}. Congratulations on getting started.

I work with early-stage ${company.industry.toLowerCase()} businesses that are setting up their first systems, website, marketing, or operations.

Are you already handling that internally, or is it still on your setup list?

Best,
[Your Name]`
}

export async function copyToClipboard(text: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

export function companyToCsvRow(company: Company) {
  return {
    company_name: company.name,
    registered_at: company.registeredDate.toISOString().slice(0, 10),
    age_days: String(company.ageInDays),
    state: company.location.state,
    city: company.location.city,
    industry: company.industry,
    timing_stage: getTimingStageLabel(company.timingStage),
    timing_score: String(company.timingScore),
    website_status: company.opportunity.websiteStatus,
    digital_presence_status: company.opportunity.digitalPresenceStatus,
    contact_detected: String(company.opportunity.contactDetected),
    opportunity_filters: company.opportunityFilters.join('|'),
    recommended_action: company.recommendedAction,
    source: company.source,
  }
}

export function downloadCsv(fileName: string, rows: Record<string, string>[]) {
  if (rows.length === 0) return

  const headers = Object.keys(rows[0])
  const escapeValue = (value: string) => `"${value.replaceAll('"', '""')}"`
  const csv = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => escapeValue(row[header] ?? '')).join(',')),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportCompanies(fileName: string, companies: Company[]) {
  downloadCsv(fileName, companies.map(companyToCsvRow))
}

export function formatFileDate(date = new Date()) {
  return date.toISOString().slice(0, 10)
}
