'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Bell, Mail, Send, Webhook, Calendar, Check } from 'lucide-react'

export default function AlertsPage() {
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    emailAlerts: true,
    telegramAlerts: false,
    telegramChatId: '',
    weeklyDigest: true,
    digestDay: 'monday',
    triggers: {
      newBusinessDetected: true,
      warmingUp: false,
      bestWindow: true,
      coolingDown: true,
      savedCompanyChanged: true,
    },
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Alert Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure how and when you receive notifications about new businesses.
        </p>
      </div>

      {/* Alert Channels */}
      <div className="glass-card rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Alert Channels</h2>
            <p className="text-sm text-muted-foreground">Choose how you want to receive alerts</p>
          </div>
        </div>

        <div className="space-y-6 pt-4 border-t border-border">
          {/* Email */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Email Alerts</p>
                <p className="text-sm text-muted-foreground">Receive alerts to your email</p>
              </div>
            </div>
            <Switch
              checked={settings.emailAlerts}
              onCheckedChange={(checked) => setSettings({ ...settings, emailAlerts: checked })}
            />
          </div>

          {/* Telegram */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Send className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Telegram Alerts</p>
                  <p className="text-sm text-muted-foreground">Get instant notifications via Telegram</p>
                </div>
              </div>
              <Switch
                checked={settings.telegramAlerts}
                onCheckedChange={(checked) => setSettings({ ...settings, telegramAlerts: checked })}
              />
            </div>
            {settings.telegramAlerts && (
              <div className="ml-8 space-y-2">
                <Label htmlFor="telegram-chat-id">Telegram Chat ID</Label>
                <Input
                  id="telegram-chat-id"
                  placeholder="Enter your Telegram chat ID"
                  value={settings.telegramChatId}
                  onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
                />
              </div>
            )}
          </div>

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
            <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              Future
            </span>
          </div>
        </div>
      </div>

      {/* Weekly Digest */}
      <div className="glass-card rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Weekly Digest</h2>
            <p className="text-sm text-muted-foreground">Get a summary of the week</p>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Enable Weekly Digest</p>
              <p className="text-sm text-muted-foreground">Receive a weekly summary of new businesses and opportunities</p>
            </div>
            <Switch
              checked={settings.weeklyDigest}
              onCheckedChange={(checked) => setSettings({ ...settings, weeklyDigest: checked })}
            />
          </div>

          {settings.weeklyDigest && (
            <div className="space-y-2">
              <Label htmlFor="digest-day">Send digest on</Label>
              <Select
                value={settings.digestDay}
                onValueChange={(value) => setSettings({ ...settings, digestDay: value })}
              >
                <SelectTrigger id="digest-day" className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="tuesday">Tuesday</SelectItem>
                  <SelectItem value="wednesday">Wednesday</SelectItem>
                  <SelectItem value="thursday">Thursday</SelectItem>
                  <SelectItem value="friday">Friday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Alert Triggers */}
      <div className="glass-card rounded-xl p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Alert Triggers</h2>
          <p className="text-sm text-muted-foreground">Choose which events trigger alerts</p>
        </div>

        <div className="space-y-4 pt-4 border-t border-border">
          {[
            { key: 'newBusinessDetected', label: 'New business detected', description: 'When a new business matches your filters' },
            { key: 'warmingUp', label: 'Company enters Warming Up', description: 'When a company reaches 8+ days old' },
            { key: 'bestWindow', label: 'Company enters Best Outreach Window', description: 'When a company reaches the optimal timing' },
            { key: 'coolingDown', label: 'Company is Cooling Down', description: 'When a company is past prime window' },
            { key: 'savedCompanyChanged', label: 'Saved company changes stage', description: 'When a watchlist company changes timing stage' },
          ].map((trigger) => (
            <div key={trigger.key} className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-foreground">{trigger.label}</p>
                <p className="text-sm text-muted-foreground">{trigger.description}</p>
              </div>
              <Switch
                checked={settings.triggers[trigger.key as keyof typeof settings.triggers]}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    triggers: { ...settings.triggers, [trigger.key]: checked },
                  })
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          {saved ? <Check className="h-4 w-4" /> : null}
          {saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
