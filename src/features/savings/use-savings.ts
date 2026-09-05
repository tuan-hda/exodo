'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSupabase } from '../../hooks/use-supabase'
import type { Entry } from '../entries/types'
import { allocateRemainder, calculateMonthlyRemainder, monthKey } from './savings-utils'
import type { SavingsDeposit, SavingsGoal, StoredSavingsDeposit, StoredSavingsGoal } from './types'

const savingsCacheTtl = 24 * 60 * 60 * 1000

function savingsCacheKey(userId: string) {
  return `exodo.savings.${userId}`
}

function readSavingsCache(userId: string) {
  try {
    const cached = JSON.parse(localStorage.getItem(savingsCacheKey(userId)) ?? 'null') as {
      goals?: SavingsGoal[]
      deposits?: SavingsDeposit[]
      cachedAt?: number
    } | null
    if (!cached?.goals || !cached.deposits || !cached.cachedAt || Date.now() - cached.cachedAt > savingsCacheTtl)
      return null
    return { goals: cached.goals, deposits: cached.deposits }
  } catch {
    return null
  }
}

function writeSavingsCache(userId: string, goals: SavingsGoal[], deposits: SavingsDeposit[]) {
  localStorage.setItem(savingsCacheKey(userId), JSON.stringify({ goals, deposits, cachedAt: Date.now() }))
}

function normalizeGoal(goal: StoredSavingsGoal): SavingsGoal {
  return {
    id: goal.id,
    name: goal.name,
    targetAmount: Number(goal.target_amount),
    savedAmount: Number(goal.saved_amount),
    targetDate: goal.target_date,
    icon: goal.icon,
    priority: goal.priority,
    status: goal.status,
  }
}
function normalizeDeposit(deposit: StoredSavingsDeposit): SavingsDeposit {
  return {
    id: deposit.id,
    goalId: deposit.goal_id,
    amount: Number(deposit.amount),
    occurredAt: deposit.occurred_at,
    source: deposit.source,
    monthKey: deposit.month_key,
    note: deposit.note,
  }
}

export function useSavings(userId: string | undefined, entries: Entry[]) {
  const { getSupabase } = useSupabase()
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [deposits, setDeposits] = useState<SavingsDeposit[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    setError('')
    try {
      const supabase = await getSupabase()
      const [goalResult, depositResult] = await Promise.all([
        supabase
          .from('savings_goals')
          .select('id,name,target_amount,saved_amount,target_date,icon,priority,status')
          .eq('user_id', userId)
          .order('priority'),
        supabase
          .from('savings_deposits')
          .select('id,goal_id,amount,occurred_at,source,month_key,note')
          .eq('user_id', userId)
          .order('occurred_at', { ascending: false }),
      ])
      if (goalResult.error) throw goalResult.error
      if (depositResult.error) throw depositResult.error
      const nextGoals = ((goalResult.data ?? []) as StoredSavingsGoal[]).map(normalizeGoal)
      const nextDeposits = ((depositResult.data ?? []) as StoredSavingsDeposit[]).map(normalizeDeposit)
      setGoals(nextGoals)
      setDeposits(nextDeposits)
      writeSavingsCache(userId, nextGoals, nextDeposits)
    } catch (loadError) {
      console.error('Failed to load savings goals', loadError)
      setError('Could not load savings goals. Run the savings migration first.')
    } finally {
      setIsLoading(false)
    }
  }, [getSupabase, userId])

  useEffect(() => {
    if (userId) {
      const cachedSavings = readSavingsCache(userId)
      if (cachedSavings) {
        setGoals(cachedSavings.goals)
        setDeposits(cachedSavings.deposits)
      }
    }
    refresh()
  }, [refresh])

  const saveGoal = useCallback(
    async (goal: Omit<SavingsGoal, 'id' | 'savedAmount' | 'priority'> & { id?: string }) => {
      if (!userId || !goal.name.trim() || goal.targetAmount <= 0) return false
      setIsSaving(true)
      setError('')
      try {
        const supabase = await getSupabase()
        const payload = {
          ...(goal.id ? { id: goal.id } : {}),
          user_id: userId,
          name: goal.name.trim(),
          target_amount: goal.targetAmount,
          target_date: goal.targetDate || null,
          icon: goal.icon,
          status: goal.status,
          priority: goal.id ? (goals.find((item) => item.id === goal.id)?.priority ?? goals.length) : goals.length,
        }
        const { error: saveError } = await supabase.from('savings_goals').upsert(payload)
        if (saveError) throw saveError
        await refresh()
        return true
      } catch (saveError) {
        console.error('Failed to save savings goal', saveError)
        setError('Could not save this goal.')
        return false
      } finally {
        setIsSaving(false)
      }
    },
    [getSupabase, goals, refresh, userId],
  )

  const addDeposit = useCallback(
    async (goalId: string, amount: number, note = '') => {
      if (!userId || !Number.isFinite(amount) || amount <= 0) return false
      setIsSaving(true)
      setError('')
      try {
        const supabase = await getSupabase()
        const goal = goals.find((item) => item.id === goalId)
        if (!goal) return false
        const { error: depositError } = await supabase.from('savings_deposits').insert({
          user_id: userId,
          goal_id: goalId,
          amount,
          occurred_at: new Date().toISOString(),
          source: 'manual',
          note: note || null,
        })
        if (depositError) throw depositError
        const { error: goalError } = await supabase
          .from('savings_goals')
          .update({ saved_amount: goal.savedAmount + amount })
          .eq('id', goalId)
          .eq('user_id', userId)
        if (goalError) throw goalError
        const nextGoals = goals.map((item) =>
          item.id === goalId ? { ...item, savedAmount: item.savedAmount + amount } : item,
        )
        const nextDeposits = [
          {
            id: `pending-${Date.now()}`,
            goalId,
            amount,
            occurredAt: new Date().toISOString(),
            source: 'manual' as const,
            monthKey: null,
            note: note || null,
          },
          ...deposits,
        ]
        writeSavingsCache(userId, nextGoals, nextDeposits)
        await refresh()
        return true
      } catch (depositError) {
        console.error('Failed to add savings deposit', depositError)
        setError('Could not add this deposit.')
        return false
      } finally {
        setIsSaving(false)
      }
    },
    [getSupabase, goals, refresh, userId],
  )

  const syncAutomaticRemainder = useCallback(async () => {
    if (!userId || !goals.length) return
    const remainder = calculateMonthlyRemainder(entries)
    const allocations = allocateRemainder(goals, remainder)
    if (!allocations.length) return
    const currentMonth = monthKey()
    const supabase = await getSupabase()
    let changed = false
    for (const allocation of allocations) {
      const existing = deposits.find(
        (deposit) =>
          deposit.goalId === allocation.goalId && deposit.monthKey === currentMonth && deposit.source === 'automatic',
      )
      const goal = goals.find((item) => item.id === allocation.goalId)
      if (!goal) continue
      const amount = Math.round(allocation.amount * 100) / 100
      if (existing) {
        const delta = amount - existing.amount
        if (Math.abs(delta) < 0.01) continue
        await supabase.from('savings_deposits').update({ amount }).eq('id', existing.id).eq('user_id', userId)
        await supabase
          .from('savings_goals')
          .update({ saved_amount: Math.max(0, goal.savedAmount + delta) })
          .eq('id', goal.id)
          .eq('user_id', userId)
        changed = true
      } else {
        await supabase.from('savings_deposits').insert({
          user_id: userId,
          goal_id: goal.id,
          amount,
          occurred_at: new Date().toISOString(),
          source: 'automatic',
          month_key: currentMonth,
          note: 'Monthly remainder',
        })
        await supabase
          .from('savings_goals')
          .update({ saved_amount: goal.savedAmount + amount })
          .eq('id', goal.id)
          .eq('user_id', userId)
        changed = true
      }
    }
    if (changed) await refresh()
  }, [deposits, entries, getSupabase, goals, refresh, userId])

  useEffect(() => {
    syncAutomaticRemainder().catch((syncError) =>
      console.error('Failed to sync automatic savings remainder', syncError),
    )
  }, [syncAutomaticRemainder])
  return { goals, deposits, isLoading, isSaving, error, saveGoal, addDeposit, refresh }
}
