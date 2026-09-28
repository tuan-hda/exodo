import { isRecord } from '@/lib/guards'

export type GmailMessageSummary = {
  id: string
  sender: string
  subject: string
  snippet: string
  receivedAt: string
  unread: boolean
}

export type GmailMessage = GmailMessageSummary & { recipient: string; body: string }
export type GmailMessagePage = { messages: GmailMessageSummary[]; nextPageToken: string | null }

function isMessageSummary(value: unknown): value is GmailMessageSummary {
  return (
    isRecord(value) &&
    ['id', 'sender', 'subject', 'snippet', 'receivedAt'].every((key) => typeof value[key] === 'string') &&
    typeof value.unread === 'boolean' &&
    typeof value.receivedAt === 'string' &&
    Number.isFinite(Date.parse(value.receivedAt))
  )
}

export function parseGmailMessagePage(value: unknown): GmailMessagePage {
  if (
    !isRecord(value) ||
    !Array.isArray(value.messages) ||
    !value.messages.every(isMessageSummary) ||
    (value.nextPageToken !== null && typeof value.nextPageToken !== 'string')
  )
    throw new Error('Invalid Gmail message list.')
  return { messages: value.messages, nextPageToken: value.nextPageToken }
}

export function parseGmailMessage(value: unknown): GmailMessage {
  const recipient = isRecord(value) ? value.recipient : null
  const body = isRecord(value) ? value.body : null
  if (!isMessageSummary(value) || typeof recipient !== 'string' || typeof body !== 'string') {
    throw new Error('Invalid Gmail message.')
  }
  return { ...value, recipient, body }
}

export type GmailStatus = {
  connected: boolean
  email: string | null
}

export function parseGmailStatus(value: unknown): GmailStatus {
  if (!isRecord(value)) return { connected: false, email: null }
  return {
    connected: value.connected === true,
    email: typeof value.email === 'string' ? value.email : null,
  }
}
