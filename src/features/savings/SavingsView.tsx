'use client'

import { useState, type FormEvent } from 'react'
import { Plus, X } from '@phosphor-icons/react'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/PageHeader'
import { StateMessage } from '@/components/StateMessage'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import type { Entry } from '@/features/entries/types'
import { formatMoney } from '@/features/entries/entry-utils'
import { SavingsDepositComposer } from './SavingsDepositComposer'
import { SavingsGoalCard } from './SavingsGoalCard'
import { SavingsGoalsLoading } from './SavingsGoalsPanel'
import { SavingsIcon, defaultSavingsIcon, savingsIconOptions, type SavingsIconName } from './savings-icons'
import { useSavings } from './use-savings'

export function SavingsView({ userId, entries, onBack }: { userId?: string; entries: Entry[]; onBack?: () => void }) {
  const { goals, deposits, isLoading, isSaving, error, saveGoal, addDeposit } = useSavings(userId, entries)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [date, setDate] = useState('')
  const [icon, setIcon] = useState<SavingsIconName>(defaultSavingsIcon)
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const [depositGoal, setDepositGoal] = useState<string | null>(null)
  const selectedGoal = goals.find((goal) => goal.id === depositGoal)

  const summary = {
    target: goals.reduce((sum, goal) => sum + goal.targetAmount, 0),
    saved: goals.reduce((sum, goal) => sum + goal.savedAmount, 0),
  }
  async function submitGoal(event: FormEvent) {
    event.preventDefault()
    const saved = await saveGoal({
      name,
      targetAmount: Number(target),
      targetDate: date || null,
      icon,
      status: 'active',
    })
    if (saved) {
      setName('')
      setTarget('')
      setDate('')
      setIcon(defaultSavingsIcon)
      setIconPickerOpen(false)
      setShowForm(false)
    }
  }
  return (
    <section
      className="mx-auto grid max-w-[760px] gap-8 pb-12 animate-[page-rise_.55s_cubic-bezier(.16,1,.3,1)_both]"
      aria-busy={isLoading}>
      <PageHeader
        eyebrow="the goal tracker"
        title="Save for what matters."
        description="Give your extra money somewhere meaningful to go."
        backLabel="Settings"
        onBack={onBack}
        actions={
          <Button type="button" onClick={() => setShowForm((value) => !value)}>
            {showForm ? <X size={17} /> : <Plus size={17} />} {showForm ? 'Close' : 'New goal'}
          </Button>
        }
      />
      {error && <StateMessage tone="danger">{error}</StateMessage>}
      <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
        <Card tone="soft" className="p-5">
          <p className="ui-eyebrow m-0">Saved</p>
          {isLoading ? (
            <Skeleton className="mt-2 h-7 w-32" />
          ) : (
            <strong className="ui-number mt-2 block text-2xl font-semibold">{formatMoney(summary.saved)}</strong>
          )}
        </Card>
        <Card tone="soft" className="p-5">
          <p className="ui-eyebrow m-0">Target</p>
          {isLoading ? (
            <Skeleton className="mt-2 h-7 w-32" />
          ) : (
            <strong className="ui-number mt-2 block text-2xl font-semibold">{formatMoney(summary.target)}</strong>
          )}
        </Card>
      </div>
      {showForm && (
        <Card className="p-5">
          <form className="grid gap-4" onSubmit={submitGoal}>
            <div className="ui-field">
              <label className="ui-field-label" htmlFor="goal-name">
                Goal name
              </label>
              <Input
                id="goal-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Japan trip"
                required
              />
            </div>
            <div className="ui-field">
              <label className="ui-field-label" htmlFor="goal-target">
                Target amount
              </label>
              <Input
                id="goal-target"
                inputMode="decimal"
                type="number"
                min="0.01"
                step="0.01"
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                placeholder="3000"
                required
              />
            </div>
            <div className="ui-field">
              <label className="ui-field-label" htmlFor="goal-date">
                Target date <span className="ui-field-hint">optional</span>
              </label>
              <Input id="goal-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
            <div className="ui-field">
              <p className="ui-field-label">Choose an icon</p>
              <Popover open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon-lg" type="button" aria-label="Choose a goal icon">
                    <SavingsIcon name={icon} size={24} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[min(288px,calc(100vw-32px))] p-3" align="start">
                  <div className="grid grid-cols-4 gap-2" role="group" aria-label="Goal icons">
                    {savingsIconOptions.map((option) => (
                      <Button
                        key={option.name}
                        variant="option"
                        size="icon-lg"
                        type="button"
                        data-selected={icon === option.name}
                        aria-label={option.label}
                        aria-pressed={icon === option.name}
                        onClick={() => {
                          setIcon(option.name)
                          setIconPickerOpen(false)
                        }}>
                        <SavingsIcon name={option.name} size={21} />
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <Button disabled={isSaving} type="submit">
              {isSaving ? 'Saving…' : 'Create goal'}
            </Button>
          </form>
        </Card>
      )}
      {isLoading && goals.length === 0 && <SavingsGoalsLoading />}
      {!isLoading && goals.length === 0 && !showForm && (
        <EmptyState
          title="No savings goals yet"
          description="Create your first goal and give your extra money somewhere meaningful to go."
          action={
            <Button type="button" onClick={() => setShowForm(true)}>
              Create a savings goal
            </Button>
          }
        />
      )}
      <div className="grid gap-4">
        {goals.map((goal) => (
          <SavingsGoalCard key={goal.id} goal={goal} deposits={deposits} onAdd={setDepositGoal} />
        ))}
      </div>
      {selectedGoal && (
        <SavingsDepositComposer
          goal={selectedGoal}
          isSaving={isSaving}
          onClose={() => setDepositGoal(null)}
          onSave={(amount, note) => addDeposit(selectedGoal.id, amount, note)}
        />
      )}
    </section>
  )
}
