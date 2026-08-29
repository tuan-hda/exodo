const allowedRedirectOriginsEnv = 'NEXT_PUBLIC_CLERK_ALLOWED_REDIRECT_ORIGINS'

export function getClerkAllowedRedirectOrigins(value = process.env[allowedRedirectOriginsEnv] ?? '') {
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

export function getNextAllowedDevOrigins(origins: string[]) {
  return origins.flatMap((origin) => {
    try {
      return [new URL(origin).hostname]
    } catch {
      return []
    }
  })
}
