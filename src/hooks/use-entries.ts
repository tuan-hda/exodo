'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSupabase } from './use-supabase'
import type { Entry, StoredEntry } from '../types/entry'
import {
  calculateAccumulation,
  invalidateAccumulationCache,
  normalizeStoredEntry,
  readAccumulationCache,
  readEntriesCache,
  writeAccumulationCache,
  writeEntriesCache,
} from '../lib/entry-utils'

export function useEntries(userId?: string) {
  const { getSupabase } = useSupabase()
  const [entries, setEntries] = useState<Entry[]>([])
  const [accumulation, setAccumulation] = useState<number | null>(null)
  const [persistenceError, setPersistenceError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null)

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

    async function loadEntries() {
      if (!userId) return
      const cachedEntries = readEntriesCache(userId)
      if (cachedEntries) {
        setEntries(cachedEntries)
        setAccumulation(calculateAccumulation(cachedEntries))
      }
      setPersistenceError('')

      try {
        const nextEntries = await fetchEntries()
        if (!cancelled) {
          setEntries(nextEntries)
          writeEntriesCache(userId, nextEntries)
          const cachedAccumulation = readAccumulationCache(userId)
          if (cachedAccumulation === null) {
            const nextAccumulation = calculateAccumulation(nextEntries)
            setAccumulation(nextAccumulation)
            writeAccumulationCache(userId, nextAccumulation)
          } else {
            setAccumulation(cachedAccumulation)
          }
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
          ? entries.map((item) => (item.id === entry.id ? entry : item))
          : [entry, ...entries]
        invalidateAccumulationCache(userId)
        const nextAccumulation = calculateAccumulation(nextEntries)
        setEntries(nextEntries)
        setAccumulation(nextAccumulation)
        writeEntriesCache(userId, nextEntries)
        writeAccumulationCache(userId, nextAccumulation)
        return true
      } catch (error) {
        console.error('Failed to save entry to Supabase', error)
        setPersistenceError('Could not save this record. Please try again.')
        return false
      } finally {
        setIsSaving(false)
      }
    },
    [entries, getSupabase, userId],
  )

  const removeEntry = useCallback(
    async (id: string) => {
      if (!userId) return
      setPersistenceError('')
      setDeletingEntryId(id)
      try {
        const supabase = await getSupabase()
        const { error } = await supabase.from('entries').delete().eq('id', id).eq('user_id', userId)
        if (error) throw error
        const nextEntries = entries.filter((entry) => entry.id !== id)
        invalidateAccumulationCache(userId)
        const nextAccumulation = calculateAccumulation(nextEntries)
        setEntries(nextEntries)
        setAccumulation(nextAccumulation)
        writeEntriesCache(userId, nextEntries)
        writeAccumulationCache(userId, nextAccumulation)
      } catch (error) {
        console.error('Failed to delete entry from Supabase', error)
        setPersistenceError('Could not delete this record. Please try again.')
      } finally {
        setDeletingEntryId(null)
      }
    },
    [entries, getSupabase, userId],
  )

  const refreshEntries = useCallback(async () => {
    if (!userId) return false
    try {
      const nextEntries = await fetchEntries()
      const nextAccumulation = calculateAccumulation(nextEntries)
      setEntries(nextEntries)
      setAccumulation(nextAccumulation)
      writeEntriesCache(userId, nextEntries)
      writeAccumulationCache(userId, nextAccumulation)
      setPersistenceError('')
      return true
    } catch (error) {
      console.error('Failed to refresh entries from Supabase', error)
      setPersistenceError('Could not refresh your records. Please try again.')
      return false
    }
  }, [fetchEntries, userId])

  return { entries, accumulation, persistenceError, isSaving, deletingEntryId, saveEntry, removeEntry, refreshEntries }
}
