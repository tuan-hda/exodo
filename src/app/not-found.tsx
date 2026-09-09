'use client'

import Link from 'next/link'
import { StatusPage } from '@/components/StatusPage'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <StatusPage
      eyebrow="404 / not found"
      title="This page moved."
      description="The place you are looking for is not part of this account view."
      actions={
        <Button asChild>
          <Link href="/">Return to Exodo</Link>
        </Button>
      }
    />
  )
}
