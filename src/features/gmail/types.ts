import { isRecord } from '@/lib/guards'

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
