import { SignIn } from '@clerk/nextjs'
import { clerkAppearance } from '@/features/auth/clerk-appearance'
import { AuthShell } from '@/features/auth/AuthShell'

export default function SignInPage() {
  return (
    <AuthShell>
      <SignIn appearance={clerkAppearance} fallbackRedirectUrl="/" />
    </AuthShell>
  )
}
