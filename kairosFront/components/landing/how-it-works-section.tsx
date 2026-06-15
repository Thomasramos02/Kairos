import { Bell, Eye, MousePointer2, Search } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Discover',
    description: 'Track newly registered local businesses in your target market from public registry signals.',
  },
  {
    number: '02',
    icon: Eye,
    title: 'Evaluate',
    description: 'See website status, local presence, contactability, confidence, and timing in one card.',
  },
  {
    number: '03',
    icon: Bell,
    title: 'Filter',
    description: 'Focus on No website detected, New entity under 30 days, Local business, and Contact detected.',
  },
  {
    number: '04',
    icon: MousePointer2,
    title: 'Act',
    description: 'Copy a contextual approach for a website, landing page, branding, or local SEO offer.',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-y border-border bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
            How Kairos works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            A focused workflow for finding new local businesses with visible digital presence gaps.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 lg:gap-10">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-11 left-1/2 w-full h-px bg-border" />
              )}

              <div className="relative flex flex-col items-center text-center">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-border bg-white shadow-sm">
                    <step.icon className="h-9 w-9 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm">
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
