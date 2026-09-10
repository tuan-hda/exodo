'use client'

import { useEffect, useState } from 'react'
import { PaintBrush, PiggyBank, SignOut, UserCircle, Wallet } from '@phosphor-icons/react'
import { useClerk, useUser } from '@clerk/nextjs'
import { PageHeader } from '@/components/PageHeader'
import { PageShell } from '@/components/PageShell'
import { IconTile } from '@/components/IconTile'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BudgetSettingsView } from './BudgetSettingsView'
import { SettingsMenuItem } from './SettingsMenuItem'
import { SavingsView } from '@/features/savings/SavingsView'
import type { SavingsState } from '@/features/savings/use-savings'
import type { BudgetState } from '@/features/budgets/use-budgets'
import type { BackgroundPreferenceState } from './use-background-preference'
import { CustomizationView } from './CustomizationView'
import { getSettingsPageFromSearch, updateSearchParams, type SettingsPage } from '@/features/navigation/navigation'

function getInitialSettingsPage() {
  return typeof window === 'undefined' ? 'menu' : getSettingsPageFromSearch(window.location.search)
}

export function SettingsView({
  savings,
  budgets,
  backgroundPreference,
}: {
  savings: SavingsState
  budgets: BudgetState
  backgroundPreference: BackgroundPreferenceState
}) {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [page, setPage] = useState<SettingsPage>(getInitialSettingsPage)
  const email = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? ''
  const initials = (user?.firstName?.[0] ?? user?.lastName?.[0] ?? email[0] ?? 'E').toUpperCase()
  const name = user?.fullName ?? user?.firstName ?? 'Your account'

  useEffect(() => {
    const syncPage = () => setPage(getInitialSettingsPage())
    window.addEventListener('popstate', syncPage)
    return () => window.removeEventListener('popstate', syncPage)
  }, [])

  function changePage(nextPage: SettingsPage) {
    setPage(nextPage)
    window.history.replaceState(
      null,
      '',
      updateSearchParams(window.location.href, { section: nextPage === 'menu' ? null : nextPage }),
    )
  }

  if (page === 'budgets') return <BudgetSettingsView budgetState={budgets} onBack={() => changePage('menu')} />
  if (page === 'savings') return <SavingsView savings={savings} onBack={() => changePage('menu')} />
  if (page === 'customization') {
    return <CustomizationView preference={backgroundPreference} onBack={() => changePage('menu')} />
  }

  return (
    <PageShell>
      <div className="grid justify-items-center gap-4 py-4 text-center">
        <div className="grid size-16 place-items-center rounded-full bg-ink text-xl font-semibold tracking-[-.06em] text-white">
          {initials}
        </div>
        <PageHeader eyebrow="settings" title={name} description={email} className="justify-items-center gap-0" />
        <Card tone="soft" className="w-full p-4 text-left">
          <div className="flex items-center gap-3">
            <IconTile size="sm" shape="circle" tone="surface">
              <UserCircle size={19} />
            </IconTile>
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
          onClick={() => changePage('budgets')}
        />
        <SettingsMenuItem
          icon={<PiggyBank size={20} />}
          title="Savings goals"
          description="Track money you are saving for a target"
          onClick={() => changePage('savings')}
        />
        <SettingsMenuItem
          icon={<PaintBrush size={20} />}
          title="Customization"
          description="Choose how Exodo looks"
          onClick={() => changePage('customization')}
        />
      </nav>
      <Button variant="outline-muted" className="w-full" type="button" onClick={() => signOut()}>
        <SignOut size={17} /> Sign out
      </Button>
    </PageShell>
  )
}
