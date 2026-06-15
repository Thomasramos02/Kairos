'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check, CreditCard, MapPin, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  AlertChannel,
  AlertFrequency,
  createKairosMarketTarget,
  CreateMarketTargetPayload,
  OfferedService,
  updateKairosAccount,
} from '@/lib/account-api'
import {
  KairosAccountSession,
  readKairosAccountSession,
  updateKairosAccountSession,
} from '@/lib/account-session'
import {
  readKairosMarketTargetSession,
  saveKairosMarketTargetSession,
} from '@/lib/market-target-session'
import { industries } from '@/lib/sample-data'
import {
  findUsStateOption,
  formatCoverageStatusLabel,
  usStateOptions,
} from '@/lib/us-state-options'

type SettingsTab = 'account' | 'market' | 'alerts' | 'billing'

const tabs = [
  { id: 'account' as const, label: 'Account', icon: User },
  { id: 'market' as const, label: 'Target Market', icon: MapPin },
  { id: 'alerts' as const, label: 'Alert Preferences', icon: Bell },
  { id: 'billing' as const, label: 'Billing', icon: CreditCard },
]

const customerTypes = [
  'Web designers',
  'Landing page builders',
  'Logo and branding freelancers',
  'Local SEO freelancers',
]

const offeredServiceLabels: Record<OfferedService, string> = {
  'website-design-development': 'Website design & development',
  'landing-page-creation': 'Landing page creation',
  branding: 'Branding',
  'logo-design': 'Logo design',
  'seo-local-seo': 'SEO / local SEO',
  'google-business-profile-local-presence': 'Google Business Profile / local presence',
}

export default function SettingsPage() {
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [accountSession, setAccountSession] = useState<KairosAccountSession | null>(null)
  const [activeTab, setActiveTab] = useState<SettingsTab>('account')
  const [accountData, setAccountData] = useState({
    name: '',
    email: '',
    companyName: '',
  })
  const [marketData, setMarketData] = useState({
    country: 'United States',
    state: 'Connecticut',
    city: '',
    industry: 'Healthcare - Dental',
    customerType: 'Web designers',
    offeredService: 'website-design-development' as OfferedService,
  })
  const [alertData, setAlertData] = useState({
    email: true,
    telegram: false,
    frequency: 'phase-change' as AlertFrequency,
    newBusinessDetected: true,
    bestWindow: true,
    savedCompanyChanged: true,
  })

  useEffect(() => {
    const session = readKairosAccountSession()

    if (session === null) {
      router.push('/login')
      return
    }

    setAccountSession(session)
    setAccountData({
      companyName: session.account.companyName ?? '',
      email: session.account.email,
      name: session.account.name,
    })
    setAlertData((current) => ({
      ...current,
      email: session.account.alertPreference.channels.includes('email'),
      frequency: session.account.alertPreference.frequency,
      telegram: session.account.alertPreference.channels.includes('telegram'),
    }))
    hydrateMarketTargetData()
  }, [router])

  const handleSave = async () => {
    setSaveError(null)

    if (activeTab === 'billing') {
      showSavedState()
      return
    }

    if (accountSession === null) {
      setSaveError('Unable to save settings: received empty session; expected authenticated account')
      return
    }

    setIsSaving(true)

    try {
      await saveActiveSettings(accountSession)
      showSavedState()
    } catch (error) {
      setSaveError(formatSettingsError(error))
    } finally {
      setIsSaving(false)
    }
  }

  const hydrateMarketTargetData = () => {
    const marketTarget = readKairosMarketTargetSession()

    if (marketTarget === null) {
      return
    }

    setMarketData({
      city: marketTarget.cityOrRegion ?? '',
      country: 'United States',
      customerType: marketTarget.desiredCustomerType,
      industry: marketTarget.industry,
      offeredService: marketTarget.offeredService,
      state: resolveStateName(marketTarget.state),
    })
  }

  const saveActiveSettings = async (session: KairosAccountSession) => {
    if (activeTab === 'market') {
      await saveMarketSettings(session, marketData)
      return
    }

    await saveAccountSettings(session)
  }

  const saveAccountSettings = async (session: KairosAccountSession) => {
    const account = await updateKairosAccount(
      session.account.id,
      session.accessToken,
      {
        alertChannels: buildAlertChannels(alertData),
        alertFrequency: alertData.frequency,
        companyName: accountData.companyName.trim() || null,
        name: accountData.name,
      },
    )

    setAccountSession(updateKairosAccountSession(account))
    setAccountData({
      companyName: account.companyName ?? '',
      email: account.email,
      name: account.name,
    })
  }

  const showSavedState = () => {
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage account data, target market, and alert preferences.
        </p>
        {saveError && (
          <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {saveError}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="lg:w-60 flex-shrink-0">
          <nav className="glass-card rounded-xl p-2 space-y-1" aria-label="Settings sections">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 max-w-3xl">
          {activeTab === 'account' && (
            <SettingsCard
              title="Account Information"
              description="Update the basic account fields required by the MVP."
              onSave={handleSave}
              isSaving={isSaving}
              saved={saved}
            >
              <TextField
                id="name"
                label="Full name"
                value={accountData.name}
                onChange={(value) => setAccountData({ ...accountData, name: value })}
              />
              <TextField
                id="email"
                label="Email address"
                type="email"
                value={accountData.email}
                onChange={(value) => setAccountData({ ...accountData, email: value })}
                helper="Email changes are not enabled in the MVP account API."
              />
              <TextField
                id="company"
                label="Company name"
                helper="Optional, but useful for account context."
                value={accountData.companyName}
                onChange={(value) => setAccountData({ ...accountData, companyName: value })}
              />
            </SettingsCard>
          )}

          {activeTab === 'market' && (
            <SettingsCard
              title="Target Market"
              description="Define the first market Kairos should monitor."
              onSave={handleSave}
              isSaving={isSaving}
              saved={saved}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  id="country"
                  label="Country"
                  value={marketData.country}
                  values={['United States']}
                  onChange={(value) => setMarketData({ ...marketData, country: value })}
                />
                <SelectField
                  id="state"
                  label="State"
                  value={marketData.state}
                  values={usStateOptions.map((state) => state.name)}
                  labels={buildStateLabels()}
                  onChange={(value) => setMarketData({ ...marketData, state: value })}
                />
              </div>
              <TextField
                id="city"
                label="City or region"
                helper="Leave blank to monitor the full state."
                value={marketData.city}
                onChange={(value) => setMarketData({ ...marketData, city: value })}
              />
              <SelectField
                id="industry"
                label="Target industry"
                value={marketData.industry}
                values={['all', ...industries]}
                labels={{ all: 'All Industries' }}
                onChange={(value) => setMarketData({ ...marketData, industry: value })}
              />
              <SelectField
                id="customer-type"
                label="Desired customer type"
                value={marketData.customerType}
                values={customerTypes}
                helper="Keeps recommendations aligned with your outbound motion."
                onChange={(value) => setMarketData({ ...marketData, customerType: value })}
              />
              <SelectField
                id="offered-service"
                label="Service you sell"
                value={marketData.offeredService}
                values={Object.keys(offeredServiceLabels)}
                labels={offeredServiceLabels}
                helper="Kairos uses this to score timing and write contextual outreach."
                onChange={(value) =>
                  setMarketData({ ...marketData, offeredService: value as OfferedService })
                }
              />
            </SettingsCard>
          )}

          {activeTab === 'alerts' && (
            <SettingsCard
              title="Alert Preferences"
              description="Configure the MVP alert channels and events."
              onSave={handleSave}
              isSaving={isSaving}
              saved={saved}
            >
              <SwitchRow
                label="Email alerts"
                description="Receive alerts for new matches and timing changes."
                checked={alertData.email}
                onCheckedChange={(checked) => setAlertData({ ...alertData, email: checked })}
              />
              <SwitchRow
                label="Telegram alerts"
                description="Use Telegram for faster notifications."
                checked={alertData.telegram}
                onCheckedChange={(checked) => setAlertData({ ...alertData, telegram: checked })}
              />
              <SelectField
                id="alert-frequency"
                label="Alert frequency"
                value={alertData.frequency}
                values={['phase-change', 'daily', 'weekly']}
                labels={{ 'phase-change': 'Phase changes', daily: 'Daily digest', weekly: 'Weekly digest' }}
                onChange={(value) => setAlertData({ ...alertData, frequency: value as AlertFrequency })}
              />
              <div className="space-y-4 border-t border-border pt-4">
                <SwitchRow
                  label="New businesses appear in my market"
                  checked={alertData.newBusinessDetected}
                  onCheckedChange={(checked) => setAlertData({ ...alertData, newBusinessDetected: checked })}
                />
                <SwitchRow
                  label="Saved company enters Best Outreach Window"
                  checked={alertData.bestWindow}
                  onCheckedChange={(checked) => setAlertData({ ...alertData, bestWindow: checked })}
                />
                <SwitchRow
                  label="Saved company changes timing stage"
                  checked={alertData.savedCompanyChanged}
                  onCheckedChange={(checked) => setAlertData({ ...alertData, savedCompanyChanged: checked })}
                />
              </div>
            </SettingsCard>
          )}

          {activeTab === 'billing' && (
            <StaticCard title="Billing" description="Manage subscription state for the beta.">
              <div className="rounded-lg border border-primary/20 bg-primary/10 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">Beta Access</p>
                    <p className="text-sm text-muted-foreground">Free access during beta.</p>
                  </div>
                  <span className="rounded-full bg-[#D1FAE5] px-3 py-1 text-sm font-medium text-[#065F46]">
                    Active
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Billing features are intentionally light in the MVP. Starter pricing is expected after launch.
              </p>
            </StaticCard>
          )}
        </div>
      </div>
    </div>
  )
}

function SettingsCard({
  title,
  description,
  children,
  onSave,
  isSaving,
  saved,
}: {
  title: string
  description: string
  children: React.ReactNode
  onSave: () => void
  isSaving: boolean
  saved: boolean
}) {
  return (
    <div className="glass-card rounded-xl p-6 space-y-6">
      <SectionHeader title={title} description={description} />
      <div className="space-y-4 border-t border-border pt-4">{children}</div>
      <div className="flex justify-end border-t border-border pt-4">
        <Button onClick={onSave} className="gap-2" disabled={isSaving}>
          {saved ? <Check className="h-4 w-4" /> : null}
          {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}

async function saveMarketSettings(
  session: KairosAccountSession,
  marketData: {
    readonly city: string
    readonly customerType: string
    readonly industry: string
    readonly offeredService: OfferedService
    readonly state: string
  },
): Promise<void> {
  const marketTarget = await createKairosMarketTarget(
    session.accessToken,
    buildMarketTargetPayload(session, marketData),
  )
  saveKairosMarketTargetSession(marketTarget)
}

function buildMarketTargetPayload(
  session: KairosAccountSession,
  marketData: {
    readonly city: string
    readonly customerType: string
    readonly industry: string
    readonly offeredService: OfferedService
    readonly state: string
  },
): CreateMarketTargetPayload {
  const selectedState = findUsStateOption(marketData.state)

  if (selectedState === null) {
    throw new Error(`Invalid state: received "${marketData.state}"; expected supported US state`)
  }

  return {
    accountId: session.account.id,
    cityOrRegion: marketData.city.trim() || undefined,
    country: 'US',
    desiredCustomerType: marketData.customerType,
    industry: marketData.industry,
    offeredService: marketData.offeredService,
    state: selectedState.abbreviation,
  }
}

function resolveStateName(state: string): string {
  const stateOption = usStateOptions.find((option) => option.abbreviation === state)
  return stateOption?.name ?? state
}

function buildStateLabels(): Record<string, string> {
  return Object.fromEntries(
    usStateOptions.map((state) => [
      state.name,
      state.name,
    ]),
  )
}

function buildAlertChannels(alertData: {
  readonly email: boolean
  readonly telegram: boolean
}): readonly AlertChannel[] {
  const channels: AlertChannel[] = []

  if (alertData.email) {
    channels.push('email')
  }

  if (alertData.telegram) {
    channels.push('telegram')
  }

  return channels
}

function formatSettingsError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unable to save settings: received unknown error; expected Kairos API response'
}

function StaticCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="glass-card rounded-xl p-6 space-y-6">
      <SectionHeader title={title} description={description} />
      <div className="space-y-4 border-t border-border pt-4">{children}</div>
    </div>
  )
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function TextField({
  id,
  label,
  value,
  onChange,
  helper,
  type = 'text',
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  helper?: string
  type?: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  )
}

function SelectField({
  id,
  label,
  value,
  values,
  labels = {},
  helper,
  onChange,
}: {
  id: string
  label: string
  value: string
  values: string[]
  labels?: Record<string, string>
  helper?: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {values.map((item) => (
            <SelectItem key={item} value={item}>
              {labels[item] ?? item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  )
}

function SwitchRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
