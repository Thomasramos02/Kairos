'use client'

import { useEffect, useState } from 'react'
import { Bell, Check, Mail, Send, Webhook } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { AlertChannel, AlertFrequency, updateKairosAccount } from '@/lib/account-api'
import { getOrFetchAccount, setCachedAccount } from '@/lib/account-session'
import {
  AlertEvent,
  listKairosAlerts,
  listKairosBusinesses,
  markAlertAsRead,
  toCompany,
} from '@/lib/business-api'
import { readKairosMarketTargetSession } from '@/lib/market-target-session'
import { Company } from '@/lib/types'

type AlertFormState = {
  readonly email: boolean
  readonly telegram: boolean
  readonly frequency: AlertFrequency
}

const initialAlertForm: AlertFormState = {
  email: true,
  frequency: 'phase-change',
  telegram: false,
}

export default function AlertsPage() {
  const { toast } = useToast()
  const [accountId, setAccountId] = useState<string | null>(null)
  const [alertEvents, setAlertEvents] = useState<readonly AlertEvent[]>([])
  const [companies, setCompanies] = useState<readonly Company[]>([])
  const [formState, setFormState] = useState<AlertFormState>(initialAlertForm)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [readingIds, setReadingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    getOrFetchAccount().then((account) => {
      if (account === null) {
        setSaveError('Sign in again to manage alert preferences.')
        return
      }

      setAccountId(account.id)
      setFormState({
        email: account.alertPreference.channels.includes('email'),
        frequency: account.alertPreference.frequency,
        telegram: account.alertPreference.channels.includes('telegram'),
      })
      void loadAlertEvents(account.id)
    })
  }, [])

  const loadAlertEvents = async (id: string) => {
    try {
      const [events, businesses] = await Promise.all([
        listKairosAlerts(id),
        listKairosBusinesses({
          offeredService: readKairosMarketTargetSession()?.offeredService,
        }),
      ])
      setAlertEvents(events)
      setCompanies(businesses.map(toCompany))
    } catch (error) {
      setSaveError(formatAlertError(error))
    }
  }

  const handleMarkAsRead = async (alertId: string) => {
    setReadingIds((current) => new Set(current).add(alertId))

    try {
      await markAlertAsRead(alertId)
      setAlertEvents((current) =>
        current.map((event) =>
          event.id === alertId ? { ...event, readAt: new Date().toISOString() } : event,
        ),
      )
    } catch {
      /* silent — mark-as-read failures are non-critical */
    } finally {
      setReadingIds((current) => {
        const next = new Set(current)
        next.delete(alertId)
        return next
      })
    }
  }

  const handleSave = async () => {
    if (accountId === null) {
      setSaveError('Unable to save alerts: expected authenticated account session.')
      return
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      const account = await updateKairosAccount(accountId, {
        alertChannels: buildAlertChannels(formState),
        alertFrequency: formState.frequency,
      })
      setCachedAccount(account)
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      setSaveError(formatAlertError(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Alert Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Configure the MVP alert channels and cadence for reliable timing-score changes.
        </p>
      </div>

      {saveError && (
        <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {saveError}
        </div>
      )}

      <section className="surface-card space-y-6 rounded-lg p-6">
        <SectionHeader icon={Bell} title="Alert channels" />
        <div className="space-y-5 border-t border-border pt-4">
          <SwitchRow
            icon={Mail}
            title="Email Alerts"
            description="Receive alerts for new matches and timing stage changes."
            checked={formState.email}
            onCheckedChange={(email) => setFormState({ ...formState, email })}
          />
          <SwitchRow
            icon={Send}
            title="Telegram Alerts"
            description="Use Telegram for faster notifications when configured in the backend."
            checked={formState.telegram}
            onCheckedChange={(telegram) => setFormState({ ...formState, telegram })}
          />
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
            <div className="flex items-center gap-3">
              <Webhook className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Webhook</p>
                <p className="text-sm text-muted-foreground">
                  Future channel. MVP alert channels are email and Telegram.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast({
                  title: 'Configure Webhook',
                  description: 'Webhook integration is a future feature and is not yet implemented in the MVP.',
                })
              }
            >
              Configure
            </Button>
          </div>
        </div>
      </section>

      <section className="surface-card space-y-6 rounded-lg p-6">
        <SectionHeader icon={Bell} title="Alert cadence" />
        <div className="space-y-2 border-t border-border pt-4">
          <label className="text-sm font-medium text-foreground" htmlFor="alert-frequency">
            Alert frequency
          </label>
          <Select
            value={formState.frequency}
            onValueChange={(frequency) =>
              setFormState({ ...formState, frequency: frequency as AlertFrequency })
            }
          >
            <SelectTrigger id="alert-frequency" className="h-10 w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="phase-change">Phase changes</SelectItem>
              <SelectItem value="daily">Daily digest</SelectItem>
              <SelectItem value="weekly">Weekly digest</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Alerts fire for new market matches, best-window changes, and saved company stage changes.
          </p>
        </div>
      </section>

      <section className="surface-card space-y-6 rounded-lg p-6">
        <SectionHeader icon={Bell} title="Recent alerts" />
        <div className="space-y-3 border-t border-border pt-4">
          {alertEvents.length > 0 ? (
            alertEvents.map((alertEvent) => (
              <AlertEventRow
                alertEvent={alertEvent}
                companyName={resolveAlertBusinessName(alertEvent, companies)}
                key={alertEvent.id}
                isReading={readingIds.has(alertEvent.id)}
                onMarkAsRead={handleMarkAsRead}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Alerts will appear here when covered companies match your target market or saved
              companies change timing stage.
            </p>
          )}
        </div>
      </section>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2" disabled={isSaving}>
          {saved ? <Check className="h-4 w-4" /> : null}
          {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}

function AlertEventRow({
  alertEvent,
  companyName,
  isReading,
  onMarkAsRead,
}: {
  alertEvent: AlertEvent
  companyName: string
  isReading: boolean
  onMarkAsRead: (alertId: string) => void
}) {
  const isUnread = alertEvent.readAt === null

  return (
    <button
      type="button"
      onClick={() => { if (isUnread) { onMarkAsRead(alertEvent.id) } }}
      disabled={isReading}
      className={`w-full rounded-lg border p-3 text-left transition-colors ${
        isUnread
          ? 'border-primary/20 bg-primary/5 hover:bg-primary/10'
          : 'border-border bg-muted/30'
      } ${isReading ? 'opacity-50' : ''}`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          {isUnread && (
            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
          )}
          <div>
            <p className={`font-medium ${isUnread ? 'text-foreground' : 'text-muted-foreground'}`}>
              {formatAlertReason(alertEvent.reason)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{companyName}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{formatAlertDate(alertEvent.createdAt)}</p>
      </div>
      <p className="mt-2 text-xs font-medium uppercase text-muted-foreground">
        {formatAlertChannels(alertEvent.channels)}
      </p>
    </button>
  )
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
    </div>
  )
}

function SwitchRow({
  checked,
  description,
  icon: Icon,
  onCheckedChange,
  title,
}: {
  checked: boolean
  description: string
  icon: React.ComponentType<{ className?: string }>
  onCheckedChange: (checked: boolean) => void
  title: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="font-medium text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

function buildAlertChannels(formState: AlertFormState): readonly AlertChannel[] {
  const channels: AlertChannel[] = []

  if (formState.email) {
    channels.push('email')
  }

  if (formState.telegram) {
    channels.push('telegram')
  }

  return channels
}

function resolveAlertBusinessName(
  alertEvent: AlertEvent,
  companies: readonly Company[],
): string {
  const company = companies.find((item) => item.id === alertEvent.businessId)

  return company?.name ?? `Business ${alertEvent.businessId}`
}

function formatAlertReason(reason: AlertEvent['reason']): string {
  const labels: Record<AlertEvent['reason'], string> = {
    'entered-best-window': 'Entered best outreach window',
    'new-business': 'New business match',
    'timing-stage-changed': 'Timing stage changed',
  }

  return labels[reason]
}

function formatAlertDate(createdAt: string): string {
  return new Date(createdAt).toLocaleString()
}

function formatAlertChannels(channels: readonly AlertChannel[]): string {
  return channels.join(' and ')
}

function formatAlertError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unable to save alerts: received unknown error; expected Kairos API response'
}
