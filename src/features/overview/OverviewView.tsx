import { AccumulatedPanel } from '../dashboard/AccumulatedPanel'

export function OverviewView({ accumulation }: { accumulation: number | null }) {
  return (
    <section className="pt-6">
      <div className="grid grid-cols-1 gap-3.5">
        <AccumulatedPanel accumulation={accumulation} />
      </div>
    </section>
  )
}
