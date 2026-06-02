'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { sampleCompanies, sampleExports } from '@/lib/sample-data'
import { companyToCsvRow, downloadCsv, exportCompanies, formatFileDate } from '@/lib/mock-actions'
import { Download, FileSpreadsheet, Calendar, Filter, Check } from 'lucide-react'

const exportFields = [
  { id: 'name', label: 'Company name', checked: true },
  { id: 'registeredDate', label: 'Registered date', checked: true },
  { id: 'ageDays', label: 'Age (days)', checked: true },
  { id: 'state', label: 'State', checked: true },
  { id: 'city', label: 'City', checked: true },
  { id: 'industry', label: 'Industry', checked: true },
  { id: 'timingStage', label: 'Timing stage', checked: true },
  { id: 'timingScore', label: 'Timing score', checked: true },
  { id: 'recommendedAction', label: 'Recommended action', checked: true },
  { id: 'source', label: 'Source', checked: true },
]

export default function ExportsPage() {
  const [fields, setFields] = useState(exportFields)
  const [exported, setExported] = useState(false)
  const [downloadedId, setDownloadedId] = useState('')

  const toggleField = (id: string) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, checked: !f.checked } : f)))
  }

  const handleExport = () => {
    const checkedFieldIds = fields.filter((field) => field.checked).map((field) => field.id)
    const rows = sampleCompanies.map((company) => {
      const row = companyToCsvRow(company)
      const fieldMap: Record<string, string> = {
        name: row.company_name,
        registeredDate: row.registered_at,
        ageDays: row.age_days,
        state: row.state,
        city: row.city,
        industry: row.industry,
        timingStage: row.timing_stage,
        timingScore: row.timing_score,
        recommendedAction: row.recommended_action,
        source: row.source,
      }

      return checkedFieldIds.reduce<Record<string, string>>((selected, fieldId) => {
        const field = fields.find((item) => item.id === fieldId)
        if (field) selected[field.label.toLowerCase().replaceAll(' ', '_').replaceAll('.', '')] = fieldMap[fieldId]
        return selected
      }, {})
    })

    downloadCsv(`kairos-current-leads-${formatFileDate()}.csv`, rows)
    setExported(true)
    setTimeout(() => setExported(false), 2000)
  }

  const handleDownloadPrevious = (exportId: string, fileName: string) => {
    exportCompanies(fileName, sampleCompanies.slice(0, 5))
    setDownloadedId(exportId)
    setTimeout(() => setDownloadedId(''), 2000)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Exports</h1>
        <p className="text-muted-foreground mt-1">
          Export company data as CSV files for use in your CRM or outreach tools.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Export Builder */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Export Current Leads</h2>
                <p className="text-sm text-muted-foreground">Download companies matching your filters</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Select fields to include</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {fields.map((field) => (
                    <div key={field.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={field.id}
                        checked={field.checked}
                        onCheckedChange={() => toggleField(field.id)}
                      />
                      <label
                        htmlFor={field.id}
                        className="text-sm font-medium text-foreground cursor-pointer"
                      >
                        {field.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">15 companies</span> will be exported
                  </div>
                  <Button className="gap-2" onClick={handleExport} disabled={!fields.some((field) => field.checked)}>
                    {exported ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                    {exported ? 'Exported' : 'Export CSV'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Export includes all required MVP fields, including source and timing score.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Previous Exports */}
        <div className="space-y-6">
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Previous Exports</h2>

            {sampleExports.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex justify-center mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <FileSpreadsheet className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">No exports yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sampleExports.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {exp.fileName}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {exp.date.toLocaleDateString()}
                          </span>
                          <span>{exp.recordCount} records</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Filter className="h-3 w-3" />
                          <span className="truncate">{exp.filters}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 flex-shrink-0"
                        onClick={() => handleDownloadPrevious(exp.id, exp.fileName)}
                        aria-label={`Download ${exp.fileName}`}
                      >
                        {downloadedId === exp.id ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
