import { convert } from 'html-to-text'
import { isRecord } from '@/lib/guards'
import { gmailErrorStatus } from './gmail-api'
import { getGmailClient } from './gmail-service'
import { classifyTransactionSubject } from './transaction-parser'
import type { GmailMessage, GmailMessageSummary, GmailMessagePage } from './types'

function decodeHeaderText(value: string) {
  return value
    .replace(/(\?=)[\t\r\n ]+(?==\?)/g, '$1')
    .replace(/=\?([^?]+)\?([bq])\?([^?]*)\?=/gi, (original, charset: string, encoding: string, content: string) => {
      try {
        const bytes =
          encoding.toLowerCase() === 'b'
            ? Buffer.from(content, 'base64')
            : Buffer.from(
                content
                  .replace(/_/g, ' ')
                  .replace(/=([0-9a-f]{2})/gi, (_, hex: string) => String.fromCharCode(parseInt(hex, 16))),
                'latin1',
              )
        return new TextDecoder(charset).decode(bytes)
      } catch {
        return original
      }
    })
}

function header(payload: Record<string, unknown>, name: string) {
  if (!Array.isArray(payload.headers)) return ''
  const item = payload.headers.find(
    (item) => isRecord(item) && typeof item.name === 'string' && item.name.toLowerCase() === name,
  )
  return isRecord(item) && typeof item.value === 'string' ? decodeHeaderText(item.value) : ''
}

export function decodeMessageSummary(value: unknown): GmailMessageSummary {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    !isRecord(value.payload) ||
    typeof value.internalDate !== 'string'
  ) {
    throw new Error('Gmail returned an invalid message.')
  }
  const received = new Date(Number(value.internalDate))
  if (!Number.isFinite(received.getTime())) throw new Error('Gmail returned an invalid received date.')
  return {
    id: value.id,
    sender: header(value.payload, 'from'),
    subject: header(value.payload, 'subject') || '(No subject)',
    snippet: typeof value.snippet === 'string' ? convert(value.snippet, { wordwrap: false }) : '',
    receivedAt: received.toISOString(),
    unread: Array.isArray(value.labelIds) && value.labelIds.includes('UNREAD'),
  }
}

function findBodyParts(part: unknown, mimeType: string): Record<string, unknown>[] {
  if (!isRecord(part) || (typeof part.filename === 'string' && part.filename)) return []
  if (part.mimeType === mimeType && isRecord(part.body)) return [part]
  return Array.isArray(part.parts) ? part.parts.flatMap((child) => findBodyParts(child, mimeType)) : []
}

export async function decodeMessage(
  value: unknown,
  readAttachment?: (id: string) => Promise<unknown>,
): Promise<GmailMessage> {
  const summary = decodeMessageSummary(value)
  if (!isRecord(value) || !isRecord(value.payload)) throw new Error('Gmail returned an invalid message body.')
  const plain = findBodyParts(value.payload, 'text/plain')
  const parts = plain.length ? plain : findBodyParts(value.payload, 'text/html')
  const texts: string[] = []
  for (const part of parts) {
    if (!isRecord(part.body)) continue
    let body = part.body
    if (typeof body.size === 'number' && body.size > 2_000_000)
      throw new Error('This email body is too large to display.')
    if (typeof body.data !== 'string' && typeof body.attachmentId === 'string' && readAttachment) {
      const attachment = await readAttachment(body.attachmentId)
      if (isRecord(attachment)) body = attachment
    }
    if (typeof body.data !== 'string') continue
    const bytes = Buffer.from(body.data, 'base64url')
    if (bytes.length > 2_000_000) throw new Error('This email body is too large to display.')
    const charset = header(part, 'content-type').match(/charset\s*=\s*["']?([^\s;"']+)/i)?.[1] || 'utf-8'
    let text: string
    try {
      text = new TextDecoder(charset).decode(bytes)
    } catch {
      text = bytes.toString('utf8')
    }
    texts.push(
      plain.length
        ? text
        : convert(text, {
            wordwrap: false,
            selectors: [
              { selector: 'img', format: 'skip' },
              { selector: 'script', format: 'skip' },
              { selector: 'style', format: 'skip' },
              { selector: 'td', format: 'block', options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
              { selector: 'th', format: 'block', options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
            ],
          }),
    )
  }
  return { ...summary, recipient: header(value.payload, 'to'), body: texts.join('\n\n').trim() }
}

export async function listGmailMessages(userId: string, pageToken?: string): Promise<GmailMessagePage> {
  const client = await getGmailClient(userId)
  const { data } = await client.users.messages.list(
    { userId: 'me', labelIds: ['INBOX'], q: 'subject:VPBank OR subject:CAKE', maxResults: 20, pageToken },
    { timeout: 15_000 },
  )
  const items = data.messages ?? []
  const messages: GmailMessageSummary[] = []
  for (let offset = 0; offset < items.length; offset += 5) {
    const batch = await Promise.all(
      items.slice(offset, offset + 5).map(async (item) => {
        if (!item.id) throw new Error('Gmail returned an invalid message ID.')
        try {
          const result = await client.users.messages.get(
            { userId: 'me', id: item.id, format: 'metadata' },
            { timeout: 15_000 },
          )
          const summary = decodeMessageSummary(result.data)
          return classifyTransactionSubject(summary.subject) ? summary : null
        } catch (error) {
          if (gmailErrorStatus(error) === 404) return null
          throw error
        }
      }),
    )
    messages.push(...batch.filter((message): message is GmailMessageSummary => message !== null))
  }
  return { messages, nextPageToken: data.nextPageToken ?? null }
}

export async function readGmailMessage(userId: string, messageId: string) {
  const client = await getGmailClient(userId)
  const { data } = await client.users.messages.get({ userId: 'me', id: messageId, format: 'full' }, { timeout: 15_000 })
  return decodeMessage(data, async (id) => {
    const attachment = await client.users.messages.attachments.get({ userId: 'me', messageId, id }, { timeout: 15_000 })
    return attachment.data
  })
}
