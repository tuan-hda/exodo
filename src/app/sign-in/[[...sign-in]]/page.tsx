import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <main className="auth-state">
      <SignIn fallbackRedirectUrl="/" />
    </main>
  )
}
