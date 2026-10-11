import { describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  handler: undefined as undefined | ((auth: { protect: () => Promise<void> }, request: NextRequest) => Promise<void>),
}))
vi.mock('@clerk/nextjs/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@clerk/nextjs/server')>()
  return {
    ...actual,
    clerkMiddleware: (handler: typeof mocks.handler) => {
      mocks.handler = handler
      return handler
    },
  }
})
await import('./proxy')

describe('capture Clerk exemption', () => {
  it.each([
    ['/api/notifications/capture', false],
    ['/api/notifications/capture?test=1', false],
    ['/api/notifications/captures', true],
    ['/api/notifications/capture-extra', true],
    ['/api/notifications/capture/nested', true],
    ['/api/gmail/status', true],
    ['/', true],
    ['/sign-in', false],
  ])('enforces the expected session boundary for %s', async (path, protectedRoute) => {
    const protect = vi.fn().mockResolvedValue(undefined)
    await mocks.handler!({ protect }, new NextRequest(`https://exodo.test${path}`))
    expect(protect).toHaveBeenCalledTimes(protectedRoute ? 1 : 0)
  })
})
