'use client'

import { SignOut, UserCircle } from '@phosphor-icons/react'
import { useClerk, useUser } from '@clerk/nextjs'

export function AccountView() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const email = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? ''
  const initials = (user?.firstName?.[0] ?? user?.lastName?.[0] ?? email[0] ?? 'E').toUpperCase()
  const name = user?.fullName ?? user?.firstName ?? 'Your account'

  return (
    <section className="account-view">
      <div className="account-avatar-large">{initials}</div>
      <p className="eyebrow">your account</p>
      <h1>{name}</h1>
      <p className="account-email">{email}</p>
      <div className="account-card">
        <div>
          <UserCircle size={20} />
          <div>
            <strong>Personal workspace</strong>
            <small>Private to your account</small>
          </div>
        </div>
      </div>
      <button className="account-signout account-signout-page" type="button" onClick={() => signOut()}>
        <SignOut size={17} /> Sign out
      </button>
    </section>
  )
}
