import { describe, expect, it } from 'vitest'
import { parseGmailStatus } from './types'

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
