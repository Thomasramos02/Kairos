'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
import { Checkbox } from '@/components/ui/checkbox'
import { MapPin, Building2, Bell, ArrowRight, Target } from 'lucide-react'
import { states, industries } from '@/lib/sample-data'

export default function OnboardingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    country: 'United States',
    state: '',
    city: '',
    industry: '',
    alertFrequency: 'daily',
    alertChannels: {
      email: true,
      telegram: false,
      webhook: false,
    },
    webhookUrl: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate saving preferences
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">K</span>
            </div>
            <span className="text-xl font-semibold text-foreground">Kairos</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Configure your target market</h1>
            <p className="mt-2 text-muted-foreground">
              Set up your Kairos monitor in under 2 minutes. You can change these settings anytime.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Location Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                Target Location
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => setFormData({ ...formData, country: value })}
                  >
                    <SelectTrigger id="country" className="h-11">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="United States">United States</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => setFormData({ ...formData, state: value })}
                  >
                    <SelectTrigger id="state" className="h-11">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City / Region</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="e.g. Miami, Orlando, Tampa"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to monitor the entire state
                </p>
              </div>
            </div>

            {/* Industry Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Building2 className="h-4 w-4 text-primary" />
                Target Industry
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry / Segment</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => setFormData({ ...formData, industry: value })}
                >
                  <SelectTrigger id="industry" className="h-11">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Alerts Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Bell className="h-4 w-4 text-primary" />
                Alert Preferences
              </div>

              <div className="space-y-2">
                <Label htmlFor="alertFrequency">Alert Frequency</Label>
                <Select
                  value={formData.alertFrequency}
                  onValueChange={(value) => setFormData({ ...formData, alertFrequency: value })}
                >
                  <SelectTrigger id="alertFrequency" className="h-11">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="daily">Daily digest</SelectItem>
                    <SelectItem value="weekly">Weekly summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Alert Channels</Label>
                
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="email"
                    checked={formData.alertChannels.email}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        alertChannels: { ...formData.alertChannels, email: checked as boolean },
                      })
                    }
                  />
                  <label htmlFor="email" className="text-sm font-medium text-foreground cursor-pointer">
                    Email
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="telegram"
                    checked={formData.alertChannels.telegram}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        alertChannels: { ...formData.alertChannels, telegram: checked as boolean },
                      })
                    }
                  />
                  <label htmlFor="telegram" className="text-sm font-medium text-foreground cursor-pointer">
                    Telegram
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="webhook"
                    checked={formData.alertChannels.webhook}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        alertChannels: { ...formData.alertChannels, webhook: checked as boolean },
                      })
                    }
                  />
                  <label htmlFor="webhook" className="text-sm font-medium text-foreground cursor-pointer">
                    Webhook
                  </label>
                </div>

                {formData.alertChannels.webhook && (
                  <div className="ml-7 space-y-2">
                    <Input
                      type="url"
                      placeholder="https://your-webhook.com/endpoint"
                      value={formData.webhookUrl}
                      onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                      className="h-11"
                    />
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full h-11 gap-2" disabled={isLoading}>
              {isLoading ? 'Setting up...' : 'Start Monitoring'}
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            You can adjust your settings anytime from the Settings page.
          </p>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center bg-muted/30 p-12">
        <div className="max-w-sm w-full">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-semibold text-foreground mb-2">Your Kairos Monitor</h2>
            <p className="text-sm text-muted-foreground">Preview of your configured settings</p>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Target Market</p>
                <p className="text-sm text-muted-foreground">Monitoring configuration</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Country</span>
                <span className="text-sm font-medium text-foreground">
                  {formData.country || 'Not set'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">State</span>
                <span className="text-sm font-medium text-foreground">
                  {formData.state || 'Not set'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Region</span>
                <span className="text-sm font-medium text-foreground">
                  {formData.city || 'Entire state'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Industry</span>
                <span className="text-sm font-medium text-foreground">
                  {formData.industry || 'All industries'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Alert</span>
                <span className="text-sm font-medium text-foreground">
                  When companies enter Best Outreach Window
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                Ready to start monitoring
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
