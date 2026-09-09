import type { ReactNode } from 'react'
import { BrandLockup } from '@/components/BrandLockup'

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-page px-6 py-12 text-center text-sm text-muted">
      <div className="grid w-full max-w-[480px] justify-items-center gap-7">
        <div className="grid justify-items-center gap-4">
          <BrandLockup />
          <p className="ui-eyebrow m-0">personal money, practiced daily</p>
        </div>
        {children}
        <p className="ui-meta">money / a daily practice</p>
      </div>
    </main>
  )
}
