import { Globe2, MapPinned, Palette, PenTool } from 'lucide-react'

const useCases = [
  {
    icon: Globe2,
    title: 'Web designers',
    description: 'Find local businesses with no detected website or incomplete web presence.',
    example: 'Offer a starter site when the business is still setting up its first customer touchpoints.',
  },
  {
    icon: PenTool,
    title: 'Landing page builders',
    description: 'Spot new entities that need a focused page before running ads or sending traffic.',
    example: 'Pitch a simple lead capture page to service businesses under 30 days old.',
  },
  {
    icon: Palette,
    title: 'Logo and branding freelancers',
    description: 'Find businesses still forming how they look, sound, and appear online.',
    example: 'Use weak digital presence as context for a practical identity cleanup offer.',
  },
  {
    icon: MapPinned,
    title: 'Local SEO freelancers',
    description: 'Prioritize businesses with local presence gaps and public contact signals.',
    example: 'Lead with Google Business Profile cleanup for a newly opened clinic, studio, or service company.',
  },
]

export function UseCasesSection() {
  return (
    <section id="use-cases" className="bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
            Built for freelancers selling digital presence
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Kairos is useful when your best customers are newly opened local businesses
            still deciding how they will be found, trusted, and contacted online.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {useCases.map((useCase) => (
            <div key={useCase.title} className="rounded-lg border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
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
