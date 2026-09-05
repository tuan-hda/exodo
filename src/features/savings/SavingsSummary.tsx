'use client'

import { ArrowRight } from '@phosphor-icons/react'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Progress } from '../../components/ui/progress'
import { formatShort } from '../entries/entry-utils'
import type { Entry } from '../entries/types'
import { useSavings } from './use-savings'

export function SavingsSummary({ userId, entries, onOpen }: { userId?: string; entries: Entry[]; onOpen: () => void }) {
  const { goals, isLoading } = useSavings(userId, entries)
  const activeGoals = goals.filter((goal) => goal.status === 'active')
  const saved = goals.reduce((sum, goal) => sum + goal.savedAmount, 0)
  const target = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)

  return (
    <Card className="mt-4 bg-soft p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.08em] text-muted">Savings goals</p>
          <p className="mt-2 text-sm text-muted">
            {isLoading
              ? 'Loading…'
              : activeGoals.length
                ? `${activeGoals.length} active ${activeGoals.length === 1 ? 'goal' : 'goals'}`
                : 'Start a goal for something meaningful'}
          </p>
        </div>
        <Button variant="ghost" size="icon" type="button" onClick={onOpen} aria-label="Open savings goals">
          <ArrowRight size={18} />
        </Button>
      </div>
      {goals.length > 0 && (
        <>
          <div className="mt-5 flex items-end justify-between text-sm">
            <span>
              <strong className="text-xl">{formatShort(saved)}</strong> saved
            </span>
            <span className="text-xs text-muted">of {formatShort(target)}</span>
          </div>
          <Progress className="mt-3" value={target ? Math.min(100, (saved / target) * 100) : 0} />
        </>
      )}
      <Button variant="outline" className="mt-4 w-full text-xs font-semibold" type="button" onClick={onOpen}>
        {goals.length ? 'Manage savings goals' : 'Create a savings goal'} <ArrowRight size={15} />
      </Button>
    </Card>
  )
}
