'use client'

import { useState } from 'react'
import { PiggyBank, SignOut, UserCircle, Wallet } from '@phosphor-icons/react'
import { useClerk, useUser } from '@clerk/nextjs'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { BudgetSettingsView } from './BudgetSettingsView'
import { SettingsMenuItem } from './SettingsMenuItem'
import type { Entry } from '../entries/types'
import { SavingsView } from '../savings/SavingsView'
import { CustomizationView } from './CustomizationView'
import { PaintBrush } from '@phosphor-icons/react'

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
    <section className="mx-auto max-w-[620px] pb-8">
      <div className="mx-auto flex flex-col items-center py-8 text-center">
        <div className="mb-5 grid size-20 place-items-center rounded-full bg-ink text-2xl font-bold tracking-[-.06em] text-white">
          {initials}
        </div>
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[.12em] text-muted">settings</p>
        <h1 className="max-w-full break-words text-balance text-[clamp(34px,5vw,52px)]">{name}</h1>
        <p className="mt-3 text-sm text-muted">{email}</p>
        <Card className="mt-8 w-full rounded-[20px] border-line bg-soft p-4 text-left">
          <div className="flex items-center gap-3">
            <UserCircle size={20} />
            <div>
              <strong className="block text-sm font-semibold">Personal workspace</strong>
              <small className="mt-1 block text-xs text-muted">Private to your account</small>
            </div>
          </div>
        </Card>
      </div>
      <div className="border-y border-line" aria-label="Settings menu">
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
      </div>
      <Button
        variant="outline"
        className="mt-4 w-full text-xs font-bold text-muted"
        type="button"
        onClick={() => signOut()}>
        <SignOut size={17} /> Sign out
      </Button>
    </section>
  )
}
