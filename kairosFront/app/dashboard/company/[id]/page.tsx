'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { TimingBadge } from '@/components/dashboard/timing-badge'
import {
  ArrowLeft,
  Bookmark,
  Download,
  CheckCircle,
  StickyNote,
  Copy,
  MapPin,
  Calendar,
  Building2,
  FileText,
  Check,
} from 'lucide-react'
import { sampleCompanies } from '@/lib/sample-data'
import { getTimingStageDescription } from '@/lib/types'
import { buildOutreachMessage, copyToClipboard, exportCompanies, formatFileDate } from '@/lib/mock-actions'

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const company = sampleCompanies.find((c) => c.id === resolvedParams.id) || sampleCompanies[0]
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [contacted, setContacted] = useState(false)
  const [exported, setExported] = useState(false)
  const [showNote, setShowNote] = useState(false)
  const [note, setNote] = useState('')
  const [noteSaved, setNoteSaved] = useState(false)

  const outreachMessage = buildOutreachMessage(company)

  const handleCopyMessage = async () => {
    await copyToClipboard(outreachMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportCompany = () => {
    exportCompanies(`kairos-${company.name.toLowerCase().replaceAll(' ', '-')}-${formatFileDate()}.csv`, [company])
    setExported(true)
    setTimeout(() => setExported(false), 2000)
  }

  const handleSaveNote = () => {
    setNoteSaved(true)
    setTimeout(() => setNoteSaved(false), 2000)
  }

  const stageDescription = getTimingStageDescription(company.timingStage)

  const timelineStages = [
    { name: 'Registered', date: company.registeredDate.toLocaleDateString(), completed: true },
    { name: 'Warming Up', date: '8-21 days', completed: company.ageInDays >= 8 },
    { name: 'Best Window', date: '22-45 days', completed: company.ageInDays >= 22, current: company.timingStage === 'best-window' },
    { name: 'Cooling Down', date: '46-90 days', completed: company.ageInDays >= 46 },
  ]

  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="surface-card rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xl flex-shrink-0">
              {company.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{company.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {company.location.city}, {company.location.state}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {company.industry}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {company.ageInDays} days old
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {company.source}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <TimingBadge stage={company.timingStage} size="md" />
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{company.timingScore}</p>
                <p className="text-xs text-muted-foreground">Timing Score</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="surface-card rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Timing Analysis</h2>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Recommended Action</span>
                  <span className="text-sm font-semibold text-primary">{company.recommendedAction}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {stageDescription}
                </p>
              </div>

              {company.timingStage === 'best-window' && (
                <div className="p-4 rounded-lg border border-[#A7F3D0] bg-[#D1FAE5]/30">
                  <p className="text-sm text-[#065F46]">
                    <span className="font-medium">Why now?</span> This company is {company.ageInDays} days old, 
                    which places it inside the 2-6 week window where new businesses are often more stable but 
                    may still be choosing vendors.
                  </p>
                </div>
              )}
            </div>

            {/* Score Breakdown */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-foreground mb-3">Timing Score Breakdown</h3>
              <div className="space-y-3">
                {[
                  { label: 'Age Window', value: company.scoreBreakdown.ageWindow, max: 100 },
                  { label: 'Business Fit', value: company.scoreBreakdown.businessFit, max: 15 },
                  { label: 'Contactability', value: company.scoreBreakdown.contactability, max: 10 },
                  { label: 'Data Confidence', value: company.scoreBreakdown.dataConfidence, max: 10 },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-32">{item.label}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(item.value / item.max) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground w-12 text-right">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Timing Score estimates how favorable the current moment is for outreach. 
                It does not predict purchase intent.
              </p>
            </div>
          </div>

          <div className="surface-card rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Business Timeline</h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

              <div className="space-y-6">
                {timelineStages.map((stage, index) => (
                  <div key={stage.name} className="relative flex items-start gap-4 pl-10">
                    <div
                      className={`absolute left-2 w-5 h-5 rounded-full flex items-center justify-center ${
                        stage.current
                          ? 'bg-[#10B981] ring-4 ring-[#D1FAE5]'
                          : stage.completed
                          ? 'bg-primary'
                          : 'bg-muted'
                      }`}
                    >
                      {(stage.completed || stage.current) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${stage.current ? 'text-[#10B981]' : 'text-foreground'}`}>
                        {stage.name}
                        {stage.current && <span className="ml-2 text-xs">(Current)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{stage.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="surface-card rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Suggested Outreach</h2>
              <Button variant="outline" size="sm" onClick={handleCopyMessage} className="gap-2">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Message'}
              </Button>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 font-mono text-sm text-foreground whitespace-pre-wrap">
              {outreachMessage}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Actions</h2>
            <div className="space-y-3">
              <Button className="w-full justify-start gap-2" variant={saved ? 'outline' : 'default'} onClick={() => setSaved(!saved)}>
                {saved ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                {saved ? 'Saved to Watchlist' : 'Save to Watchlist'}
              </Button>
              <Button className="w-full justify-start gap-2" variant="outline" onClick={handleExportCompany}>
                {exported ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                {exported ? 'Exported CSV' : 'Export Company'}
              </Button>
              <Button className="w-full justify-start gap-2" variant={contacted ? 'default' : 'outline'} onClick={() => setContacted(!contacted)}>
                <CheckCircle className="h-4 w-4" />
                {contacted ? 'Marked as Contacted' : 'Mark as Contacted'}
              </Button>
              <Button className="w-full justify-start gap-2" variant="outline" onClick={() => setShowNote(!showNote)}>
                <StickyNote className="h-4 w-4" />
                {showNote ? 'Hide Note' : note ? 'Edit Note' : 'Add Note'}
              </Button>
            </div>

            {showNote && (
              <div className="mt-4 space-y-3 border-t border-border pt-4">
                <Textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Add context before outreach, like owner name, website status, or next step."
                  rows={4}
                />
                <Button size="sm" variant="outline" onClick={handleSaveNote} className="gap-2">
                  {noteSaved ? <Check className="h-4 w-4" /> : <StickyNote className="h-4 w-4" />}
                  {noteSaved ? 'Note Saved' : 'Save Note'}
                </Button>
              </div>
            )}
          </div>

          <div className="surface-card rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Company Information</h2>
            <div className="space-y-3">
              {[
                { label: 'Registered Date', value: company.registeredDate.toLocaleDateString() },
                { label: 'Age', value: `${company.ageInDays} days` },
                { label: 'State', value: company.location.state },
                { label: 'City', value: company.location.city },
                { label: 'Industry', value: company.industry },
                { label: 'Source', value: company.source },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
