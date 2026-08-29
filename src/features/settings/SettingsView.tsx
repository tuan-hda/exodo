'use client'

import { useState } from 'react'
import { SignOut, UserCircle, Wallet } from '@phosphor-icons/react'
import { useClerk, useUser } from '@clerk/nextjs'
import { BudgetSettingsView } from './BudgetSettingsView'
import { SettingsMenuItem } from './SettingsMenuItem'

export function SettingsView() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [page, setPage] = useState<'menu' | 'budgets'>('menu')
  const email = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? ''
  const initials = (user?.firstName?.[0] ?? user?.lastName?.[0] ?? email[0] ?? 'E').toUpperCase()
  const name = user?.fullName ?? user?.firstName ?? 'Your account'

  if (page === 'budgets') return <BudgetSettingsView onBack={() => setPage('menu')} />

  return (
    <section className="settings-view">
      <div className="account-view">
        <div className="account-avatar-large">{initials}</div>
        <p className="eyebrow">settings</p>
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
      </div>
      <div className="settings-menu" aria-label="Settings menu">
        <SettingsMenuItem
          icon={<Wallet size={20} />}
          title="Budget settings"
          description="Set a recurring limit for each expense category"
          onClick={() => setPage('budgets')}
        />
      </div>
      <button className="account-signout account-signout-page" type="button" onClick={() => signOut()}>
        <SignOut size={17} /> Sign out
      </button>
    </section>
  )
}
