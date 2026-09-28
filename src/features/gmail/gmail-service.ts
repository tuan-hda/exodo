import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { createGmailOAuthClient, createGmailApi, GmailDisconnectedError } from './gmail-api'
import { decryptGoogleToken, encryptGoogleToken } from '@/lib/google/token-encryption'

export const gmailOAuthStateCookie = 'exodo_gmail_oauth_state'

export function createGmailAuthorizationUrl(state: string) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI)
    return null
  return new URL(
    createGmailOAuthClient().generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: true,
      scope: ['https://www.googleapis.com/auth/gmail.readonly'],
      state,
    }),
  )
}

export async function connectGmail(userId: string, code: string) {
  const auth = createGmailOAuthClient()
  const { tokens } = await auth.getToken(code)
  if (!tokens.access_token) throw new Error('Gmail did not return an access token.')
  auth.setCredentials(tokens)
  const { data: profile } = await createGmailApi(auth).users.getProfile({ userId: 'me' }, { timeout: 15_000 })
  const email = profile.emailAddress
  if (!email) throw new Error('Gmail did not return an email address.')
  const supabase = createAdminSupabaseClient()
  const existing = await supabase
    .from('google_connections')
    .select('refresh_token,google_email')
    .eq('user_id', userId)
    .maybeSingle()
  if (existing.error) throw existing.error
  const sameMailbox = existing.data?.google_email === email
  const previousToken = sameMailbox ? existing.data?.refresh_token : null
  const refreshToken = tokens.refresh_token ?? (previousToken ? decryptGoogleToken(previousToken, userId, email) : null)
  if (!refreshToken) throw new Error('Gmail did not return a refresh token.')
  const result = await supabase.from('google_connections').upsert(
    {
      user_id: userId,
      google_email: email,
      refresh_token: encryptGoogleToken(refreshToken, userId, email),
      access_token_expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )
  if (result.error) throw result.error
}

export async function getGmailConnection(userId: string) {
  const { data, error } = await createAdminSupabaseClient()
    .from('google_connections')
    .select('google_email')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data?.google_email ?? null
}

export async function getGmailClient(userId: string) {
  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('google_connections')
    .select('google_email,refresh_token')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  if (!data) throw new GmailDisconnectedError()
  const storedToken: string = data.refresh_token
  const refreshToken = decryptGoogleToken(storedToken, userId, data.google_email)
  const auth = createGmailOAuthClient()
  auth.setCredentials({ refresh_token: refreshToken })
  // The auth library renews credentials and retries authenticated requests.
  const access = await auth.getAccessToken()
  if (!access.token) throw new Error('Gmail did not return an access token.')
  const updated = await supabase
    .from('google_connections')
    .update({
      refresh_token:
        auth.credentials.refresh_token && auth.credentials.refresh_token !== refreshToken
          ? encryptGoogleToken(auth.credentials.refresh_token, userId, data.google_email)
          : storedToken,
      access_token_expires_at: auth.credentials.expiry_date
        ? new Date(auth.credentials.expiry_date).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('google_email', data.google_email)
    .eq('refresh_token', storedToken)
  if (updated.error) throw updated.error
  return createGmailApi(auth)
}
