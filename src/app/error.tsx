'use client'

import Link from 'next/link'
import { ArrowClockwise, House } from '@phosphor-icons/react'
import { Button } from '../components/ui/button'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  void error

  return (
    <main className="grid min-h-dvh place-items-center bg-page px-6 py-12 text-center text-ink">
      <div className="grid max-w-[420px] justify-items-center gap-5">
        <span className="font-mono text-[10px] uppercase tracking-[.14em] text-danger">Something went wrong</span>
        <h1 className="m-0 text-[clamp(42px,8vw,72px)] font-semibold leading-[.94] tracking-[-.08em]">
          Let’s try that again.
        </h1>
        <p className="m-0 max-w-[34ch] text-sm leading-[1.6] text-muted">
          Exodo could not finish loading this view. Your saved records are unchanged.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button type="button" onClick={reset}>
            <ArrowClockwise size={16} /> Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <House size={16} /> Return home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
