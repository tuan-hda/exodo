'use client'

import type { ReactNode } from 'react'
import { ClerkLoaded, ClerkLoading, SignIn, UserButton, useUser } from '@clerk/nextjs'

export function AuthGate({ children }: { children: ReactNode }) {
  const { isSignedIn } = useUser()

  return <><ClerkLoading><div className="auth-state">Loading your account…</div></ClerkLoading><ClerkLoaded>{isSignedIn ? children : <div className="auth-state"><SignIn routing="hash" /></div>}</ClerkLoaded></>
}

export function AuthAccount() {
  return <UserButton appearance={{ elements: { userButtonAvatarBox: 'size-8' } }} />
}
