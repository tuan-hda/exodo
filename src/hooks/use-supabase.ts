'use client'

import { useSession } from '@clerk/nextjs'
import { useMemo } from 'react'
import { createClerkSupabaseClient } from '../lib/supabase'

export function useSupabase() {
  const { session } = useSession()

  return useMemo(
    () => ({
      getSupabase: async () => createClerkSupabaseClient(async () => (await session?.getToken()) ?? null),
    }),
    [session],
  )
}
