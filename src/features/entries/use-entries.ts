'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSupabase } from '../../hooks/use-supabase'
import type { Entry, StoredEntry } from './types'
import { calculateAccumulation, normalizeStoredEntry, readEntriesCache, writeEntriesCache } from './entry-utils'

export function useEntries(userId?: string) {
  const { getSupabase } = useSupabase()
  const [entries, setEntries] = useState<Entry[]>([])
  const [accumulation, setAccumulation] = useState<number | null>(null)
  const [persistenceError, setPersistenceError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(Boolean(userId))
  const entriesRef = useRef<Entry[]>([])
  const previousUserIdRef = useRef<string | undefined>(userId)

  const fetchEntries = useCallback(async () => {
    const supabase = await getSupabase()
    const { data, error } = await supabase
      .from('entries')
      .select('id, type, amount, occurred_at, title, category')
      .eq('user_id', userId)
      .order('occurred_at', { ascending: false })

    if (error) throw error
    return ((data ?? []) as StoredEntry[]).map(normalizeStoredEntry)
  }, [getSupabase, userId])

  useEffect(() => {
    let cancelled = false
    const userChanged = previousUserIdRef.current !== userId
    previousUserIdRef.current = userId

    if (userChanged) {
      entriesRef.current = []
      setEntries([])
      setAccumulation(null)
    }

    async function loadEntries() {
      if (!userId) {
        setPersistenceError('')
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      const cachedEntries = readEntriesCache(userId)
      if (cachedEntries) {
        entriesRef.current = cachedEntries
        setEntries(cachedEntries)
        setAccumulation(calculateAccumulation(cachedEntries))
      }
      setPersistenceError('')

      try {
        const nextEntries = await fetchEntries()
        if (!cancelled) {
          entriesRef.current = nextEntries
          setEntries(nextEntries)
          writeEntriesCache(userId, nextEntries)
          setAccumulation(calculateAccumulation(nextEntries))
        }
      } catch (error) {
        console.error('Failed to load entries from Supabase', error)
        if (!cancelled) {
          if (!cachedEntries) {
            setEntries([])
            setAccumulation(null)
          }
          setPersistenceError('Could not load your records. Please try again.')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadEntries()
    return () => {
      cancelled = true
    }
  }, [fetchEntries, userId])

  const saveEntry = useCallback(
    async (entry: Entry, isEditing: boolean) => {
      if (!userId) return false
      setPersistenceError('')
      setIsSaving(true)
      try {
        const supabase = await getSupabase()
        const payload = {
          id: entry.id,
          type: entry.type,
          amount: entry.amount,
          occurred_at: entry.occurredAt,
          title: entry.title,
          category: entry.category ?? 'Other',
          user_id: userId,
          updated_at: new Date().toISOString(),
        }
        const result = isEditing
          ? await supabase.from('entries').update(payload).eq('id', entry.id).eq('user_id', userId)
          : await supabase.from('entries').insert(payload)
        if (result.error) throw result.error

        const nextEntries = isEditing
          ? entriesRef.current.map((item) => (item.id === entry.id ? entry : item))
          : [entry, ...entriesRef.current]
        const nextAccumulation = calculateAccumulation(nextEntries)
        entriesRef.current = nextEntries
        setEntries(nextEntries)
        setAccumulation(nextAccumulation)
        writeEntriesCache(userId, nextEntries)
        return true
      } catch (error) {
        console.error('Failed to save entry to Supabase', error)
        setPersistenceError('Could not save this record. Please try again.')
        return false
      } finally {
        setIsSaving(false)
      }
    },
    [getSupabase, userId],
  )

  const removeEntry = useCallback(
    async (id: string) => {
      if (!userId) return
      setPersistenceError('')
      try {
        const supabase = await getSupabase()
        const { error } = await supabase.from('entries').delete().eq('id', id).eq('user_id', userId)
        if (error) throw error
        const nextEntries = entriesRef.current.filter((entry) => entry.id !== id)
        const nextAccumulation = calculateAccumulation(nextEntries)
        entriesRef.current = nextEntries
        setEntries(nextEntries)
        setAccumulation(nextAccumulation)
        writeEntriesCache(userId, nextEntries)
      } catch (error) {
        console.error('Failed to delete entry from Supabase', error)
        setPersistenceError('Could not delete this record. Please try again.')
      }
    },
    [getSupabase, userId],
  )

  const refreshEntries = useCallback(async () => {
    if (!userId) return false
    try {
      const nextEntries = await fetchEntries()
      const nextAccumulation = calculateAccumulation(nextEntries)
      entriesRef.current = nextEntries
      setEntries(nextEntries)
      setAccumulation(nextAccumulation)
      writeEntriesCache(userId, nextEntries)
      setPersistenceError('')
      return true
    } catch (error) {
      console.error('Failed to refresh entries from Supabase', error)
      setPersistenceError('Could not refresh your records. Please try again.')
      return false
    }
  }, [fetchEntries, userId])

  return { entries, accumulation, persistenceError, isLoading, isSaving, saveEntry, removeEntry, refreshEntries }
}
