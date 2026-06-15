'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowRight, Check, Eye, EyeOff, MapPinned, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginKairosAccount, registerKairosAccount, setAccessToken } from '@/lib/account-api'
import { setCachedAccount } from '@/lib/account-session'

interface SignupFields {
  name: string
  email: string
  company: string
  password: string
}

type SignupErrors = Partial<Record<keyof SignupFields | 'form', string>>

function getPasswordChecks(password: string) {
  return [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains a letter', met: /[a-zA-Z]/.test(password) },
    { label: 'Contains a number', met: /\d/.test(password) },
  ]
}

function validateSignup(fields: SignupFields): SignupErrors {
  const errors: SignupErrors = {}
  const passwordReady = getPasswordChecks(fields.password).every((check) => check.met)

  if (!fields.name.trim()) errors.name = 'Enter your full name.'
  if (!fields.email.trim()) errors.email = 'Enter your work email.'
  if (!passwordReady) errors.password = 'Create a password that meets the requirements.'

  return errors
}

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<SignupErrors>({})
  const [fields, setFields] = useState<SignupFields>({
    name: '',
    email: '',
    company: '',
    password: '',
  })

  const passwordChecks = getPasswordChecks(fields.password)

  const updateField = (field: keyof SignupFields, value: string) => {
    setFields((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const nextErrors = validateSignup(fields)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsLoading(true)
    try {
      await registerKairosAccount({
        companyName: fields.company.trim() || undefined,
        email: fields.email,
        name: fields.name,
        password: fields.password,
      })

      const loginResponse = await loginKairosAccount(fields.email, fields.password)
      setCachedAccount(loginResponse.account)
      setAccessToken(loginResponse.accessToken)
      router.push('/onboarding')
    } catch (error) {
      setErrors({ form: formatSignupError(error) })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_84%_12%,rgba(6,182,212,0.14),transparent_30%),linear-gradient(180deg,#F7F9FC_0%,#EEF6FB_100%)]">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex items-center justify-center px-6 py-10 lg:px-12">
          <div className="w-full max-w-md">
            <AuthLogo />

            <div className="surface-card rounded-2xl p-6 sm:p-8">
              <div className="mb-7">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Create account
                </p>
                <h1 className="mt-3 text-3xl font-bold text-foreground">Start with the essentials</h1>
                <p className="mt-2 text-muted-foreground">
                  Create your account first. You will define your target market in onboarding next.
                </p>
              </div>

              {errors.form && <FormError message={errors.form} />}

              <form noValidate onSubmit={handleSubmit} className="space-y-5">
                <TextField
                  id="name"
                  label="Full name"
                  placeholder="John Smith"
                  value={fields.name}
                  error={errors.name}
                  autoComplete="name"
                  onChange={(value) => updateField('name', value)}
                />

                <TextField
                  id="email"
                  type="email"
                  label="Work email"
                  placeholder="you@company.com"
                  value={fields.email}
                  error={errors.email}
                  autoComplete="email"
                  onChange={(value) => updateField('email', value)}
                />

                <TextField
                  id="company"
                  label="Company name"
                  optional
                  placeholder="Acme Inc."
                  value={fields.company}
                  error={errors.company}
                  autoComplete="organization"
                  onChange={(value) => updateField('company', value)}
                />

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={fields.password}
                      onChange={(event) => updateField('password', event.target.value)}
                      autoComplete="new-password"
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={errors.password ? 'password-error' : 'password-help'}
                      className="h-11 bg-white pr-10"
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

                  {errors.password ? (
                    <FieldError id="password-error" message={errors.password} />
                  ) : (
                    <p id="password-help" className="text-sm text-muted-foreground">
                      Use a practical password for this Kairos account.
                    </p>
                  )}

                  <div className="grid gap-2 pt-1">
                    {passwordChecks.map((check) => (
                      <div key={check.label} className="flex items-center gap-2 text-sm">
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-full ${
                            check.met ? 'bg-[#10B981] text-white' : 'bg-muted text-transparent'
                          }`}
                        >
                          <Check className="h-3 w-3" />
                        </span>
                        <span className={check.met ? 'text-foreground' : 'text-muted-foreground'}>
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="h-11 w-full gap-2" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create account and set market'}
                  {!isLoading && <ArrowRight className="h-4 w-4" />}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                By signing up, you agree to our{' '}
                <Link href="/terms" className="underline hover:text-foreground">
                  Terms
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="underline hover:text-foreground">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        <AuthVisualPanel />
      </div>
    </main>
  )
}

function formatSignupError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unable to create account: received unknown error; expected Kairos API response'
}

function FormError({ message }: { message: string }) {
  return (
    <div className="mb-6 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

function AuthLogo() {
  return (
    <Link href="/" className="mb-8 flex w-fit items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
        <span className="text-lg font-bold text-primary-foreground">K</span>
      </div>
      <span className="text-xl font-semibold text-foreground">Kairos</span>
    </Link>
  )
}

function TextField({
  id,
  label,
  value,
  error,
  onChange,
  optional = false,
  type = 'text',
  placeholder,
  autoComplete,
}: {
  id: string
  label: string
  value: string
  error?: string
  onChange: (value: string) => void
  optional?: boolean
  type?: string
  placeholder: string
  autoComplete: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {optional && <span className="text-muted-foreground">(optional)</span>}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-11 bg-white"
      />
      {error && <FieldError id={`${id}-error`} message={error} />}
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
      <div className="relative w-full max-w-xl">
        <div className="absolute -inset-8 rounded-[2rem] bg-cyan-400/10 blur-3xl" />
        <div className="surface-card relative overflow-hidden rounded-[2rem] p-5">
          <div className="rounded-[1.5rem] bg-[#0F172A] p-6 text-white">
            <div className="mb-8 flex items-center justify-between">
              <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-100">
                Onboarding starts after account creation
              </span>
              <ShieldCheck className="h-5 w-5 text-cyan-200" />
            </div>

            <h2 className="text-3xl font-bold">Short signup. Clear market setup next.</h2>
            <p className="mt-3 text-slate-300">
              Account creation only collects the essentials. Country, state, city, industry,
              and alert preferences belong in onboarding.
            </p>

            <div className="mt-8 space-y-3">
              {[
                'Create account with name, email, password',
                'Add company name only if useful',
                'Configure target market in the next step',
                'Start from a focused dashboard',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <Check className="h-4 w-4 text-emerald-300" />
                  <span className="text-sm text-slate-100">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4">
              <div className="flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-cyan-100" />
                <p className="text-sm font-semibold text-cyan-50">Next: define your market</p>
              </div>
              <p className="mt-2 text-sm text-cyan-50/80">
                Country, state, city or region, target industry, alert channel, and alert frequency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
