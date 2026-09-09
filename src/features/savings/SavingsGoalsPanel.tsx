'use client'

import { useState } from 'react'
import { EmptyState } from '@/components/EmptyState'
import { StateMessage } from '@/components/StateMessage'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Entry } from '@/features/entries/types'
import { SavingsDepositComposer } from './SavingsDepositComposer'
import { SavingsGoalList } from './SavingsGoalList'
import { useSavings } from './use-savings'

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

export function SavingsGoalsPanel({ userId, entries }: { userId?: string; entries: Entry[] }) {
  const { goals, deposits, isLoading, isSaving, error, addDeposit } = useSavings(userId, entries)
  const [depositGoal, setDepositGoal] = useState<string | null>(null)
  const selectedGoal = goals.find((goal) => goal.id === depositGoal)
  return (
    <section aria-label="Savings goals" aria-busy={isLoading}>
      {error && (
        <StateMessage tone="danger" className="mb-4">
          {error}
        </StateMessage>
      )}
      {isLoading && goals.length === 0 && <SavingsGoalsLoading />}
      {!isLoading && goals.length === 0 && (
        <EmptyState title="No savings goals yet" description="Create one in Settings to start tracking a target." />
      )}
      <SavingsGoalList goals={goals} deposits={deposits} onAdd={setDepositGoal} />
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
