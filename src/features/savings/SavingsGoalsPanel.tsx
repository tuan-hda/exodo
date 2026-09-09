'use client'

import { useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { StateMessage } from '../../components/StateMessage'
import type { Entry } from '../entries/types'
import { SavingsGoalCard } from './SavingsGoalCard'
import { SavingsDepositComposer } from './SavingsDepositComposer'
import { useSavings } from './use-savings'

export function SavingsGoalsPanel({ userId, entries }: { userId?: string; entries: Entry[] }) {
  const { goals, deposits, isLoading, isSaving, error, addDeposit } = useSavings(userId, entries)
  const [depositGoal, setDepositGoal] = useState<string | null>(null)
  const selectedGoal = goals.find((goal) => goal.id === depositGoal)
  return (
    <section aria-label="Savings goals">
      {error && (
        <StateMessage tone="danger" className="mb-4">
          {error}
        </StateMessage>
      )}
      {isLoading && goals.length === 0 && (
        <p className="py-6 font-mono text-[11px] uppercase tracking-[.08em] text-muted">Loading goals…</p>
      )}
      {!isLoading && goals.length === 0 && (
        <EmptyState title="No savings goals yet" description="Create one in Settings to start tracking a target." />
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
          onSave={(value, note) => addDeposit(selectedGoal.id, value, note)}
        />
      )}
    </section>
  )
}
