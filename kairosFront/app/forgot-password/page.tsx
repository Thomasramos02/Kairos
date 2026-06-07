'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Check } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setSent(true)
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="glass-card w-full max-w-md rounded-xl p-6">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/login">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>
        </Button>

        <h1 className="text-2xl font-bold text-foreground">Reset your password</h1>
        <p className="mt-2 text-muted-foreground">
          Enter your work email to request password recovery for your Kairos account.
        </p>

        {sent ? (
          <div className="mt-6 rounded-lg border border-[#A7F3D0] bg-[#D1FAE5]/60 p-4 text-sm text-[#065F46]">
            <Check className="mr-2 inline h-4 w-4" />
            Reset link sent to {email}.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Work email</Label>
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Send reset link
            </Button>
          </form>
        )}
      </div>
    </main>
  )
}
