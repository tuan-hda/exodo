'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-page px-6 py-12 text-center text-ink">
      <div className="grid max-w-[420px] justify-items-center gap-5">
        <span className="font-mono text-[10px] uppercase tracking-[.14em] text-muted">404 / not found</span>
        <h1 className="m-0 text-[clamp(42px,8vw,72px)] font-semibold leading-[.94] tracking-[-.08em]">
          This page moved.
        </h1>
        <p className="m-0 max-w-[34ch] text-sm leading-[1.6] text-muted">
          The place you are looking for is not part of this account view.
        </p>
        <Button asChild>
          <Link href="/">Return to Exodo</Link>
        </Button>
      </div>
    </main>
  )
}
