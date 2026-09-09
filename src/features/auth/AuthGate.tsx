'use client'

import type { ReactNode } from 'react'
import { ClerkLoaded, ClerkLoading, SignIn, useUser } from '@clerk/nextjs'
import { Skeleton } from '@/components/ui/skeleton'
import { clerkAppearance } from './clerk-appearance'
import { AuthShell } from './AuthShell'

export function AuthGate({ children }: { children: ReactNode }) {
  const { isSignedIn } = useUser()

  return (
    <>
      <ClerkLoading>
        <AuthShell>
          <div className="grid w-full max-w-[360px] justify-items-center gap-3" aria-label="Loading your account">
            <Skeleton className="size-14 rounded-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </AuthShell>
      </ClerkLoading>
      <ClerkLoaded>
        {isSignedIn ? (
          children
        ) : (
          <AuthShell>
            <SignIn appearance={clerkAppearance} routing="hash" fallbackRedirectUrl="/" />
          </AuthShell>
        )}
      </ClerkLoaded>
    </>
  )
}
