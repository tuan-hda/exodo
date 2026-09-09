'use client'

import { useState, type FormEvent } from 'react'
import { Plus, X } from '@phosphor-icons/react'
import EmojiPicker from 'emoji-picker-react'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { EmptyState } from '../../components/EmptyState'
import { PageHeader } from '../../components/PageHeader'
import { StateMessage } from '../../components/StateMessage'
import { Input } from '../../components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover'
import type { Entry } from '../entries/types'
import { formatShort } from '../entries/entry-utils'
import { SavingsDepositComposer } from './SavingsDepositComposer'
import { SavingsGoalCard } from './SavingsGoalCard'
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
      setIcon('✈️')
      setEmojiPickerOpen(false)
      setShowForm(false)
    }
  }
  return (
    <section className="mx-auto grid max-w-[760px] gap-8 pb-12 animate-[page-rise_.55s_cubic-bezier(.16,1,.3,1)_both]">
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
      <div className="grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
        <Card tone="soft" className="p-5">
          <p className="ui-eyebrow m-0">Saved</p>
          <strong className="ui-number mt-2 block text-2xl font-semibold">{formatShort(summary.saved)}</strong>
        </Card>
        <Card tone="soft" className="p-5">
          <p className="ui-eyebrow m-0">Target</p>
          <strong className="ui-number mt-2 block text-2xl font-semibold">{formatShort(summary.target)}</strong>
        </Card>
      </div>
      {showForm && (
        <Card className="p-5">
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
