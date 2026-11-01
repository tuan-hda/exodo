import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { ownerShare, parseBillSplit, RatioError, splitBill, splitKey } from './ratio-client'

const fetchMock = vi.fn()

beforeEach(() => {
  vi.stubEnv('RATIO_API_URL', 'https://ratio.test')
  vi.stubEnv('RATIO_API_KEY', 'secret')
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockResolvedValue(Response.json({ people: 3, share: 25000 }))
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

it('posts the split with the API key and idempotency key', async () => {
  await expect(splitBill({ key: 'k1', title: 'Dinner', amount: 100000, config: 'more' })).resolves.toEqual({
    people: 3,
    share: 25000,
  })
  const [url, init] = fetchMock.mock.calls[0]
  expect(String(url)).toBe('https://ratio.test/api/external/split')
  expect(init.headers).toMatchObject({ Authorization: 'Bearer secret', 'Idempotency-Key': 'k1' })
  expect(JSON.parse(init.body)).toEqual({ title: 'Dinner', amount: 100000, config: 'more' })
})

it('surfaces ratio errors with their status', async () => {
  fetchMock.mockResolvedValue(Response.json({ error: 'unknown config' }, { status: 400 }))
  await expect(splitBill({ key: 'k1', title: 'Dinner', amount: 100000 })).rejects.toEqual(
    new RatioError('unknown config', 400),
  )
})

it('refuses to call ratio without configuration', async () => {
  vi.stubEnv('RATIO_API_KEY', '')
  await expect(splitBill({ key: 'k1', title: 'Dinner', amount: 100000 })).rejects.toMatchObject({ status: 503 })
  expect(fetchMock).not.toHaveBeenCalled()
})

it('rejects malformed responses', async () => {
  fetchMock.mockResolvedValue(Response.json({ people: 0, share: 'x' }))
  await expect(splitBill({ key: 'k1', title: 'Dinner', amount: 100000 })).rejects.toMatchObject({ status: 502 })
})

it('gives the owner the remainder', () => {
  expect(ownerShare(100001, { people: 3, share: 25000 })).toBe(25001)
})

it.each([
  [undefined, undefined],
  [{}, { config: undefined, testOnly: undefined }],
  [
    { config: 'more', testOnly: true },
    { config: 'more', testOnly: true },
  ],
  [{ config: '' }, null],
  [{ testOnly: 'yes' }, null],
  ['more', null],
])('parses split options %j', (value, expected) => {
  expect(parseBillSplit(value)).toEqual(expected)
})

it('derives a stable, bounded idempotency key', async () => {
  const key = await splitKey('capture', 'owner', 'device', 'event')
  expect(key).toBe(await splitKey('capture', 'owner', 'device', 'event'))
  expect(key).not.toBe(await splitKey('capture', 'owner', 'device', 'other'))
  expect(key.length).toBeLessThanOrEqual(128)
})
