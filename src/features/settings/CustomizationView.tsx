'use client'

import { Check } from '@phosphor-icons/react'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { PageHeader } from '../../components/PageHeader'
import { useBackgroundPreference } from './use-background-preference'

export function CustomizationView({ onBack }: { onBack: () => void }) {
  const { enabled, setEnabled } = useBackgroundPreference()

  return (
    <section className="mx-auto grid max-w-[620px] gap-8 pb-8 animate-[page-rise_.55s_cubic-bezier(.16,1,.3,1)_both]">
      <PageHeader
        eyebrow="appearance"
        title="Customization"
        description="Keep the dashboard calm and focused on the money that matters today."
        backLabel="Settings"
        onBack={onBack}
      />
      <Card tone="soft" className="flex items-center justify-between gap-4 p-5">
        <div>
          <strong className="block text-sm font-semibold">Gradient background</strong>
          <p className="mt-1 text-xs leading-[1.5] text-muted">Show the soft color wash behind the dashboard.</p>
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
