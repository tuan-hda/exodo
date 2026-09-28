import { beforeEach, expect, it, vi } from 'vitest'
import { cacheLife, cacheTag, revalidateTag } from 'next/cache'
import { listGmailMessages, readGmailMessage } from './gmail-messages'
import { getCachedGmailMessages, getCachedGmailMessage, invalidateGmailCache } from './gmail-cache'

vi.mock('next/cache', () => ({ cacheLife: vi.fn(), cacheTag: vi.fn(), revalidateTag: vi.fn() }))
vi.mock('./gmail-messages', () => ({ listGmailMessages: vi.fn(), readGmailMessage: vi.fn() }))
beforeEach(() => vi.resetAllMocks())

it('configures twelve-hour revalidation and tags each user separately', async () => {
  vi.mocked(listGmailMessages).mockResolvedValue({ messages: [], nextPageToken: null })
  await getCachedGmailMessages('one', 'one@example.com', 'page')
  await getCachedGmailMessage('two', 'two@example.com', 'message')
  expect(cacheLife).toHaveBeenCalledWith({ revalidate: 43200, expire: 86400 })
  expect(cacheTag).toHaveBeenNthCalledWith(1, 'gmail:one')
  expect(cacheTag).toHaveBeenNthCalledWith(2, 'gmail:two')
  expect(listGmailMessages).toHaveBeenCalledWith('one', 'page')
  expect(readGmailMessage).toHaveBeenCalledWith('two', 'message')
})

it('expires cached results immediately for manual refresh', () => {
  invalidateGmailCache('one')
  expect(revalidateTag).toHaveBeenCalledExactlyOnceWith('gmail:one', { expire: 0 })
})
