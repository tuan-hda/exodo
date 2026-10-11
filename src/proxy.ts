import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Capture authenticates its own bearer token; Shortcuts has no Clerk browser session.
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/api/notifications/capture'])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) await auth.protect()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
