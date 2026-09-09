import type { ReactNode } from 'react'
import { clsx } from 'clsx'
import { BrandLockup } from './BrandLockup'

export function StatusPage({
  eyebrow,
  eyebrowTone = 'neutral',
  title,
  description,
  actions,
}: {
  eyebrow: string
  eyebrowTone?: 'neutral' | 'danger'
  title: string
  description: string
  actions?: ReactNode
}) {
  return (
    <main className="grid min-h-dvh place-items-center bg-page px-6 py-12 text-center text-ink">
      <div className="grid max-w-[420px] justify-items-center gap-6">
        <BrandLockup />
        <span className={clsx('ui-status-eyebrow', eyebrowTone === 'danger' ? 'text-danger' : 'text-muted')}>
          {eyebrow}
        </span>
        <h1 className="ui-status-title">{title}</h1>
        <p className="ui-status-description">{description}</p>
        {actions && <div className="flex flex-wrap justify-center gap-2">{actions}</div>}
        <p className="ui-meta">money / a daily practice</p>
      </div>
    </main>
  )
}
