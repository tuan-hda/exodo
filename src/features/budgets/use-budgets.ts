'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSupabase } from '@/hooks/use-supabase'
import { readStorageCache, storageCacheTtl, writeStorageCache } from '@/lib/storage'
import type { Category } from '@/features/finance/category'
import { normalizeBudget } from './budget-utils'
import type { CategoryBudget } from './types'

function budgetCacheKey(userId: string) {
  return `exodo.budgets.${userId}`
}

function readBudgetCache(userId: string) {
  const cached = readStorageCache<{ budgets?: unknown }>(budgetCacheKey(userId), storageCacheTtl)
  if (!Array.isArray(cached?.budgets)) return null
  return cached.budgets.flatMap((budget) => {
    const normalized = normalizeBudget(budget)
    return normalized ? [normalized] : []
  })
}

function writeBudgetCache(userId: string, budgets: CategoryBudget[]) {
  writeStorageCache(budgetCacheKey(userId), { budgets })
}

export function useBudgets(userId: string | undefined) {
  const { getSupabase } = useSupabase()
  const [budgets, setBudgets] = useState<CategoryBudget[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(userId))
  const [isSaving, setIsSaving] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [error, setError] = useState('')
  const budgetsRef = useRef<CategoryBudget[]>([])
  const previousUserIdRef = useRef<string | undefined>(userId)

  const fetchBudgets = useCallback(async () => {
    const supabase = await getSupabase()
    const { data, error: fetchError } = await supabase
      .from('category_budgets')
      .select('id, category, amount')
      .eq('user_id', userId)
      .order('category')

    if (fetchError) throw fetchError
    return (data ?? []).flatMap((budget) => {
      const normalized = normalizeBudget(budget)
      return normalized ? [normalized] : []
    })
  }, [getSupabase, userId])

  const refreshBudgets = useCallback(
    async (signal?: AbortSignal, showLoading = true) => {
      if (!userId) {
        budgetsRef.current = []
        setBudgets([])
        setError('')
        setIsLoading(false)
        return false
      }
      if (showLoading) setIsLoading(true)
      setError('')
      try {
        const nextBudgets = await fetchBudgets()
        if (signal?.aborted) return false
        budgetsRef.current = nextBudgets
        setBudgets(nextBudgets)
        writeBudgetCache(userId, nextBudgets)
        return true
      } catch (fetchError) {
        if (signal?.aborted) return false
        console.error('Failed to load category budgets from Supabase', fetchError)
        setError('Could not load category budgets. Run the budget migration first.')
        return false
      } finally {
        if (!signal?.aborted && showLoading) setIsLoading(false)
      }
    },
    [fetchBudgets, userId],
  )

  useEffect(() => {
    const controller = new AbortController()
    const userChanged = previousUserIdRef.current !== userId
    previousUserIdRef.current = userId
    if (userChanged) {
      budgetsRef.current = []
      setBudgets([])
      setError('')
    }
    if (userId) {
      const cachedBudgets = readBudgetCache(userId)
      if (cachedBudgets) {
        budgetsRef.current = cachedBudgets
        setBudgets(cachedBudgets)
        setIsLoading(false)
      }
      void refreshBudgets(controller.signal, !cachedBudgets)
    } else {
      void refreshBudgets(controller.signal)
    }
    return () => controller.abort()
  }, [refreshBudgets])

  const saveBudget = useCallback(
    async (category: Category, amount: number) => {
      if (!userId || !Number.isFinite(amount) || amount <= 0) return false
      setIsSaving(true)
      setError('')
      try {
        const supabase = await getSupabase()
        const { data, error: saveError } = await supabase
          .from('category_budgets')
          .upsert(
            { user_id: userId, category, amount, updated_at: new Date().toISOString() },
            { onConflict: 'user_id,category' },
          )
          .select('id, category, amount')
          .single()
        if (saveError) throw saveError
        const nextBudget = normalizeBudget(data)
        if (!nextBudget) throw new Error('Supabase returned an invalid category budget.')
        const nextBudgets = [...budgetsRef.current.filter((budget) => budget.category !== category), nextBudget].sort(
          (a, b) => a.category.localeCompare(b.category),
        )
        budgetsRef.current = nextBudgets
        setBudgets(nextBudgets)
        writeBudgetCache(userId, nextBudgets)
        return true
      } catch (saveError) {
        console.error('Failed to save category budget to Supabase', saveError)
        setError('Could not save this budget. Run the budget migration first.')
        return false
      } finally {
        setIsSaving(false)
      }
    },
    [getSupabase, userId],
  )

  const removeBudget = useCallback(
    async (budget: CategoryBudget) => {
      if (!userId) return false
      setIsRemoving(true)
      setError('')
      try {
        const supabase = await getSupabase()
        const { error: removeError } = await supabase
          .from('category_budgets')
          .delete()
          .eq('id', budget.id)
          .eq('user_id', userId)
        if (removeError) throw removeError
        const nextBudgets = budgetsRef.current.filter((item) => item.id !== budget.id)
        budgetsRef.current = nextBudgets
        setBudgets(nextBudgets)
        writeBudgetCache(userId, nextBudgets)
        return true
      } catch (removeError) {
        console.error('Failed to remove category budget from Supabase', removeError)
        setError('Could not remove this budget.')
        return false
      } finally {
        setIsRemoving(false)
      }
    },
    [getSupabase, userId],
  )

  return { budgets, isLoading, isSaving, isRemoving, error, saveBudget, removeBudget, refreshBudgets }
}

export type BudgetState = ReturnType<typeof useBudgets>
