'use client'

import { useSession } from '@clerk/nextjs'
import type { SupabaseClient } from '@supabase/supabase-js'
import { useCallback } from 'react'
import { createClerkSupabaseClient } from '@/lib/supabase'

let cachedSessionId: string | null | undefined
let cachedClient: SupabaseClient | null = null

export function useSupabase() {
  const { session } = useSession()
  const sessionId = session?.id ?? null

  const getSupabase = useCallback(async () => {
    if (!cachedClient || cachedSessionId !== sessionId) {
      cachedSessionId = sessionId
      const currentSession = session
      cachedClient = createClerkSupabaseClient(async () => (await currentSession?.getToken()) ?? null)
    }
    return cachedClient
  }, [session, sessionId])

  return { getSupabase }
}
