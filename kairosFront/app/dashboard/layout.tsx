import { DashboardSidebar } from '@/components/dashboard/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <main className="lg:pl-64">
        <div className="p-6 lg:p-8 pt-20 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  )
}
