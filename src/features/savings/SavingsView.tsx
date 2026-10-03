'use client'

import { useState, type FormEvent } from 'react'
import { Plus, X } from '@phosphor-icons/react'
import { EmptyState } from '@/components/EmptyState'
import { MetricCard } from '@/components/MetricCard'
import { PageHeader } from '@/components/PageHeader'
import { PageShell } from '@/components/PageShell'
import { StateMessage } from '@/components/StateMessage'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { formatMoney } from '@/lib/money'
import { SavingsDepositComposer } from './SavingsDepositComposer'
import { SavingsGoalSettingsList } from './SavingsGoalSettingsList'
import { SavingsGoalsLoading } from './SavingsGoalsPanel'
import { SavingsIcon, defaultSavingsIcon, savingsIconOptions, type SavingsIconName } from './savings-icons'
import type { SavingsState } from './use-savings'
import type { SavingsGoal } from './types'

type GoalValidationError = {
  field: 'name' | 'target'
  message: string
}

export function SavingsView({ savings, onBack }: { savings: SavingsState; onBack?: () => void }) {
  const { goals, deposits, isLoading, isSaving, error, saveGoal, reorderGoals, addDeposit, deleteDeposit } = savings
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [date, setDate] = useState('')
  const [icon, setIcon] = useState<SavingsIconName>(defaultSavingsIcon)
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const [depositGoal, setDepositGoal] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [validationError, setValidationError] = useState<GoalValidationError | null>(null)
  const selectedGoal = goals.find((goal) => goal.id === depositGoal)

  function openGoalForm(goal: SavingsGoal | null) {
    setEditingGoal(goal)
    setName(goal?.name ?? '')
    setTarget(goal ? String(goal.targetAmount) : '')
    setDate(goal?.targetDate ?? '')
    setIcon(goal?.icon ?? defaultSavingsIcon)
    setIconPickerOpen(false)
    setValidationError(null)
    setNotice('')
    setShowForm(true)
    requestAnimationFrame(() => document.getElementById('goal-name')?.focus())
  }

  const summary = {
    target: goals.reduce((sum, goal) => sum + goal.targetAmount, 0),
    saved: goals.reduce((sum, goal) => sum + goal.savedAmount, 0),
  }
  async function submitGoal(event: FormEvent) {
    event.preventDefault()
    setNotice('')
    const goalName = name.trim()
    const targetAmount = Number(target)
    if (!goalName) {
      setValidationError({ field: 'name', message: 'Give this goal a name.' })
      return
    }
    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      setValidationError({ field: 'target', message: 'Enter a target amount greater than zero.' })
      return
    }
    setValidationError(null)
    const saved = await saveGoal({
      ...(editingGoal ? { id: editingGoal.id } : {}),
      name: goalName,
      targetAmount,
      targetDate: date || null,
      icon,
      status: editingGoal?.status ?? 'active',
    })
    if (saved) {
      setName('')
      setTarget('')
      setDate('')
      setIcon(defaultSavingsIcon)
      setIconPickerOpen(false)
      setShowForm(false)
      setNotice(`${goalName} ${editingGoal ? 'updated' : 'created'}.`)
      setEditingGoal(null)
    }
  }
  return (
    <PageShell size="wide" aria-busy={isLoading}>
      <PageHeader
        eyebrow="the goal tracker"
        title="Save for what matters."
        description="Give your extra money somewhere meaningful to go."
        backLabel="Settings"
        onBack={onBack}
        actions={
          <Button
            type="button"
            disabled={isSaving}
            onClick={() => (showForm ? setShowForm(false) : openGoalForm(null))}>
            {showForm ? <X size={17} /> : <Plus size={17} />} {showForm ? 'Close' : 'New goal'}
          </Button>
        }
      />
      {(validationError || error) && (
        <StateMessage id={validationError ? 'goal-form-error' : undefined} tone="danger">
          {validationError?.message || error}
        </StateMessage>
      )}
      {notice && !validationError && !error && <StateMessage tone="success">{notice}</StateMessage>}
      <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
        <MetricCard label="saved" value={formatMoney(summary.saved)} detail="across goals" isLoading={isLoading} />
        <MetricCard label="target" value={formatMoney(summary.target)} detail="across goals" isLoading={isLoading} />
      </div>
      {showForm && (
        <Card className="p-5">
          <form className="grid gap-4" noValidate onSubmit={submitGoal}>
            <h2 className="text-lg font-semibold">{editingGoal ? 'Edit goal' : 'New goal'}</h2>
            <fieldset disabled={isSaving} className="grid min-w-0 gap-4">
              <Field>
                <FieldLabel htmlFor="goal-name">Goal name</FieldLabel>
                <Input
                  id="goal-name"
                  value={name}
                  onChange={(event) => {
                    setValidationError(null)
                    setName(event.target.value)
                  }}
                  placeholder="Japan trip"
                  required
                  aria-describedby={validationError?.field === 'name' ? 'goal-form-error' : undefined}
                  aria-invalid={validationError?.field === 'name'}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="goal-target">Target amount</FieldLabel>
                <Input
                  id="goal-target"
                  inputMode="decimal"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={target}
                  onChange={(event) => {
                    setValidationError(null)
                    setTarget(event.target.value)
                  }}
                  placeholder="3000"
                  required
                  aria-describedby={validationError?.field === 'target' ? 'goal-form-error' : undefined}
                  aria-invalid={validationError?.field === 'target'}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="goal-date" hint="optional">
                  Target date
                </FieldLabel>
                <Input id="goal-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
              </Field>
              <Field>
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
              </Field>
              <Button disabled={isSaving} type="submit">
                {isSaving ? 'Saving…' : editingGoal ? 'Save changes' : 'Create goal'}
              </Button>
            </fieldset>
          </form>
        </Card>
      )}
      {isLoading && goals.length === 0 && <SavingsGoalsLoading />}
      {!isLoading && !error && goals.length === 0 && !showForm && (
        <EmptyState
          icon={<SavingsIcon name="target" size={22} />}
          title="No savings goals yet"
          description="Create your first goal and give your extra money somewhere meaningful to go."
          action={
            <Button type="button" onClick={() => openGoalForm(null)}>
              Create a savings goal
            </Button>
          }
        />
      )}
      <SavingsGoalSettingsList
        goals={goals}
        deposits={deposits}
        disabled={isSaving || isLoading}
        onEdit={openGoalForm}
        onAdd={setDepositGoal}
        onDelete={(id) => void deleteDeposit(id)}
        onReorder={reorderGoals}
      />
      {process.env.NODE_ENV === 'development' && (
        <Card className="grid gap-3 p-5">
          <p className="text-sm text-muted">
            Calculate last month's savings. Already-calculated months skip the entry reload.
          </p>
          <div>
            <Button
              variant="secondary"
              disabled={isLoading || isSaving || !goals.length}
              onClick={async () => {
                setNotice('')
                if (await savings.testMonthlyCalculation()) {
                  setNotice('Monthly check complete. Already-calculated months are skipped.')
                }
              }}>
              {isSaving ? 'Checking…' : 'Test monthly calculation'}
            </Button>
          </div>
        </Card>
      )}
      {selectedGoal && (
        <SavingsDepositComposer
          goal={selectedGoal}
          isSaving={isSaving}
          persistenceError={error}
          onClose={() => setDepositGoal(null)}
          onSave={(amount, note) => addDeposit(selectedGoal.id, amount, note)}
        />
      )}
    </PageShell>
  )
}
