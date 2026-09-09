import { SignIn } from '@clerk/nextjs'
import { clerkAppearance } from '@/features/auth/clerk-appearance'

export default function SignInPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-page p-6 text-center text-sm text-muted">
      <SignIn appearance={clerkAppearance} fallbackRedirectUrl="/" />
    </main>
  )
}
