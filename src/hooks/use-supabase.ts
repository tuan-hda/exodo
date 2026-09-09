'use client'

import { useSession } from '@clerk/nextjs'
import type { SupabaseClient } from '@supabase/supabase-js'
import { useCallback, useRef } from 'react'
import { createClerkSupabaseClient } from '@/lib/supabase'

export function useSupabase() {
  const { session } = useSession()
  const sessionId = session?.id ?? null
  const sessionRef = useRef(session)
  const clientRef = useRef<SupabaseClient | null>(null)
  const clientSessionIdRef = useRef<string | null | undefined>(undefined)
  sessionRef.current = session

  const getSupabase = useCallback(async () => {
    if (!clientRef.current || clientSessionIdRef.current !== sessionId) {
      clientSessionIdRef.current = sessionId
      clientRef.current = createClerkSupabaseClient(async () => (await sessionRef.current?.getToken()) ?? null)
    }
    return clientRef.current
  }, [sessionId])

  return { getSupabase }
}
