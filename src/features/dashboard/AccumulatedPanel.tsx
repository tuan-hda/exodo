import { ArrowDown } from '@phosphor-icons/react'
import { CountUp } from '../../components/ui/count-up'
import { formatMoney } from '../entries/entry-utils'
import { DashboardPanel } from './DashboardPanel'

export function AccumulatedPanel({ accumulation }: { accumulation: number | null }) {
  return (
    <DashboardPanel
      className="!grid min-h-[180px] grid-cols-[1fr_auto] grid-rows-[auto_1fr] items-center justify-between rounded-[28px] border border-line bg-white px-[43px] py-[35px] text-ink transition-colors duration-300 max-[700px]:min-h-[190px] max-[700px]:p-[26px]"
      asideClassName="grid justify-items-end gap-3"
      label="accumulated"
      aside={<span>all time</span>}
      ariaLabel="All-time accumulation">
      <div className="col-start-1 row-start-2 accumulation-copy">
        <strong className="block text-[clamp(34px,4vw,54px)] font-semibold leading-[.95] tracking-[-.08em]">
          {accumulation === null ? '—' : <CountUp value={accumulation} formatValue={formatMoney} />}
        </strong>
        <span className="mt-5 block font-mono text-[11px]">all income minus all expenses</span>
      </div>
      <div className="col-start-2 row-start-2 self-center justify-self-end text-muted">
        <ArrowDown size={23} weight="bold" />
      </div>
    </DashboardPanel>
  )
}
