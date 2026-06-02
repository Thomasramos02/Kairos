import { Bell, Eye, MousePointer2, Search } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Discover',
    description: 'Track newly registered companies in your target market from public registry signals.',
  },
  {
    number: '02',
    icon: Eye,
    title: 'Score',
    description: 'See each company by timing stage, age, market, source, and outreach readiness score.',
  },
  {
    number: '03',
    icon: Bell,
    title: 'Monitor',
    description: 'Save companies to a watchlist and follow them as they move toward a stronger outreach window.',
  },
  {
    number: '04',
    icon: MousePointer2,
    title: 'Act',
    description: 'Use recommended actions and contextual approach suggestions to move faster without sending generic outreach.',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
            How Kairos works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            A simple three-step process to discover and engage new businesses when timing looks more favorable.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 lg:gap-10">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-px bg-border" />
              )}
              
              <div className="relative flex flex-col items-center text-center">
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl glass-card">
                    <step.icon className="h-10 w-10 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {step.number}
                  </span>
                </div>
                
                <h3 className="mt-6 text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="mt-3 text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
