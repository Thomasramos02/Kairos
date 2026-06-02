import { AlertCircle, Users, Clock } from 'lucide-react'

export function ProblemSection() {
  return (
    <section id="features" className="py-20 lg:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
            Why timing matters
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            New businesses are not equally ready every day. Too early gets ignored.
            Too late means competitors may already be in the account.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-card rounded-xl p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10 mb-4">
              <Users className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Late discovery</h3>
            <p className="text-muted-foreground">
              Most lead databases show companies when the opportunity is already obvious.
              By then, your outreach competes with everyone else.
            </p>
          </div>

          <div className="glass-card rounded-xl p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F59E0B]/10 mb-4">
              <Clock className="h-6 w-6 text-[#F59E0B]" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Poor timing</h3>
            <p className="text-muted-foreground">
              Contact too early and the business may still be setting up basics.
              Contact too late and supplier choices may already be made.
            </p>
          </div>

          <div className="glass-card rounded-xl p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted mb-4">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No context</h3>
            <p className="text-muted-foreground">
              A raw list does not explain whether now is a good moment.
              Kairos turns company age and stage into a clear next action.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-xl glass-card">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <p className="text-lg font-medium text-foreground">
              Not just a new company.{' '}
              <span className="text-primary">A company entering the right outreach window.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
