import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-white p-6 text-center text-sm text-muted">
      <SignIn fallbackRedirectUrl="/" />
    </main>
  )
}
