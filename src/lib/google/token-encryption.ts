import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

const prefix = 'enc:v1:'

function encryptionKey() {
  const encoded = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY
  if (!encoded || !/^[A-Za-z0-9+/]{43}=$/.test(encoded)) {
    throw new Error('Google token encryption key must be a base64-encoded 32-byte key.')
  }
  const key = Buffer.from(encoded, 'base64')
  if (key.length !== 32 || key.toString('base64') !== encoded) {
    throw new Error('Google token encryption key must be a base64-encoded 32-byte key.')
  }
  return key
}

function context(userId: string, email: string) {
  return Buffer.from(JSON.stringify(['exodo.google.refresh-token.v1', userId, email]))
}

export function encryptGoogleToken(token: string, userId: string, email: string) {
  if (!token) throw new Error('Cannot encrypt an empty Google token.')
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  cipher.setAAD(context(userId, email))
  const ciphertext = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()])
  return `${prefix}${iv.toString('base64url')}:${cipher.getAuthTag().toString('base64url')}:${ciphertext.toString('base64url')}`
}

export function decryptGoogleToken(value: string, userId: string, email: string) {
  const key = encryptionKey()
  try {
    if (!value.startsWith(prefix)) throw new Error('Unsupported format')
    const parts = value.slice(prefix.length).split(':')
    if (parts.length !== 3 || parts.some((part) => !/^[A-Za-z0-9_-]+$/.test(part))) throw new Error('Invalid format')
    const [iv, tag, ciphertext] = parts.map((part) => Buffer.from(part, 'base64url'))
    if ([iv, tag, ciphertext].some((part, index) => part.toString('base64url') !== parts[index]))
      throw new Error('Invalid format')
    if (iv.length !== 12 || tag.length !== 16 || !ciphertext.length) throw new Error('Invalid format')
    const decipher = createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAAD(context(userId, email))
    decipher.setAuthTag(tag)
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
  } catch {
    throw new Error('Could not decrypt Google credentials. Check the encryption key or reconnect your account.')
  }
}
