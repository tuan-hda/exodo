'use client'

import { Check } from '@phosphor-icons/react'
import { PageHeader } from '@/components/PageHeader'
import { PageShell } from '@/components/PageShell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { BackgroundPreferenceState } from './use-background-preference'

export function CustomizationView({
  onBack,
  preference,
}: {
  onBack: () => void
  preference: BackgroundPreferenceState
}) {
  const { enabled, setEnabled } = preference

  return (
    <PageShell>
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
    </PageShell>
  )
}
