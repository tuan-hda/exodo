export function isGmailOwner(userId: string) {
  return Boolean(process.env.GMAIL_OWNER_CLERK_USER_ID && process.env.GMAIL_OWNER_CLERK_USER_ID === userId)
}
