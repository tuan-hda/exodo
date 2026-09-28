import { gmail } from '@googleapis/gmail'
import { OAuth2Client } from 'google-auth-library'
import { isRecord } from '@/lib/guards'

export class GmailDisconnectedError extends Error {
  constructor() {
    super('Connect Gmail to read your emails.')
  }
}

export function createGmailOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI
  if (!clientId || !clientSecret || !redirectUri) throw new Error('Gmail OAuth is not configured.')
  return new OAuth2Client({ clientId, clientSecret, redirectUri, transporterOptions: { timeout: 15_000 } })
}

export function createGmailApi(auth: OAuth2Client) {
  return gmail({ version: 'v1', auth })
}

export function gmailErrorStatus(error: unknown) {
  return isRecord(error) && isRecord(error.response) && typeof error.response.status === 'number'
    ? error.response.status
    : null
}

export function isGmailGrantExpired(error: unknown) {
  if (!isRecord(error) || !isRecord(error.response) || !isRecord(error.response.data)) return false
  return error.response.data.error === 'invalid_grant'
}

export function gmailErrorLogDetails(error: unknown) {
  const upstreamStatus = gmailErrorStatus(error)
  const status =
    upstreamStatus !== null && Number.isInteger(upstreamStatus) && upstreamStatus >= 100 && upstreamStatus <= 599
      ? upstreamStatus
      : null
  const category = isGmailGrantExpired(error)
    ? 'oauth_grant_expired'
    : status !== null
      ? 'upstream_error'
      : 'application_error'
  return { category, status }
}
