export function TimingStagesSection() {
  const stages = [
    {
      name: 'Too Early',
      days: '0-7 days',
      description: 'Business is still in setup phase. Not yet ready for outreach.',
      color: 'bg-[#F1F5F9] border-[#E2E8F0]',
      textColor: 'text-[#64748B]',
      dotColor: 'bg-[#94A3B8]',
    },
    {
      name: 'Warming Up',
      days: '8-21 days',
      description: 'Business is stabilizing. Add to watchlist and monitor.',
      color: 'bg-[#FEF3C7] border-[#FDE68A]',
      textColor: 'text-[#92400E]',
      dotColor: 'bg-[#F59E0B]',
    },
    {
      name: 'Best Outreach Window',
      days: '22-45 days',
      description: 'Optimal time for outreach. Vendors may not be chosen yet.',
      color: 'bg-[#D1FAE5] border-[#A7F3D0]',
      textColor: 'text-[#065F46]',
      dotColor: 'bg-[#10B981]',
      highlight: true,
    },
    {
      name: 'Cooling Down',
      days: '46-90 days',
      description: 'Window closing. Reach out soon if interested.',
      color: 'bg-[#FFEDD5] border-[#FED7AA]',
      textColor: 'text-[#9A3412]',
      dotColor: 'bg-[#F97316]',
    },
    {
      name: 'Old Lead',
      days: '91+ days',
      description: 'No longer a new-business timing play. Use standard outreach.',
      color: 'bg-[#FEE2E2] border-[#FECACA]',
      textColor: 'text-[#991B1B]',
      dotColor: 'bg-[#EF4444]',
    },
  ]

  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
            Understanding timing stages
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Kairos does not treat every new company the same. The lifecycle stage explains
            whether to wait, watch, act, or deprioritize.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative max-w-5xl mx-auto">
          {/* Progress bar */}
          <div className="hidden md:block absolute top-8 left-0 right-0 h-1 bg-border rounded-full">
            <div className="absolute left-0 h-full w-[58%] bg-gradient-to-r from-[#94A3B8] via-[#F59E0B] to-[#10B981] rounded-full" />
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {stages.map((stage, index) => (
              <div key={stage.name} className="relative">
                {/* Dot on timeline */}
                <div className="hidden md:flex justify-center mb-6">
                  <div className={`h-4 w-4 rounded-full ${stage.dotColor} ring-4 ring-background`} />
                </div>

                <div 
                  className={`rounded-xl p-5 border ${stage.color} ${stage.highlight ? 'ring-2 ring-[#10B981] ring-offset-2' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`h-2 w-2 rounded-full ${stage.dotColor}`} />
                    <span className={`text-sm font-semibold ${stage.textColor}`}>{stage.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{stage.days}</p>
                  <p className="text-sm text-foreground">{stage.description}</p>
                  {stage.highlight && (
                    <div className="mt-3 pt-3 border-t border-[#A7F3D0]">
                      <p className="text-xs font-medium text-[#065F46]">Recommended: Reach out now</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
