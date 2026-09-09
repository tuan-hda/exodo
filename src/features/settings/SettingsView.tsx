'use client'

import { useState } from 'react'
import { PaintBrush, PiggyBank, SignOut, UserCircle, Wallet } from '@phosphor-icons/react'
import { useClerk, useUser } from '@clerk/nextjs'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { PageHeader } from '../../components/PageHeader'
import { BudgetSettingsView } from './BudgetSettingsView'
import { SettingsMenuItem } from './SettingsMenuItem'
import type { Entry } from '../entries/types'
import { SavingsView } from '../savings/SavingsView'
import { CustomizationView } from './CustomizationView'

export function SettingsView({ userId, entries }: { userId?: string; entries: Entry[] }) {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [page, setPage] = useState<'menu' | 'budgets' | 'savings' | 'customization'>('menu')
  const email = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? ''
  const initials = (user?.firstName?.[0] ?? user?.lastName?.[0] ?? email[0] ?? 'E').toUpperCase()
  const name = user?.fullName ?? user?.firstName ?? 'Your account'

  if (page === 'budgets') return <BudgetSettingsView onBack={() => setPage('menu')} />
  if (page === 'savings') return <SavingsView userId={userId} entries={entries} onBack={() => setPage('menu')} />
  if (page === 'customization') return <CustomizationView onBack={() => setPage('menu')} />

  return (
    <section className="mx-auto grid max-w-[620px] gap-8 pb-8 animate-[page-rise_.55s_cubic-bezier(.16,1,.3,1)_both]">
      <div className="grid justify-items-center gap-4 py-4 text-center">
        <div className="grid size-16 place-items-center rounded-full bg-ink text-xl font-semibold tracking-[-.06em] text-white">
          {initials}
        </div>
        <PageHeader eyebrow="settings" title={name} description={email} className="justify-items-center gap-0" />
        <Card tone="soft" className="w-full p-4 text-left">
          <div className="flex items-center gap-3">
            <span className="ui-icon-tile size-9 rounded-full bg-surface">
              <UserCircle size={19} />
            </span>
            <div>
              <strong className="block text-sm font-semibold">Personal workspace</strong>
              <small className="mt-1 block text-xs text-muted">Private to your account</small>
            </div>
          </div>
        </Card>
      </div>
      <nav className="ui-divider-list border-y border-line" aria-label="Settings menu">
        <SettingsMenuItem
          icon={<Wallet size={20} />}
          title="Budget settings"
          description="Set a recurring limit for each expense category"
          onClick={() => setPage('budgets')}
        />
        <SettingsMenuItem
          icon={<PiggyBank size={20} />}
          title="Savings goals"
          description="Track money you are saving for a target"
          onClick={() => setPage('savings')}
        />
        <SettingsMenuItem
          icon={<PaintBrush size={20} />}
          title="Customization"
          description="Choose how Exodo looks"
          onClick={() => setPage('customization')}
        />
      </nav>
      <Button
        variant="outline"
        className="w-full text-xs font-semibold text-muted"
        type="button"
        onClick={() => signOut()}>
        <SignOut size={17} /> Sign out
      </Button>
    </section>
  )
}
