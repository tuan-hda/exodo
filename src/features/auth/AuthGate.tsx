'use client'

import type { ReactNode } from 'react'
import { ClerkLoaded, ClerkLoading, SignIn, useUser } from '@clerk/nextjs'

export function AuthGate({ children }: { children: ReactNode }) {
  const { isSignedIn } = useUser()

  return (
    <>
      <ClerkLoading>
        <div className="grid min-h-dvh place-items-center bg-white p-6 text-center text-sm text-muted">
          Loading your account…
        </div>
      </ClerkLoading>
      <ClerkLoaded>
        {isSignedIn ? (
          children
        ) : (
          <div className="grid min-h-dvh place-items-center bg-white p-6 text-center text-sm text-muted">
            <SignIn routing="hash" fallbackRedirectUrl="/" />
          </div>
        )}
      </ClerkLoaded>
    </>
  )
}
