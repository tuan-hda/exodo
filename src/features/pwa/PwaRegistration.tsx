'use client'

import { useEffect } from 'react'

export function PwaRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    if (process.env.NODE_ENV !== 'production') {
      void navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations
          .filter((registration) => {
            const worker = registration.active ?? registration.installing ?? registration.waiting
            return worker?.scriptURL === `${window.location.origin}/sw.js`
          })
          .forEach((registration) => void registration.unregister())
      })
      return
    }

    void navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(() => undefined)
  }, [])

  return null
}
