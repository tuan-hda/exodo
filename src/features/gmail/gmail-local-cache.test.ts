import { beforeEach, expect, it } from 'vitest'
import {
  clearAllGmailMessagesCaches,
  clearGmailMessagesCache,
  GMAIL_MESSAGES_CACHE_TTL_MS,
  readGmailMessagesCache,
  writeGmailMessagesCache,
} from './gmail-local-cache'
import type { GmailMessagePage } from './types'

const email = 'owner@example.com'
const now = Date.parse('2026-09-29T00:00:00.000Z')
const page: GmailMessagePage = {
  messages: [
    {
      id: 'message-1',
      threadId: 'thread-1',
      sender: 'alerts@example.com',
      subject: 'Balance Changed',
      snippet: '',
      receivedAt: '2026-09-28T10:00:00.000Z',
      unread: false,
      transaction: { source: 'vpbank-debit', amount: -42000, occurredAt: '2026-09-28T09:00:00.000Z' },
    },
  ],
  nextPageToken: 'older-page',
}

function createStorage() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    get length() {
      return values.size
    },
    values,
  }
}

let storage: ReturnType<typeof createStorage>

beforeEach(() => {
  storage = createStorage()
})

it('stores and reads a mailbox page for twelve hours', () => {
  writeGmailMessagesCache(email, page, storage, now)
  expect(readGmailMessagesCache(email, storage, now + GMAIL_MESSAGES_CACHE_TTL_MS - 1)).toEqual(page)
  expect(readGmailMessagesCache(email, storage, now + GMAIL_MESSAGES_CACHE_TTL_MS)).toBeNull()
})

it('scopes the cache by mailbox and clears it on request', () => {
  writeGmailMessagesCache(email, page, storage, now)
  expect(readGmailMessagesCache('other@example.com', storage, now)).toBeNull()
  clearGmailMessagesCache(email, storage)
  expect(readGmailMessagesCache(email, storage, now)).toBeNull()
})

it('clears every Exodo Gmail cache without clearing unrelated local storage', () => {
  writeGmailMessagesCache(email, page, storage, now)
  writeGmailMessagesCache('second@example.com', page, storage, now)
  storage.setItem('unrelated-preference', 'keep')

  clearAllGmailMessagesCaches(storage)

  expect(storage.values.size).toBe(1)
  expect(storage.getItem('unrelated-preference')).toBe('keep')
})

it('discards malformed cached data', () => {
  storage.setItem('exodo:gmail-messages:v1:owner@example.com', JSON.stringify({ cachedAt: now, messages: 'bad' }))
  expect(readGmailMessagesCache(email, storage, now)).toBeNull()
  expect(storage.values.size).toBe(0)
})
