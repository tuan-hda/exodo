'use client'

import { useMemo, useState } from 'react'
import { ArrowLeft, Plus } from '@phosphor-icons/react'
import EmojiPicker from 'emoji-picker-react'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover'
import { Progress } from '../../components/ui/progress'
import type { Entry } from '../entries/types'
import { formatShort } from '../entries/entry-utils'
import { useSavings } from './use-savings'

export function SavingsView({ userId, entries, onBack }: { userId?: string; entries: Entry[]; onBack?: () => void }) {
  const { goals, deposits, isLoading, isSaving, error, saveGoal, addDeposit } = useSavings(userId, entries)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [date, setDate] = useState('')
  const [icon, setIcon] = useState('✈️')
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
  const [depositGoal, setDepositGoal] = useState<string | null>(null)
  const [depositAmount, setDepositAmount] = useState('')

  const summary = useMemo(
    () => ({
      target: goals.reduce((sum, goal) => sum + goal.targetAmount, 0),
      saved: goals.reduce((sum, goal) => sum + goal.savedAmount, 0),
    }),
    [goals],
  )
  async function submitGoal(event: React.FormEvent) {
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
      setIcon('✈️')
      setEmojiPickerOpen(false)
      setShowForm(false)
    }
  }
  async function submitDeposit(event: React.FormEvent) {
    event.preventDefault()
    if (!depositGoal) return
    if (await addDeposit(depositGoal, Number(depositAmount))) {
      setDepositGoal(null)
      setDepositAmount('')
    }
  }

  return (
    <section className="mx-auto max-w-[760px] pb-12">
      {onBack && (
        <Button
          variant="outline"
          size="sm"
          className="mt-8 text-xs font-semibold text-muted"
          type="button"
          onClick={onBack}>
          <ArrowLeft size={17} /> Settings
        </Button>
      )}
      <div className="mt-8 mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[.12em] text-muted">the goal tracker</p>
          <h1 className="text-[clamp(38px,6vw,60px)] font-semibold leading-none tracking-[-.08em]">
            Save for what matters.
          </h1>
        </div>
        <Button type="button" onClick={() => setShowForm((value) => !value)}>
          <Plus size={17} /> New goal
        </Button>
      </div>
      {error && (
        <p className="mb-4 rounded-[14px] border border-line-strong bg-soft px-3 py-3 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
      <div className="mb-8 grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
        <Card className="bg-soft p-4">
          <p className="font-mono text-[10px] uppercase text-muted">Saved</p>
          <strong className="mt-2 block text-2xl font-semibold">{formatShort(summary.saved)}</strong>
        </Card>
        <Card className="bg-soft p-4">
          <p className="font-mono text-[10px] uppercase text-muted">Target</p>
          <strong className="mt-2 block text-2xl font-semibold">{formatShort(summary.target)}</strong>
        </Card>
      </div>
      {showForm && (
        <Card className="mb-8 p-5">
          <form className="grid gap-4" onSubmit={submitGoal}>
            <div>
              <label className="mb-2 block text-xs font-semibold" htmlFor="goal-name">
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
            <div>
              <div>
                <label className="mb-2 block text-xs font-semibold" htmlFor="goal-target">
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
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold" htmlFor="goal-date">
                Target date <span className="font-normal text-muted">(optional)</span>
              </label>
              <Input id="goal-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold">Choose an emoji</p>
              <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="size-14 p-0 text-2xl" type="button" aria-label="Choose an emoji">
                    {icon}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[min(352px,calc(100vw-32px))] p-0" align="start">
                  <EmojiPicker
                    onEmojiClick={(emojiData) => {
                      setIcon(emojiData.emoji)
                      setEmojiPickerOpen(false)
                    }}
                    width="100%"
                    height={350}
                    skinTonesDisabled
                    previewConfig={{ showPreview: false }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button disabled={isSaving} type="submit">
              {isSaving ? 'Saving…' : 'Create goal'}
            </Button>
          </form>
        </Card>
      )}
      {isLoading && goals.length === 0 && (
        <p className="py-8 text-center font-mono text-[11px] uppercase tracking-[.08em] text-muted">Loading goals…</p>
      )}
      {!isLoading && goals.length === 0 && !showForm && (
        <Card className="border-dashed p-10 text-center">
          <p className="text-sm text-muted">
            Create your first goal and give your extra money somewhere meaningful to go.
          </p>
          <Button className="mt-5" type="button" onClick={() => setShowForm(true)}>
            Create a savings goal
          </Button>
        </Card>
      )}
      <div className="grid gap-4">
        {goals.map((goal) => {
          const percentage = Math.min(100, (goal.savedAmount / goal.targetAmount) * 100)
          const goalDeposits = deposits.filter((deposit) => deposit.goalId === goal.id).slice(0, 4)
          return (
            <Card className="p-5" key={goal.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-ink text-xl" aria-hidden="true">
                    {goal.icon || '✈️'}
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold">{goal.name}</h2>
                    <p className="mt-1 text-xs text-muted">
                      {goal.targetDate
                        ? `By ${new Date(`${goal.targetDate}T12:00:00`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                        : 'No deadline'}{' '}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" type="button" onClick={() => setDepositGoal(goal.id)}>
                  <Plus size={15} /> Add
                </Button>
              </div>
              <div className="mt-5 flex items-end justify-between text-sm">
                <span>
                  <strong className="text-xl">{formatShort(goal.savedAmount)}</strong> saved
                </span>
                <span className="font-mono text-xs text-muted">{Math.round(percentage)}%</span>
              </div>
              <Progress className="mt-3" value={percentage} />
              <div className="mt-3 flex justify-between text-xs text-muted">
                <span>{formatShort(Math.max(0, goal.targetAmount - goal.savedAmount))} remaining</span>
                <span>Target {formatShort(goal.targetAmount)}</span>
              </div>
              {goalDeposits.length > 0 && (
                <div className="mt-5 border-t border-line pt-3">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[.08em] text-muted">
                    Recent contributions
                  </p>
                  {goalDeposits.map((deposit) => (
                    <div className="flex justify-between py-1 text-xs" key={deposit.id}>
                      <span>{deposit.source === 'automatic' ? 'Monthly remainder' : 'Manual deposit'}</span>
                      <strong>+{formatShort(deposit.amount)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )
        })}
      </div>
      {depositGoal && (
        <Card className="fixed inset-x-4 bottom-4 z-10 mx-auto max-w-[420px] p-5 shadow-[0_18px_50px_rgb(21_21_21_/_0.18)]">
          <form onSubmit={submitDeposit}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Add contribution</h2>
              <Button variant="ghost" size="icon" type="button" onClick={() => setDepositGoal(null)} aria-label="Close">
                ×
              </Button>
            </div>
            <label className="mb-2 block text-xs font-semibold" htmlFor="deposit-amount">
              Amount
            </label>
            <Input
              id="deposit-amount"
              autoFocus
              inputMode="decimal"
              type="number"
              min="0.01"
              step="0.01"
              value={depositAmount}
              onChange={(event) => setDepositAmount(event.target.value)}
              placeholder="100"
              required
            />
            <Button className="mt-4 w-full" disabled={isSaving} type="submit">
              {isSaving ? 'Adding…' : 'Add contribution'}
            </Button>
          </form>
        </Card>
      )}
    </section>
  )
}
