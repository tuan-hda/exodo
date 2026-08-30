import { createAdminSupabaseClient } from '../../lib/supabase-admin'

export const gmailOAuthStateCookie = 'exodo_gmail_oauth_state'

type GmailTokens = {
  access_token?: string
  refresh_token?: string
  expires_in?: number
}

function getGmailOAuthConfig() {
  const clientId = process.env.GMAIL_CLIENT_ID
  const clientSecret = process.env.GMAIL_CLIENT_SECRET
  const redirectUri = process.env.GMAIL_REDIRECT_URI
  if (!clientId || !redirectUri) return null
  return { clientId, clientSecret, redirectUri }
}

export function createGmailAuthorizationUrl(state: string) {
  const config = getGmailOAuthConfig()
  if (!config) return null

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', config.clientId)
  url.searchParams.set('redirect_uri', config.redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('access_type', 'offline')
  url.searchParams.set('prompt', 'consent')
  url.searchParams.set('include_granted_scopes', 'true')
  url.searchParams.set('scope', 'https://www.googleapis.com/auth/gmail.readonly')
  url.searchParams.set('state', state)
  return url
}

async function exchangeCode(code: string) {
  const config = getGmailOAuthConfig()
  if (!config?.clientSecret) throw new Error('Gmail OAuth is not configured.')

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
    }),
  })
  if (!response.ok) throw new Error('Gmail token exchange failed.')

  const tokens = (await response.json()) as GmailTokens
  if (!tokens.access_token) throw new Error('Gmail did not return an access token.')
  return tokens
}

async function getGmailEmail(accessToken: string) {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) throw new Error('Gmail profile lookup failed.')

  const profile = (await response.json()) as { email?: string }
  if (!profile.email) throw new Error('Gmail did not return an email address.')
  return profile.email
}

export async function connectGmail(userId: string, code: string) {
  const tokens = await exchangeCode(code)
  const email = await getGmailEmail(tokens.access_token as string)
  const supabase = createAdminSupabaseClient()
  const existing = await supabase.from('gmail_connections').select('refresh_token').eq('user_id', userId).maybeSingle()
  if (existing.error) throw existing.error

  const result = await supabase.from('gmail_connections').upsert(
    {
      user_id: userId,
      gmail_email: email,
      refresh_token: tokens.refresh_token ?? existing.data?.refresh_token,
      access_token_expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )
  if (result.error || (!tokens.refresh_token && !existing.data?.refresh_token)) {
    throw result.error ?? new Error('Gmail did not return a refresh token.')
  }
}

export async function getGmailConnection(userId: string) {
  const { data, error } = await createAdminSupabaseClient()
    .from('gmail_connections')
    .select('gmail_email')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data?.gmail_email ?? null
}
