import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center p-6">
      <div className="glass-card rounded-xl p-8">
        <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p className="mt-4 text-muted-foreground">
          This MVP uses mock data only. A production version should document account data,
          alert preferences, public registry sources, retention, exports, and user deletion controls.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </main>
  )
}
