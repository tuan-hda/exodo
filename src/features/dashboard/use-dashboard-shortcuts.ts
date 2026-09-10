'use client'

import { useEffect } from 'react'
import type { EntryType } from '@/features/entries/types'

function isEditingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  )
}

export function useDashboardShortcuts({
  composerOpen,
  closeComposer,
  openComposer,
  moveMonth,
}: {
  composerOpen: boolean
  closeComposer: () => void
  openComposer: (type: EntryType) => void
  moveMonth: (delta: number) => void
}) {
  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (event.key === 'Escape' && composerOpen) {
        closeComposer()
        return
      }
      if (isEditingTarget(event.target) || composerOpen) return
      if (event.key.toLowerCase() === 'i') {
        event.preventDefault()
        openComposer('income')
        return
      }
      if (event.key.toLowerCase() === 'e' || event.key.toLowerCase() === 'n') {
        event.preventDefault()
        openComposer('expense')
        return
      }
      if (event.key === 'ArrowLeft') moveMonth(-1)
      if (event.key === 'ArrowRight') moveMonth(1)
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [closeComposer, composerOpen, moveMonth, openComposer])
}
