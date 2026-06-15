import { AlertCircle, Users, Clock } from 'lucide-react'

export function ProblemSection() {
  return (
<<<<<<< HEAD
    <section id="features" className="bg-white py-20 lg:py-24">
=======
    <section id="why-timing" className="py-20 lg:py-28 bg-muted/30">
>>>>>>> 0cc7802447f0cee6ce7d46558eb5bd52beafc943
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
            Why timing matters
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Newly opened local businesses do not fix their website, branding,
            and local presence on the same day they register.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10 mb-4">
              <Users className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Generic lead lists</h3>
            <p className="text-muted-foreground">
              Most databases do not tell you whether the business has a website,
              a local profile, or a practical reason to hear from you.
            </p>
          </div>

<<<<<<< HEAD
          <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F59E0B]/10 mb-4">
              <Clock className="h-6 w-6 text-[#F59E0B]" />
=======
          <div className="glass-card rounded-xl p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10 mb-4">
              <Clock className="h-6 w-6 text-amber-500" />
>>>>>>> 0cc7802447f0cee6ce7d46558eb5bd52beafc943
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Unclear timing</h3>
            <p className="text-muted-foreground">
              Contact too early and setup is chaotic. Contact too late and the
              first website, logo, or local SEO decision may already be done.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted mb-4">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No context</h3>
            <p className="text-muted-foreground">
              A raw registration does not explain why to approach now.
              Kairos shows the digital gap, confidence, contactability, and timing.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-6 py-4">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <p className="text-lg font-medium text-foreground">
              Not just a new company.{' '}
              <span className="text-primary">A visible digital opportunity.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
