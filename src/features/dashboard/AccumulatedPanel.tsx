import { ChartLineUp } from '@phosphor-icons/react'
import { CountUp } from '../../components/ui/count-up'
import { formatMoney } from '../entries/entry-utils'
import { DashboardPanel } from './DashboardPanel'

export function AccumulatedPanel({ accumulation }: { accumulation: number | null }) {
  return (
    <DashboardPanel
      className="grid min-h-[210px] grid-cols-[1fr_auto] grid-rows-[auto_1fr] items-center justify-between p-7 text-ink md:p-9"
      asideClassName="grid justify-items-end gap-3"
      label="accumulated"
      aside={<span>all time</span>}
      ariaLabel="All-time accumulation">
      <div className="col-start-1 row-start-2 accumulation-copy">
        <strong className="ui-number block text-[clamp(38px,5vw,62px)] font-sans font-semibold leading-[.9] tracking-[-.09em]">
          {accumulation === null ? '—' : <CountUp value={accumulation} formatValue={formatMoney} />}
        </strong>
        <span className="mt-5 block font-mono text-[11px] leading-[1.5] text-muted">all income minus all expenses</span>
      </div>
      <div className="col-start-2 row-start-2 self-center justify-self-end text-muted">
        <div className="ui-icon-tile size-14 rounded-full bg-surface">
          <ChartLineUp size={23} weight="bold" />
        </div>
      </div>
    </DashboardPanel>
  )
}
