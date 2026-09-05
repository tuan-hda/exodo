'use client'

import { useState } from 'react'
import { Card } from '../../components/ui/card'
import type { Entry } from '../entries/types'
import { SavingsGoalCard } from './SavingsGoalCard'
import { SavingsDepositComposer } from './SavingsDepositComposer'
import { useSavings } from './use-savings'

export function SavingsGoalsPanel({ userId, entries }: { userId?: string; entries: Entry[] }) {
  const { goals, deposits, isLoading, isSaving, addDeposit } = useSavings(userId, entries)
  const [depositGoal, setDepositGoal] = useState<string | null>(null)
  const selectedGoal = goals.find((goal) => goal.id === depositGoal)
  return (
    <section>
      {isLoading && goals.length === 0 && (
        <p className="py-6 font-mono text-[11px] uppercase tracking-[.08em] text-muted">Loading goals…</p>
      )}
      {!isLoading && goals.length === 0 && (
        <Card className="border-dashed p-6 text-sm text-muted">No savings goals yet.</Card>
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
