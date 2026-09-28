import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { decryptGoogleToken, encryptGoogleToken } from './token-encryption'

const user = 'user_123'
const email = 'owner@example.com'
beforeEach(() => vi.stubEnv('GOOGLE_TOKEN_ENCRYPTION_KEY', Buffer.alloc(32, 7).toString('base64')))
afterEach(() => vi.unstubAllEnvs())

it('encrypts with a fresh nonce and decrypts the original token', () => {
  const token = 'secret-refresh-token'
  const first = encryptGoogleToken(token, user, email)
  expect(first).not.toContain(token)
  expect(first).not.toBe(encryptGoogleToken(token, user, email))
  expect(decryptGoogleToken(first, user, email)).toBe(token)
})

it('binds ciphertext to the user and mailbox', () => {
  const encrypted = encryptGoogleToken('secret', user, email)
  expect(() => decryptGoogleToken(encrypted, 'other-user', email)).toThrow('Could not decrypt')
  expect(() => decryptGoogleToken(encrypted, user, 'other@example.com')).toThrow('Could not decrypt')
})

it('rejects tampering and a different encryption key', () => {
  const encrypted = encryptGoogleToken('secret', user, email)
  const parts = encrypted.split(':')
  const ciphertext = Buffer.from(parts[4], 'base64url')
  ciphertext[0] ^= 1
  parts[4] = ciphertext.toString('base64url')
  expect(() => decryptGoogleToken(parts.join(':'), user, email)).toThrow('Could not decrypt')
  vi.stubEnv('GOOGLE_TOKEN_ENCRYPTION_KEY', Buffer.alloc(32, 8).toString('base64'))
  expect(() => decryptGoogleToken(encrypted, user, email)).toThrow('Could not decrypt')
})

it.each(['plaintext-token', 'enc:v2:anything', 'enc:v1:a:b:c', 'enc:v1:', 'enc:v1:a:b:c:extra'])(
  'rejects unsupported or malformed storage: %s',
  (value) => {
    expect(() => decryptGoogleToken(value, user, email)).toThrow('Could not decrypt')
  },
)

it.each(['', 'invalid', Buffer.alloc(16).toString('base64')])('requires a valid server key: %s', (key) => {
  vi.stubEnv('GOOGLE_TOKEN_ENCRYPTION_KEY', key)
  expect(() => encryptGoogleToken('secret', user, email)).toThrow('32-byte key')
  expect(() => decryptGoogleToken('plaintext', user, email)).toThrow('32-byte key')
})
