import { Briefcase, Code, PenTool, UserRoundCheck, Users } from 'lucide-react'

const useCases = [
  {
    icon: Briefcase,
    title: 'Agencies',
    description: 'Find newly opened businesses that may need websites, ads, CRM setup, local SEO, or operations help.',
    example: 'Reach out to new roofing companies before they choose their first marketing supplier.',
  },
  {
    icon: Users,
    title: 'SDRs',
    description: 'Prioritize fresh accounts by timing score instead of calling every new company the same way.',
    example: 'Focus your day on companies entering Best Outreach Window and monitor those still warming up.',
  },
  {
    icon: PenTool,
    title: 'Freelancers',
    description: 'Spot businesses while they are still choosing vendors and offer focused setup help.',
    example: 'Pitch launch websites, Google Business setup, or basic automation during the first month.',
  },
  {
    icon: UserRoundCheck,
    title: 'Consultants',
    description: 'Monitor companies that are likely to need supplier decisions, tooling, and process design.',
    example: 'Start with a practical operations audit instead of a generic introduction.',
  },
  {
    icon: Code,
    title: 'SaaS teams',
    description: 'Find companies before their first software stack becomes fixed.',
    example: 'Introduce scheduling, CRM, POS, or service software while operations are still being formed.',
  },
]

export function UseCasesSection() {
  return (
    <section id="use-cases" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
            Built for outbound teams that need better timing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Kairos is useful when your best customers are businesses that are still choosing
            suppliers, tools, and operating partners.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase) => (
            <div key={useCase.title} className="glass-card rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                <useCase.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{useCase.title}</h3>
              <p className="text-muted-foreground mb-4">{useCase.description}</p>
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Example:</span> {useCase.example}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
