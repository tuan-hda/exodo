'use client'

import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { ClerkLoaded, ClerkLoading, SignIn, useClerk, useUser } from '@clerk/nextjs'

export function AuthGate({ children }: { children: ReactNode }) {
  const { isSignedIn } = useUser()

  return <><ClerkLoading><div className="auth-state">Loading your account…</div></ClerkLoading><ClerkLoaded>{isSignedIn ? children : <div className="auth-state"><SignIn routing="hash" /></div>}</ClerkLoaded></>
}

export function AuthAccount() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const email = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? ''
  const initials = (user?.firstName?.[0] ?? user?.lastName?.[0] ?? email[0] ?? 'E').toUpperCase()
  const name = user?.fullName ?? user?.firstName ?? 'Your account'

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false)
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  return <div className="account-menu" ref={menuRef}><button className="local-avatar" type="button" aria-label="Open account menu" aria-expanded={open} onClick={() => setOpen(current => !current)}><span>{initials}</span></button>{open && <div className="account-popover" role="menu"><div className="account-popover-heading"><span className="local-avatar small"><span>{initials}</span></span><div><strong>{name}</strong><small>{email}</small></div></div><button className="account-signout" type="button" role="menuitem" onClick={() => signOut()}>Sign out</button></div>}</div>
}
