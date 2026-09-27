'use client'

import { useEffect, useRef, useState } from 'react'
import { Reorder, useDragControls, useReducedMotion } from 'motion/react'
import { DotsSixVertical, PencilSimple } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { SavingsGoalCard } from './SavingsGoalCard'
import type { SavingsDeposit, SavingsGoal } from './types'

function SortableGoal({
  goal,
  deposits,
  disabled,
  onEdit,
  onAdd,
  onMove,
  onDrop,
}: {
  goal: SavingsGoal
  deposits: SavingsDeposit[]
  disabled: boolean
  onEdit: (goal: SavingsGoal) => void
  onAdd: (id: string) => void
  onMove: (id: string, delta: number) => void
  onDrop: () => void
}) {
  const controls = useDragControls()
  const reducedMotion = useReducedMotion()
  return (
    <Reorder.Item
      value={goal.id}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDrop}
      className="relative list-none"
      transition={reducedMotion ? { duration: 0 } : undefined}>
      <SavingsGoalCard
        goal={goal}
        deposits={deposits}
        onAdd={disabled ? undefined : onAdd}
        actions={
          <>
            <Button variant="outline" size="sm" disabled={disabled} onClick={() => onEdit(goal)}>
              <PencilSimple size={15} /> Edit
            </Button>
            <span className="touch-none">
              <Button
                variant="ghost"
                size="icon-lg"
                disabled={disabled}
                aria-label={`Reorder ${goal.name}. Use up and down arrow keys to move.`}
                onPointerDown={(event) => controls.start(event)}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                    event.preventDefault()
                    onMove(goal.id, event.key === 'ArrowUp' ? -1 : 1)
                  }
                }}>
                <DotsSixVertical size={20} />
              </Button>
            </span>
          </>
        }
      />
    </Reorder.Item>
  )
}

export function SavingsGoalSettingsList({
  goals,
  deposits,
  disabled,
  onEdit,
  onAdd,
  onReorder,
}: {
  goals: SavingsGoal[]
  deposits: SavingsDeposit[]
  disabled: boolean
  onEdit: (goal: SavingsGoal) => void
  onAdd: (id: string) => void
  onReorder: (ids: string[]) => Promise<boolean>
}) {
  const [order, setOrder] = useState(goals.map((goal) => goal.id))
  const orderRef = useRef(order)
  const [announcement, setAnnouncement] = useState('')
  useEffect(() => {
    const ids = goals.map((goal) => goal.id)
    orderRef.current = ids
    setOrder(ids)
  }, [goals])

  function updateOrder(ids: string[]) {
    orderRef.current = ids
    setOrder(ids)
  }

  async function saveOrder() {
    const ids = orderRef.current
    if (ids.every((id, index) => id === goals[index]?.id)) return
    const saved = await onReorder(ids)
    if (saved) setAnnouncement('Goal order saved.')
    else updateOrder(goals.map((goal) => goal.id))
  }

  return (
    <div className="grid gap-3">
      {goals.length > 1 && (
        <p className="text-sm text-muted">
          Drag the handles to reorder. Goals at the top receive monthly savings first.
        </p>
      )}
      <p className="sr-only" role="status">
        {announcement}
      </p>
      <Reorder.Group axis="y" values={order} onReorder={updateOrder} className="grid gap-4">
        {order.map((id) => {
          const goal = goals.find((item) => item.id === id)
          if (!goal) return null
          return (
            <SortableGoal
              key={id}
              goal={goal}
              deposits={deposits}
              disabled={disabled}
              onEdit={onEdit}
              onAdd={onAdd}
              onDrop={() => void saveOrder()}
              onMove={(goalId, delta) => {
                const ids = [...orderRef.current]
                const index = ids.indexOf(goalId)
                const next = index + delta
                if (next < 0 || next >= ids.length) return
                ;[ids[index], ids[next]] = [ids[next], ids[index]]
                updateOrder(ids)
                void saveOrder()
              }}
            />
          )
        })}
      </Reorder.Group>
    </div>
  )
}
