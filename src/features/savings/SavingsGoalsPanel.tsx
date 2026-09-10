'use client'

import { useState } from 'react'
import { EmptyState } from '@/components/EmptyState'
import { StateMessage } from '@/components/StateMessage'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { SavingsDepositComposer } from './SavingsDepositComposer'
import { SavingsGoalList } from './SavingsGoalList'
import type { SavingsState } from './use-savings'

export function SavingsGoalsLoading() {
  return (
    <div className="grid gap-4" role="status" aria-label="Loading savings goals">
      {Array.from({ length: 2 }, (_, index) => (
        <Card tone="flat" className="grid gap-5 p-6 md:p-7" key={index}>
          <div className="flex items-center gap-3">
            <Skeleton className="size-11 rounded-control" />
            <div className="grid gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-2.5 w-full" />
        </Card>
      ))}
    </div>
  )
}

export function SavingsGoalsPanel({ savings }: { savings: SavingsState }) {
  const { goals, deposits, isLoading, isSaving, error, addDeposit } = savings
  const [depositGoal, setDepositGoal] = useState<string | null>(null)
  const selectedGoal = goals.find((goal) => goal.id === depositGoal)
  const showHeader = Boolean(error) || isLoading || goals.length > 0
  const countLabel = isLoading && goals.length === 0 ? 'loading' : `${goals.length} tracked`
  return (
    <section aria-label="Savings goals" aria-busy={isLoading}>
      {showHeader && (
        <div className="flex items-center justify-between gap-4 border-b border-line pb-3">
          <span className="ui-eyebrow">savings goals</span>
          <span className="ui-eyebrow">{countLabel}</span>
        </div>
      )}
      {error && (
        <StateMessage tone="danger" className="mb-4">
          {error}
        </StateMessage>
      )}
      {isLoading && goals.length === 0 && (
        <div className="mt-4">
          <SavingsGoalsLoading />
        </div>
      )}
      {!isLoading && !error && goals.length === 0 && (
        <EmptyState title="No savings goals yet" description="Create one in Settings to start tracking a target." />
      )}
      {goals.length > 0 && (
        <div className="mt-4">
          <SavingsGoalList goals={goals} deposits={deposits} onAdd={setDepositGoal} />
        </div>
      )}
      {selectedGoal && (
        <SavingsDepositComposer
          goal={selectedGoal}
          isSaving={isSaving}
          persistenceError={error}
          onClose={() => setDepositGoal(null)}
          onSave={(value, note) => addDeposit(selectedGoal.id, value, note)}
        />
      )}
    </section>
  )
}
