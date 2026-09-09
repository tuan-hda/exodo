'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSupabase } from '@/hooks/use-supabase'
import { readStorageCache, storageCacheTtl, writeStorageCache } from '@/lib/storage'
import { monthKey } from '@/lib/date'
import type { Entry } from '@/features/entries/types'
import { allocateRemainder, calculateMonthlyRemainder } from './savings-utils'
import { normalizeSavingsIcon } from './savings-icons'
import type { SavingsDeposit, SavingsGoal, StoredSavingsDeposit, StoredSavingsGoal } from './types'

function savingsCacheKey(userId: string) {
  return `exodo.savings.${userId}`
}

function readSavingsCache(userId: string) {
  const cached = readStorageCache<{
    goals?: SavingsGoal[]
    deposits?: SavingsDeposit[]
  }>(savingsCacheKey(userId), storageCacheTtl)
  if (!Array.isArray(cached?.goals) || !Array.isArray(cached.deposits)) return null
  return {
    goals: cached.goals.map((goal) => ({ ...goal, icon: normalizeSavingsIcon(goal.icon) })),
    deposits: cached.deposits,
  }
}

function writeSavingsCache(userId: string, goals: SavingsGoal[], deposits: SavingsDeposit[]) {
  writeStorageCache(savingsCacheKey(userId), { goals, deposits })
}

function normalizeGoalStatus(status: string): SavingsGoal['status'] {
  if (status === 'paused' || status === 'completed') return status
  return 'active'
}

function normalizeGoal(goal: StoredSavingsGoal): SavingsGoal {
  return {
    id: goal.id,
    name: goal.name,
    targetAmount: Number(goal.target_amount),
    savedAmount: Number(goal.saved_amount),
    targetDate: goal.target_date,
    icon: normalizeSavingsIcon(goal.icon),
    priority: goal.priority,
    status: normalizeGoalStatus(goal.status),
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
  const [isLoading, setIsLoading] = useState(Boolean(userId))
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const goalsRef = useRef<SavingsGoal[]>([])
  const depositsRef = useRef<SavingsDeposit[]>([])
  const previousUserIdRef = useRef<string | undefined>(userId)

  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      if (!userId) {
        goalsRef.current = []
        depositsRef.current = []
        setGoals([])
        setDeposits([])
        setError('')
        setIsLoading(false)
        return
      }
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
        if (signal?.aborted) return
        const nextGoals = ((goalResult.data ?? []) as StoredSavingsGoal[]).map(normalizeGoal)
        const nextDeposits = ((depositResult.data ?? []) as StoredSavingsDeposit[]).map(normalizeDeposit)
        goalsRef.current = nextGoals
        depositsRef.current = nextDeposits
        setGoals(nextGoals)
        setDeposits(nextDeposits)
        writeSavingsCache(userId, nextGoals, nextDeposits)
      } catch (loadError) {
        if (signal?.aborted) return
        console.error('Failed to load savings goals', loadError)
        setError('Could not load savings goals. Run the savings migration first.')
      } finally {
        if (!signal?.aborted) setIsLoading(false)
      }
    },
    [getSupabase, userId],
  )

  useEffect(() => {
    const controller = new AbortController()
    const userChanged = previousUserIdRef.current !== userId
    previousUserIdRef.current = userId
    if (userChanged) {
      goalsRef.current = []
      depositsRef.current = []
      setGoals([])
      setDeposits([])
      setError('')
    }
    if (userId) {
      const cachedSavings = readSavingsCache(userId)
      if (cachedSavings) {
        goalsRef.current = cachedSavings.goals
        depositsRef.current = cachedSavings.deposits
        setGoals(cachedSavings.goals)
        setDeposits(cachedSavings.deposits)
      }
    }
    void refresh(controller.signal)
    return () => controller.abort()
  }, [refresh])

  const saveGoal = useCallback(
    async (goal: Omit<SavingsGoal, 'id' | 'savedAmount' | 'priority'> & { id?: string }) => {
      if (!userId || !goal.name.trim() || goal.targetAmount <= 0) return false
      setIsSaving(true)
      setError('')
      try {
        const supabase = await getSupabase()
        const currentGoals = goalsRef.current
        const payload = {
          ...(goal.id ? { id: goal.id } : {}),
          user_id: userId,
          name: goal.name.trim(),
          target_amount: goal.targetAmount,
          target_date: goal.targetDate || null,
          icon: goal.icon,
          status: goal.status,
          priority: goal.id
            ? (currentGoals.find((item) => item.id === goal.id)?.priority ?? currentGoals.length)
            : currentGoals.length,
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
    [getSupabase, refresh, userId],
  )

  const addDeposit = useCallback(
    async (goalId: string, amount: number, note = '') => {
      if (!userId || !Number.isFinite(amount) || amount <= 0) return false
      const currentGoals = goalsRef.current
      const currentDeposits = depositsRef.current
      const goal = currentGoals.find((item) => item.id === goalId)
      if (!goal) return false
      setIsSaving(true)
      setError('')
      try {
        const supabase = await getSupabase()
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
        const nextGoals = currentGoals.map((item) =>
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
          ...currentDeposits,
        ]
        goalsRef.current = nextGoals
        depositsRef.current = nextDeposits
        setGoals(nextGoals)
        setDeposits(nextDeposits)
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
    [getSupabase, refresh, userId],
  )

  const syncAutomaticRemainder = useCallback(async () => {
    const currentGoals = goalsRef.current
    const currentDeposits = depositsRef.current
    if (!userId || !currentGoals.length) return
    const remainder = calculateMonthlyRemainder(entries)
    const allocations = allocateRemainder(currentGoals, remainder)
    if (!allocations.length) return
    const currentMonth = monthKey()
    const supabase = await getSupabase()
    let changed = false
    for (const allocation of allocations) {
      const existing = currentDeposits.find(
        (deposit) =>
          deposit.goalId === allocation.goalId && deposit.monthKey === currentMonth && deposit.source === 'automatic',
      )
      const goal = currentGoals.find((item) => item.id === allocation.goalId)
      if (!goal) continue
      const amount = Math.round(allocation.amount * 100) / 100
      if (existing) {
        const delta = amount - existing.amount
        if (Math.abs(delta) < 0.01) continue
        const depositResult = await supabase
          .from('savings_deposits')
          .update({ amount })
          .eq('id', existing.id)
          .eq('user_id', userId)
        if (depositResult.error) throw depositResult.error
        const goalResult = await supabase
          .from('savings_goals')
          .update({ saved_amount: Math.max(0, goal.savedAmount + delta) })
          .eq('id', goal.id)
          .eq('user_id', userId)
        if (goalResult.error) throw goalResult.error
        changed = true
      } else {
        const depositResult = await supabase.from('savings_deposits').insert({
          user_id: userId,
          goal_id: goal.id,
          amount,
          occurred_at: new Date().toISOString(),
          source: 'automatic',
          month_key: currentMonth,
          note: 'Monthly remainder',
        })
        if (depositResult.error) throw depositResult.error
        const goalResult = await supabase
          .from('savings_goals')
          .update({ saved_amount: goal.savedAmount + amount })
          .eq('id', goal.id)
          .eq('user_id', userId)
        if (goalResult.error) throw goalResult.error
        changed = true
      }
    }
    if (changed) await refresh()
  }, [entries, getSupabase, refresh, userId])

  useEffect(() => {
    if (isLoading || !goals.length) return
    syncAutomaticRemainder().catch((syncError) => {
      console.error('Failed to sync automatic savings remainder', syncError)
      setError('Could not update automatic savings.')
    })
  }, [goals.length, isLoading, syncAutomaticRemainder])
  return { goals, deposits, isLoading, isSaving, error, saveGoal, addDeposit, refresh }
}
