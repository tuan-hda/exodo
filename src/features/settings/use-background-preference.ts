'use client'

import { useEffect, useState } from 'react'

const backgroundPreferenceKey = 'exodo.gradient-background-enabled'
const backgroundPreferenceEvent = 'exodo:gradient-background-changed'

function readPreference() {
  if (typeof window === 'undefined') return true
  return window.localStorage.getItem(backgroundPreferenceKey) !== 'false'
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
    window.localStorage.setItem(backgroundPreferenceKey, String(nextEnabled))
    setEnabled(nextEnabled)
    window.dispatchEvent(new Event(backgroundPreferenceEvent))
  }

  return { enabled, setEnabled: updatePreference }
}
