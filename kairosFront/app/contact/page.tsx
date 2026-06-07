'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Check } from 'lucide-react'

export default function ContactPage() {
  const [sent, setSent] = useState(false)

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center p-6">
      <div className="glass-card rounded-xl p-8">
        <h1 className="text-3xl font-bold text-foreground">Contact Kairos</h1>
        <p className="mt-2 text-muted-foreground">
          Send a message about data coverage, onboarding, or alert delivery.
        </p>

        {sent ? (
          <div className="mt-6 rounded-lg border border-[#A7F3D0] bg-[#D1FAE5]/60 p-4 text-sm text-[#065F46]">
            <Check className="mr-2 inline h-4 w-4" />
            Message captured for the Kairos team.
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              setSent(true)
            }}
            className="mt-6 space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Name</Label>
                <Input id="contact-name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input id="contact-email" type="email" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-message">Message</Label>
              <Textarea id="contact-message" rows={5} required />
            </div>
            <Button type="submit">Send message</Button>
          </form>
        )}

        <Button asChild variant="ghost" className="mt-4">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </main>
  )
}
