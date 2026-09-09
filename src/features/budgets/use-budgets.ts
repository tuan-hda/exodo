'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSupabase } from '@/hooks/use-supabase'
import { readStorageJson, writeStorageJson } from '@/lib/storage'
import type { Category } from '@/features/entries/category'
import type { CategoryBudget, StoredCategoryBudget } from './types'

const budgetCacheTtl = 24 * 60 * 60 * 1000

function budgetCacheKey(userId: string) {
  return `exodo.budgets.${userId}`
}

function readBudgetCache(userId: string) {
  const cached = readStorageJson<{ budgets?: CategoryBudget[]; cachedAt?: number }>(budgetCacheKey(userId))
  if (
    !Array.isArray(cached?.budgets) ||
    typeof cached.cachedAt !== 'number' ||
    !Number.isFinite(cached.cachedAt) ||
    Date.now() - cached.cachedAt > budgetCacheTtl
  )
    return null
  return cached.budgets
}

function writeBudgetCache(userId: string, budgets: CategoryBudget[]) {
  writeStorageJson(budgetCacheKey(userId), { budgets, cachedAt: Date.now() })
}

function normalizeBudget(budget: StoredCategoryBudget): CategoryBudget {
  return {
    id: budget.id,
    category: budget.category as Category,
    amount: Number(budget.amount),
  }
}

export function useBudgets(userId: string | undefined) {
  const { getSupabase } = useSupabase()
  const [budgets, setBudgets] = useState<CategoryBudget[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(userId))
  const [isSaving, setIsSaving] = useState(false)
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
    return ((data ?? []) as StoredCategoryBudget[]).map(normalizeBudget)
  }, [getSupabase, userId])

  const refreshBudgets = useCallback(
    async (signal?: AbortSignal) => {
      if (!userId) {
        budgetsRef.current = []
        setBudgets([])
        setError('')
        setIsLoading(false)
        return false
      }
      setIsLoading(true)
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
        if (!signal?.aborted) setIsLoading(false)
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
      }
    }
    void refreshBudgets(controller.signal)
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
        const nextBudget = normalizeBudget(data as StoredCategoryBudget)
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
      }
    },
    [getSupabase, userId],
  )

  return { budgets, isLoading, isSaving, error, saveBudget, removeBudget, refreshBudgets }
}
