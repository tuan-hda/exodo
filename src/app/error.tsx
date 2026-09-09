'use client'

import Link from 'next/link'
import { ArrowClockwise, House } from '@phosphor-icons/react'
import { StatusPage } from '@/components/StatusPage'
import { Button } from '@/components/ui/button'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  void error

  return (
    <StatusPage
      eyebrow="Something went wrong"
      eyebrowTone="danger"
      title="Let’s try that again."
      description="Exodo could not finish loading this view. Your saved records are unchanged."
      actions={
        <>
          <Button type="button" onClick={reset}>
            <ArrowClockwise size={16} /> Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <House size={16} /> Return home
            </Link>
          </Button>
        </>
      }
    />
  )
}
