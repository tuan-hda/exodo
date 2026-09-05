'use client'

import { ArrowLeft, Check } from '@phosphor-icons/react'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { useBackgroundPreference } from './use-background-preference'

export function CustomizationView({ onBack }: { onBack: () => void }) {
  const { enabled, setEnabled } = useBackgroundPreference()

  return (
    <section className="mx-auto max-w-[620px] pb-8">
      <Button
        variant="outline"
        size="sm"
        className="mt-8 text-xs font-semibold text-muted"
        type="button"
        onClick={onBack}>
        <ArrowLeft size={17} /> Settings
      </Button>
      <div className="mt-8">
        <p className="mb-[15px] font-mono text-[11px] uppercase tracking-[.12em] text-muted">appearance</p>
        <h1 className="text-[clamp(42px,7vw,68px)]">Customization</h1>
      </div>
      <Card className="mt-8 flex items-center justify-between gap-4 rounded-[20px] border-line bg-white p-5">
        <div>
          <strong className="block text-sm font-semibold">Gradient background</strong>
          <p className="mt-1 text-xs text-muted">Show the soft color wash behind the dashboard</p>
        </div>
        <Button
          variant={enabled ? 'default' : 'outline'}
          size="sm"
          type="button"
          aria-pressed={enabled}
          onClick={() => setEnabled(!enabled)}>
          {enabled && <Check size={15} />}
          {enabled ? 'Enabled' : 'Disabled'}
        </Button>
      </Card>
    </section>
  )
}
