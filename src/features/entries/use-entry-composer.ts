'use client'

import { useCallback, useState } from 'react'
import type { Entry, EntryType } from './types'

type EntryComposerOptions = {
  saveEntry: (entry: Entry, isEditing: boolean) => Promise<boolean>
  removeEntry: (id: string) => Promise<boolean>
}

export function useEntryComposer({ saveEntry, removeEntry }: EntryComposerOptions) {
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState<EntryType>('expense')
  const [entry, setEntry] = useState<Entry | undefined>()

  const open = useCallback((nextType: EntryType, nextEntry?: Entry) => {
    setType(nextType)
    setEntry(nextEntry)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setEntry(undefined)
  }, [])

  const save = useCallback(
    async (nextEntry: Entry) => {
      const saved = await saveEntry(nextEntry, Boolean(entry))
      if (saved) close()
      return saved
    },
    [close, entry, saveEntry],
  )

  const remove = useCallback(async () => {
    if (!entry) return false
    const removed = await removeEntry(entry.id)
    if (removed) close()
    return removed
  }, [close, entry, removeEntry])

  return { isOpen, type, entry, open, close, save, remove, setType }
}
