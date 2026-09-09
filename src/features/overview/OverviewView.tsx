import { AccumulatedPanel } from '../dashboard/AccumulatedPanel'
import { PageHeader } from '../../components/PageHeader'

export function OverviewView({ accumulation }: { accumulation: number | null }) {
  return (
    <section className="grid gap-10 pb-12">
      <PageHeader
        eyebrow="overview"
        title="The full picture."
        description="A quiet read on the money that has moved through your account."
      />
      <div className="grid grid-cols-1 gap-4">
        <AccumulatedPanel accumulation={accumulation} />
      </div>
    </section>
  )
}
