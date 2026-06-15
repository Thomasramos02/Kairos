'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowRight, Bell, Clock3, Eye, EyeOff, ShieldCheck, Target } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginKairosAccount } from '@/lib/account-api'
import { saveKairosAccountSession } from '@/lib/account-session'

interface LoginFields {
  email: string
  password: string
}

type LoginErrors = Partial<Record<keyof LoginFields | 'form', string>>

function validateLogin(fields: LoginFields): LoginErrors {
  const errors: LoginErrors = {}

  if (!fields.email.trim()) errors.email = 'Enter your work email.'
  if (!fields.password) errors.password = 'Enter your password.'

  return errors
}

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [fields, setFields] = useState<LoginFields>({ email: '', password: '' })

  const updateField = (field: keyof LoginFields, value: string) => {
    setFields((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const nextErrors = validateLogin(fields)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsLoading(true)
    try {
      const loginResponse = await loginKairosAccount(fields.email, fields.password)
      saveKairosAccountSession(loginResponse)
      router.push('/dashboard')
    } catch (error) {
      setErrors({ form: formatLoginError(error) })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F7F9FC]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_12%,rgba(37,99,235,0.15),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(6,182,212,0.16),transparent_30%),linear-gradient(135deg,#F7F9FC_0%,#EEF6FB_48%,#F8FAFC_100%)]" />
      <div className="absolute left-[-8rem] top-24 -z-10 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-[-10rem] right-[-6rem] -z-10 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl" />

      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[0.88fr_1.12fr]">
        <section className="flex items-center justify-center px-6 py-10 lg:px-12">
          <div className="w-full max-w-md">
            <AuthLogo />

            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:p-8">
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

              <div className="mb-7">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                  <Clock3 className="h-4 w-4" />
                  Return to your timing workspace
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Welcome back.
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Sign in to monitor saved companies, best-window alerts, and outreach-ready opportunities.
                </p>
              </div>

              {errors.form && <FormError message={errors.form} />}

              <form noValidate onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Work email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={fields.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className="h-12 rounded-xl bg-white"
                  />
                  {errors.email && <FieldError id="email-error" message={errors.email} />}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={fields.password}
                      onChange={(event) => updateField('password', event.target.value)}
                      autoComplete="current-password"
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={errors.password ? 'password-error' : undefined}
                      className="h-12 rounded-xl bg-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <FieldError id="password-error" message={errors.password} />}
                </div>

                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl gap-2 shadow-lg shadow-primary/20"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                  {!isLoading && <ArrowRight className="h-4 w-4" />}
                </Button>
              </form>

              <div className="mt-6 rounded-2xl border border-border bg-slate-50/80 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Prototype access</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Use the account credentials created in Kairos to access the dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                {"Don't have an account? "}
                <Link href="/signup" className="font-medium text-primary hover:underline">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </section>

        <AuthVisualPanel />
      </div>
    </main>
  )
}

function formatLoginError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unable to sign in: received unknown error; expected Kairos API response'
}

function AuthLogo() {
  return (
    <Link href="/" className="mb-8 flex w-fit items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
        <span className="text-lg font-bold text-primary-foreground">K</span>
      </div>
      <div>
        <span className="block text-xl font-semibold leading-none text-foreground">Kairos</span>
        <span className="text-xs text-muted-foreground">Commercial timing</span>
      </div>
    </Link>
  )
}

function FormError({ message }: { message: string }) {
  return (
    <div className="mb-6 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} className="text-sm text-destructive">
      {message}
    </p>
  )
}

function AuthVisualPanel() {
  return (
    <section className="hidden items-center justify-center p-12 lg:flex">
      <div className="relative w-full max-w-2xl">
        <div className="absolute -right-6 top-10 h-32 w-32 rounded-full bg-cyan-300/30 blur-3xl" />
        <div className="absolute -bottom-10 left-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative overflow-hidden rounded-[2.25rem] border border-white/50 bg-white/35 p-4 shadow-[0_30px_90px_rgba(15,23,42,0.16)] backdrop-blur-xl">
          <div className="rounded-[1.8rem] bg-[#0F172A] p-6 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <p className="text-sm font-semibold text-white">Today&apos;s Outreach Timing</p>
                <p className="mt-1 text-xs text-slate-400">Connecticut, United States</p>
              </div>
              <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
                12 ready now
              </span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <MetricCard label="New today" value="23" />
              <MetricCard label="Avg score" value="72" />
              <MetricCard label="Saved" value="47" />
            </div>

            <div className="mt-5 space-y-3">
              <OpportunityCard
                name="Bright Smile Dental LLC"
                meta="Hartford, CT - Healthcare"
                score="87"
                stage="Best Outreach Window"
                action="Reach out this week"
              />
              <OpportunityCard
                name="Peak Fitness Studio LLC"
                meta="New Haven, CT - Fitness"
                score="78"
                stage="Best Outreach Window"
                action="Send contextual intro"
              />
              <OpportunityCard
                name="Nova Clean Services LLC"
                meta="Stamford, CT - Cleaning"
                score="62"
                stage="Warming Up"
                action="Add to watchlist"
                muted
              />
            </div>

            <div className="mt-5 grid gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-300/15 text-cyan-100">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-cyan-50">Best-window alert</p>
                  <p className="mt-1 text-sm text-cyan-50/75">
                    Bright Smile moved into a stronger outreach window this morning.
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-white/10 px-3 py-2 text-right">
                <p className="text-xs text-cyan-50/70">Suggested</p>
                <p className="text-sm font-semibold text-cyan-50">Website + CRM setup</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -left-6 top-16 rounded-2xl border border-border bg-white/90 p-4 shadow-xl backdrop-blur">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Outreach readiness</p>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Sorted by timing score</p>
        </div>
      </div>
    </section>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  )
}

function OpportunityCard({
  name,
  meta,
  score,
  stage,
  action,
  muted = false,
}: {
  name: string
  meta: string
  score: string
  stage: string
  action: string
  muted?: boolean
}) {
  const scoreClass = muted ? 'text-amber-200' : 'text-emerald-200'
  const stageClass = muted
    ? 'border-amber-300/20 bg-amber-400/10 text-amber-100'
    : 'border-emerald-300/20 bg-emerald-400/10 text-emerald-100'

  return (
    <div className={`rounded-2xl border p-4 ${muted ? 'border-white/10 bg-white/[0.03]' : 'border-white/10 bg-white/7'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-white">{name}</p>
          <p className="mt-1 text-sm text-slate-400">{meta}</p>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${scoreClass}`}>{score}</p>
          <p className="text-xs text-slate-500">Score</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${stageClass}`}>
          {stage}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
          {action}
        </span>
      </div>
    </div>
  )
}
