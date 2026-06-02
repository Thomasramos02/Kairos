import { CompanyList } from '@/components/dashboard/company-list'

export default function BusinessesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">New Businesses</h1>
        <p className="text-muted-foreground mt-1">
          Browse newly registered businesses with timing stage, score, source, and outreach actions.
        </p>
      </div>

      <CompanyList groupByStage={false} />
    </div>
  )
}
