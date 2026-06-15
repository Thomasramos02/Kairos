export function TimingStagesSection() {
  const stages = [
    {
      name: 'Too Early',
      days: '0-7 days',
      description: 'Business is still in setup phase. Not yet ready for outreach.',
      color: 'bg-slate-50 border-slate-200',
      textColor: 'text-slate-500',
      dotColor: 'bg-slate-400',
    },
    {
      name: 'Warming Up',
      days: '8-21 days',
      description: 'Business is stabilizing. Add to watchlist and monitor.',
      color: 'bg-amber-50 border-amber-200',
      textColor: 'text-amber-700',
      dotColor: 'bg-amber-500',
    },
    {
      name: 'Best Outreach Window',
      days: '22-45 days',
      description: 'Optimal time for outreach. Vendors may not be chosen yet.',
      color: 'bg-emerald-50 border-emerald-200',
      textColor: 'text-emerald-700',
      dotColor: 'bg-emerald-500',
      highlight: true,
    },
    {
      name: 'Cooling Down',
      days: '46-90 days',
      description: 'Window closing. Reach out soon if interested.',
      color: 'bg-orange-50 border-orange-200',
      textColor: 'text-orange-700',
      dotColor: 'bg-orange-500',
    },
    {
      name: 'Old Lead',
      days: '91+ days',
      description: 'No longer a new-business timing play. Use standard outreach.',
      color: 'bg-red-50 border-red-200',
      textColor: 'text-red-700',
      dotColor: 'bg-red-500',
    },
  ]

  return (
<<<<<<< HEAD
    <section className="bg-muted/30 py-20 lg:py-28">
=======
    <section id="timing-stages" className="py-20 lg:py-28 bg-muted/30">
>>>>>>> 0cc7802447f0cee6ce7d46558eb5bd52beafc943
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

        <div className="relative max-w-5xl mx-auto">
          <div className="hidden md:block absolute top-8 left-0 right-0 h-1 bg-border rounded-full">
<<<<<<< HEAD
            <div className="absolute left-0 h-full w-[58%] rounded-full bg-primary" />
=======
            <div className="absolute left-0 h-full w-[58%] bg-gradient-to-r from-slate-400 via-amber-500 to-emerald-500 rounded-full" />
>>>>>>> 0cc7802447f0cee6ce7d46558eb5bd52beafc943
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {stages.map((stage) => (
              <div key={stage.name} className="relative">
                <div className="hidden md:flex justify-center mb-6">
                  <div className={`h-4 w-4 rounded-full ${stage.dotColor} ring-4 ring-background`} />
                </div>

                <div 
<<<<<<< HEAD
                  className={`rounded-lg p-5 border shadow-sm ${stage.color} ${stage.highlight ? 'ring-2 ring-[#10B981] ring-offset-2' : ''}`}
=======
                  className={`rounded-xl p-5 border ${stage.color} ${stage.highlight ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
>>>>>>> 0cc7802447f0cee6ce7d46558eb5bd52beafc943
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`h-2 w-2 rounded-full ${stage.dotColor}`} />
                    <span className={`text-sm font-semibold ${stage.textColor}`}>{stage.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{stage.days}</p>
                  <p className="text-sm text-foreground">{stage.description}</p>
                  {stage.highlight && (
                    <div className="mt-3 pt-3 border-t border-emerald-200">
                      <p className="text-xs font-medium text-emerald-800">Recommended: Reach out now</p>
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
