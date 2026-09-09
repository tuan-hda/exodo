'use client'

import type { ReactNode } from 'react'
import { ClerkLoaded, ClerkLoading, SignIn, useUser } from '@clerk/nextjs'
import { Skeleton } from '@/components/ui/skeleton'
import { clerkAppearance } from './clerk-appearance'

export function AuthGate({ children }: { children: ReactNode }) {
  const { isSignedIn } = useUser()

  return (
    <>
      <ClerkLoading>
        <div className="grid min-h-dvh place-items-center bg-page p-6 text-center">
          <div className="grid w-full max-w-[360px] justify-items-center gap-3" aria-label="Loading your account">
            <Skeleton className="size-14 rounded-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
      </ClerkLoading>
      <ClerkLoaded>
        {isSignedIn ? (
          children
        ) : (
          <div className="grid min-h-dvh place-items-center bg-page p-6 text-center text-sm text-muted">
            <SignIn appearance={clerkAppearance} routing="hash" fallbackRedirectUrl="/" />
          </div>
        )}
      </ClerkLoaded>
    </>
  )
}
