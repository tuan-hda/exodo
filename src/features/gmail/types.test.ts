import { describe, expect, it } from 'vitest'
import { parseGmailStatus, parseGmailMessage, parseGmailMessagePage } from './types'

describe('Gmail status parsing', () => {
  it('keeps valid connection data', () => {
    expect(parseGmailStatus({ connected: true, email: 'hello@example.com' })).toEqual({
      connected: true,
      email: 'hello@example.com',
    })
  })

  it('falls back for malformed responses', () => {
    expect(parseGmailStatus(null)).toEqual({ connected: false, email: null })
    expect(parseGmailStatus({ connected: 'yes', email: 42 })).toEqual({ connected: false, email: null })
  })
})

describe('Gmail message response parsing', () => {
  const message = {
    id: 'one',
    threadId: 'thread-one',
    sender: 'sender@example.com',
    subject: 'Hello',
    snippet: '',
    receivedAt: '2026-09-28T12:00:00Z',
    unread: true,
    transaction: null,
  }
  it('keeps valid pages and message bodies', () => {
    expect(parseGmailMessagePage({ messages: [message], nextPageToken: 'next' })).toEqual({
      messages: [message],
      nextPageToken: 'next',
    })
    expect(parseGmailMessage({ ...message, recipient: 'owner@example.com', body: 'Hi' }).body).toBe('Hi')
  })
  it('rejects malformed pages, dates, and missing message bodies', () => {
    expect(() =>
      parseGmailMessagePage({ messages: [{ ...message, receivedAt: 'invalid' }], nextPageToken: null }),
    ).toThrow()
    expect(() => parseGmailMessagePage({ messages: [], nextPageToken: 42 })).toThrow()
    expect(() => parseGmailMessage(message)).toThrow()
  })
  it('validates extracted transaction fields', () => {
    const transaction = { source: 'cake', amount: -21000, occurredAt: '2026-09-26T07:43:55.000Z' }
    expect(
      parseGmailMessagePage({ messages: [{ ...message, transaction }], nextPageToken: null }).messages[0].transaction,
    ).toEqual(transaction)
    for (const invalid of [
      { ...transaction, source: 'unknown' },
      { ...transaction, amount: '-21000' },
      { ...transaction, amount: Infinity },
      { ...transaction, occurredAt: 'invalid' },
    ]) {
      expect(() =>
        parseGmailMessagePage({ messages: [{ ...message, transaction: invalid }], nextPageToken: null }),
      ).toThrow()
    }
  })
})
