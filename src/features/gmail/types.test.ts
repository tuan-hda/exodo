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
    sender: 'sender@example.com',
    subject: 'Hello',
    snippet: '',
    receivedAt: '2026-09-28T12:00:00Z',
    unread: true,
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
})
