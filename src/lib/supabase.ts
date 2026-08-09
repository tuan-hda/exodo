import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

export function createClerkSupabaseClient(accessToken: () => Promise<string | null>) {
  return createClient(supabaseUrl, supabasePublishableKey, {
    global: {
      fetch: async (url, options = {}) => {
        const token = await accessToken()
        const headers = new Headers(options.headers)
        if (token) headers.set('Authorization', `Bearer ${token}`)
        return fetch(url, { ...options, headers })
      },
    },
  })
}
