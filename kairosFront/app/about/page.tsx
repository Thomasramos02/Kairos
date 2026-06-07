import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center p-6">
      <div className="glass-card rounded-xl p-8">
        <h1 className="text-3xl font-bold text-foreground">About Kairos</h1>
        <p className="mt-4 text-muted-foreground">
          Kairos is timing intelligence for B2B prospecting. It tracks newly
          registered businesses and helps teams decide when outreach is more likely to be relevant.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </main>
  )
}
