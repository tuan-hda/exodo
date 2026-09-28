import { cacheLife, cacheTag, revalidateTag } from 'next/cache'
import { listGmailMessages, readGmailMessage } from './gmail-messages'

const userTag = (userId: string) => `gmail:${userId}`

export function invalidateGmailCache(userId: string) {
  revalidateTag(userTag(userId), { expire: 0 })
}

export async function getCachedGmailMessages(
  userId: string,
  mailbox: string,
  pageToken?: string,
  lastImportedAt: string | null = null,
) {
  'use cache'
  cacheLife({ revalidate: 43200, expire: 86400 })
  cacheTag(userTag(userId))
  return listGmailMessages(userId, pageToken, lastImportedAt)
}

export async function getCachedGmailMessage(userId: string, mailbox: string, messageId: string) {
  'use cache'
  cacheLife({ revalidate: 43200, expire: 86400 })
  cacheTag(userTag(userId))
  return readGmailMessage(userId, messageId)
}
