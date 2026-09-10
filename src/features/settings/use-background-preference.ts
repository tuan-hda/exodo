'use client'

import { useEffect, useState } from 'react'
import { readStorageValue, writeStorageValue } from '@/lib/storage'

const backgroundPreferenceKey = 'exodo.gradient-background-enabled'
const backgroundPreferenceEvent = 'exodo:gradient-background-changed'

function readPreference() {
  if (typeof window === 'undefined') return true
  return readStorageValue(backgroundPreferenceKey) !== 'false'
}

export function useBackgroundPreference() {
  const [enabled, setEnabled] = useState(readPreference)

  useEffect(() => {
    function syncPreference() {
      const nextEnabled = readPreference()
      setEnabled(nextEnabled)
      document.body.classList.toggle('plain-background', !nextEnabled)
    }
    syncPreference()
    window.addEventListener(backgroundPreferenceEvent, syncPreference)
    return () => window.removeEventListener(backgroundPreferenceEvent, syncPreference)
  }, [])

  function updatePreference(nextEnabled: boolean) {
    writeStorageValue(backgroundPreferenceKey, String(nextEnabled))
    setEnabled(nextEnabled)
    window.dispatchEvent(new Event(backgroundPreferenceEvent))
  }

  return { enabled, setEnabled: updatePreference }
}

export type BackgroundPreferenceState = ReturnType<typeof useBackgroundPreference>
