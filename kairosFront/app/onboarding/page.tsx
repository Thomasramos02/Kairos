'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Bell, Building2, MapPin, Target } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertChannel,
  AlertFrequency,
  CreateMarketTargetPayload,
  createKairosMarketTarget,
  OfferedService,
  updateKairosAccount,
} from '@/lib/account-api'
import {
  getOrFetchAccount,
  setCachedAccount,
} from '@/lib/account-session'
import { saveKairosMarketTargetSession } from '@/lib/market-target-session'
import { industries } from '@/lib/sample-data'
import {
  findUsStateOption,
  formatCoverageStatusLabel,
  usStateOptions,
} from '@/lib/us-state-options'

type OnboardingFields = {
  readonly state: string
  readonly cityOrRegion: string
  readonly industry: string
  readonly desiredCustomerType: string
  readonly offeredService: OfferedService
  readonly alertFrequency: AlertFrequency
  readonly alertChannels: Record<AlertChannel, boolean>
}

type OnboardingErrors = Partial<Record<keyof OnboardingFields | 'form', string>>

const customerTypes = ['Agencies', 'SDRs', 'Freelancers', 'Consultants', 'SaaS teams']

const offeredServiceLabels: Record<OfferedService, string> = {
  'website-design-development': 'Website design & development',
  branding: 'Branding',
  'seo-local-seo': 'SEO / local SEO',
  'paid-marketing': 'Paid marketing',
  'social-media-marketing': 'Social media marketing',
  'e-commerce-services': 'E-commerce services',
}

const initialFields: OnboardingFields = {
  alertChannels: { email: true, telegram: false },
  alertFrequency: 'phase-change',
  cityOrRegion: '',
  desiredCustomerType: '',
  industry: '',
  offeredService: 'website-design-development',
  state: 'Connecticut',
}

export default function OnboardingPage() {
  const router = useRouter()
  const [session, setSession] = useState<{ id: string } | null>(null)
  const [fields, setFields] = useState<OnboardingFields>(initialFields)
  const [errors, setErrors] = useState<OnboardingErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    getOrFetchAccount().then((account) => {
      if (account === null) {
        router.push('/login')
        return
      }
      setSession(account)
    })
  }, [router])

  const updateField = <Field extends keyof OnboardingFields>(
    field: Field,
    value: OnboardingFields[Field],
  ) => {
    setFields((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const nextErrors = validateOnboardingFields(fields)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    await saveOnboarding()
  }

  const saveOnboarding = async () => {
    if (session === null) {
      setErrors({ form: 'Unable to save onboarding: expected signed-in account session.' })
      return
    }

    setIsLoading(true)

    try {
      await persistOnboarding(session, fields)
      router.push('/dashboard')
    } catch (error) {
      setErrors({ form: formatOnboardingError(error) })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedState = findUsStateOption(fields.state)

  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex items-center justify-center px-6 py-10 lg:px-12">
          <div className="w-full max-w-2xl">
            <KairosLogo />
            <PageHeader />
            {errors.form && <FormError message={errors.form} />}

            <form onSubmit={handleSubmit} className="space-y-6">
              <SectionCard icon={MapPin} title="Target location">
                <div className="grid gap-4 sm:grid-cols-2">
                  <ReadOnlyField label="Country" value="United States" />
                  <StateSelect
                    error={errors.state}
                    value={fields.state}
                    onChange={(value) => updateField('state', value)}
                  />
                </div>
                <TextField
                  id="cityOrRegion"
                  label="City or region"
                  helper="Leave blank to monitor the full state."
                  placeholder="Miami, Orlando, Tampa"
                  value={fields.cityOrRegion}
                  onChange={(value) => updateField('cityOrRegion', value)}
                />
              </SectionCard>

              <SectionCard icon={Building2} title="Market fit">
                <IndustrySelect
                  error={errors.industry}
                  value={fields.industry}
                  onChange={(value) => updateField('industry', value)}
                />
                <SelectField
                  id="desiredCustomerType"
                  label="Desired customer type"
                  error={errors.desiredCustomerType}
                  placeholder="Select customer type"
                  value={fields.desiredCustomerType}
                  values={customerTypes}
                  onChange={(value) => updateField('desiredCustomerType', value)}
                />
                <SelectField
                  id="offeredService"
                  label="Service you sell"
                  value={fields.offeredService}
                  values={Object.keys(offeredServiceLabels)}
                  labels={offeredServiceLabels}
                  onChange={(value) => updateField('offeredService', value as OfferedService)}
                />
              </SectionCard>

              <SectionCard icon={Bell} title="Alert preferences">
                <SelectField
                  id="alertFrequency"
                  label="Alert frequency"
                  value={fields.alertFrequency}
                  values={['phase-change', 'daily', 'weekly']}
                  labels={{
                    daily: 'Daily digest',
                    'phase-change': 'Phase changes',
                    weekly: 'Weekly digest',
                  }}
                  onChange={(value) => updateField('alertFrequency', value as AlertFrequency)}
                />
                <AlertChannelChecks
                  channels={fields.alertChannels}
                  onChange={(channel, checked) =>
                    updateField('alertChannels', { ...fields.alertChannels, [channel]: checked })
                  }
                />
              </SectionCard>

              <Button type="submit" className="h-11 w-full gap-2" disabled={isLoading}>
                {isLoading ? 'Saving monitor...' : 'Start monitoring'}
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </section>

        <MonitorPreview fields={fields} selectedState={selectedState} />
      </div>
    </main>
  )
}

async function persistOnboarding(
  session: { id: string },
  fields: OnboardingFields,
): Promise<void> {
  const account = await updateKairosAccount(session.id, {
    alertChannels: buildAlertChannels(fields.alertChannels),
    alertFrequency: fields.alertFrequency,
  })

  setCachedAccount(account)
  const marketTarget = await createKairosMarketTarget(
    buildMarketTargetPayload(session, fields),
  )
  saveKairosMarketTargetSession(marketTarget)
}

function buildMarketTargetPayload(
  session: { id: string },
  fields: OnboardingFields,
): CreateMarketTargetPayload {
  const selectedState = findUsStateOption(fields.state)

  if (selectedState === null) {
    throw new Error(`Invalid state: received "${fields.state}"; expected supported US state`)
  }

  return {
    accountId: session.account.id,
    cityOrRegion: fields.cityOrRegion.trim() || undefined,
    country: 'US' as const,
    desiredCustomerType: fields.desiredCustomerType,
    industry: fields.industry,
    offeredService: fields.offeredService,
    state: selectedState.abbreviation,
  }
}

function validateOnboardingFields(fields: OnboardingFields): OnboardingErrors {
  return {
    ...(fields.state.trim() === '' ? { state: 'Select a state to monitor.' } : {}),
    ...(fields.industry.trim() === '' ? { industry: 'Select a target industry.' } : {}),
    ...(fields.desiredCustomerType.trim() === ''
      ? { desiredCustomerType: 'Select your desired customer type.' }
      : {}),
  }
}

function buildAlertChannels(channels: Record<AlertChannel, boolean>): readonly AlertChannel[] {
  return (Object.keys(channels) as AlertChannel[]).filter((channel) => channels[channel])
}

function formatOnboardingError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unable to save onboarding: received unknown error; expected Kairos API response.'
}

function KairosLogo() {
  return (
    <Link href="/" className="mb-8 flex w-fit items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
        <span className="text-lg font-bold text-primary-foreground">K</span>
      </div>
      <span className="text-xl font-semibold text-foreground">Kairos</span>
    </Link>
  )
}

function PageHeader() {
  return (
    <div className="mb-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
        Onboarding
      </p>
      <h1 className="mt-3 text-3xl font-bold text-foreground">Configure your first monitor</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Choose the market, customer profile, service, and alert cadence Kairos should use for
        outreach readiness.
      </p>
    </div>
  )
}

function SectionCard({
  children,
  icon: Icon,
  title,
}: {
  children: React.ReactNode
  icon: React.ComponentType<{ className?: string }>
  title: string
}) {
  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex h-11 items-center rounded-md border border-border bg-muted/40 px-3 text-sm">
        {value}
      </div>
    </div>
  )
}

function StateSelect({
  error,
  onChange,
  value,
}: {
  error?: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <SelectField
      id="state"
      label="State"
      error={error}
      placeholder="Select state"
      value={value}
      values={usStateOptions.map((state) => state.name)}
      labels={Object.fromEntries(
        usStateOptions.map((state) => [
          state.name,
          `${state.name} (${formatCoverageStatusLabel(state.coverageStatus)})`,
        ]),
      )}
      onChange={onChange}
    />
  )
}

function IndustrySelect({
  error,
  onChange,
  value,
}: {
  error?: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <SelectField
      id="industry"
      label="Target industry"
      error={error}
      placeholder="Select industry"
      value={value}
      values={['All industries', ...industries]}
      onChange={onChange}
    />
  )
}

function SelectField({
  error,
  id,
  label,
  labels = {},
  onChange,
  placeholder,
  value,
  values,
}: {
  error?: string
  id: string
  label: string
  labels?: Record<string, string>
  onChange: (value: string) => void
  placeholder?: string
  value: string
  values: readonly string[]
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="h-11 bg-white" aria-invalid={Boolean(error)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {values.map((item) => (
            <SelectItem key={item} value={item}>
              {labels[item] ?? item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <FieldError message={error} />}
    </div>
  )
}

function TextField({
  helper,
  id,
  label,
  onChange,
  placeholder,
  value,
}: {
  helper?: string
  id: string
  label: string
  onChange: (value: string) => void
  placeholder: string
  value: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        className="h-11 bg-white"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  )
}

function AlertChannelChecks({
  channels,
  onChange,
}: {
  channels: Record<AlertChannel, boolean>
  onChange: (channel: AlertChannel, checked: boolean) => void
}) {
  return (
    <div className="space-y-3">
      <Label>Alert channels</Label>
      {(['email', 'telegram'] as const).map((channel) => (
        <label key={channel} className="flex min-h-11 items-center gap-3 text-sm font-medium">
          <Checkbox
            checked={channels[channel]}
            onCheckedChange={(checked) => onChange(channel, Boolean(checked))}
          />
          {channel === 'email' ? 'Email' : 'Telegram'}
        </label>
      ))}
    </div>
  )
}

function MonitorPreview({
  fields,
  selectedState,
}: {
  fields: OnboardingFields
  selectedState: ReturnType<typeof findUsStateOption>
}) {
  return (
    <aside className="hidden items-center justify-center bg-muted/30 p-12 lg:flex">
      <div className="w-full max-w-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">Monitor preview</h2>
          <p className="text-sm text-muted-foreground">A concise view of what Kairos will track.</p>
        </div>

        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Target market</p>
              <p className="text-sm text-muted-foreground">United States</p>
            </div>
          </div>

          <div className="space-y-3">
            <PreviewRow label="State" value={fields.state || 'Not set'} />
            <PreviewRow label="Coverage" value={selectedState?.coverageStatus ?? 'Not set'} />
            <PreviewRow label="Region" value={fields.cityOrRegion || 'Full state'} />
            <PreviewRow label="Industry" value={fields.industry || 'Not set'} />
            <PreviewRow
              label="Service"
              value={offeredServiceLabels[fields.offeredService]}
            />
            <PreviewRow label="Alerts" value={formatAlertSummary(fields)} />
          </div>

          <div className="mt-5 border-t border-border pt-4 text-sm text-muted-foreground">
            Connecticut is the active MVP coverage state for reliable industry-aware scoring.
            Rhode Island is next; Florida, Seattle, Oregon, and Iowa remain experimental until
            source quality is validated.
          </div>
        </div>
      </div>
    </aside>
  )
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-2 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function formatAlertSummary(fields: OnboardingFields): string {
  const channels = buildAlertChannels(fields.alertChannels)
  const channelLabel = channels.length > 0 ? channels.join(', ') : 'No channels'
  return `${fields.alertFrequency}; ${channelLabel}`
}

function FieldError({ message }: { message: string }) {
  return <p className="text-sm text-destructive">{message}</p>
}

function FormError({ message }: { message: string }) {
  return (
    <div className="mb-6 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {message}
    </div>
  )
}
