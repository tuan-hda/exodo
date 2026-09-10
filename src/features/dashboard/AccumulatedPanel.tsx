import { ChartLineUp } from '@phosphor-icons/react'
import { CountUp } from '@/components/ui/count-up'
import { formatMoney } from '@/lib/money'
import { DashboardValuePanel } from './DashboardValuePanel'

export function AccumulatedPanel({
  accumulation,
  isLoading = false,
}: {
  accumulation: number | null
  isLoading?: boolean
}) {
  return (
    <DashboardValuePanel
      label="accumulated"
      aside={<span>all time</span>}
      ariaLabel="All-time accumulation"
      value={accumulation === null ? '—' : <CountUp value={accumulation} formatValue={formatMoney} />}
      description="all income minus all expenses"
      descriptionSkeletonClassName="w-48"
      icon={<ChartLineUp size={23} weight="bold" />}
      ariaBusy={isLoading}
    />
  )
}
