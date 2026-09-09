import { MetricCard } from '@/components/MetricCard'
import { AccumulatedPanel } from '@/features/dashboard/AccumulatedPanel'
import { PageHeader } from '@/components/PageHeader'
import { formatMoney } from '@/features/entries/entry-utils'
import type { Entry } from '@/features/entries/types'

export function OverviewView({
  accumulation,
  entries,
  isLoading = false,
}: {
  accumulation: number | null
  entries: Entry[]
  isLoading?: boolean
}) {
  const income = entries.filter((entry) => entry.type === 'income').reduce((sum, entry) => sum + entry.amount, 0)
  const expense = entries.filter((entry) => entry.type === 'expense').reduce((sum, entry) => sum + entry.amount, 0)

  return (
    <section className="grid gap-10 pb-12" aria-busy={isLoading}>
      <PageHeader
        eyebrow="overview"
        title="The full picture."
        description="A quiet read on the money that has moved through your account."
      />
      <div className="grid gap-4">
        <AccumulatedPanel accumulation={accumulation} isLoading={isLoading} />
        <div className="grid grid-cols-2 gap-3 max-xs:grid-cols-1">
          <MetricCard
            label="income"
            value={formatMoney(income)}
            detail="all time"
            valueClassName="text-success"
            isLoading={isLoading}
          />
          <MetricCard
            label="spent"
            value={formatMoney(expense)}
            detail="all time"
            valueClassName="text-danger"
            isLoading={isLoading}
          />
          <MetricCard
            label="records"
            value={entries.length.toLocaleString('en-US')}
            detail="all time"
            className="col-span-2 max-xs:col-span-1"
            isLoading={isLoading}
          />
        </div>
      </div>
    </section>
  )
}
