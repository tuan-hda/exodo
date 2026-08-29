import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { PwaRegistration } from '../features/pwa/PwaRegistration'
import { getClerkAllowedRedirectOrigins } from '../lib/clerk-origins'
import '../styles.css'

const clerkAllowedRedirectOrigins = getClerkAllowedRedirectOrigins()

export const metadata: Metadata = {
  title: 'Exodo — daily money practice',
  description: 'Track income, expenses, and what today makes possible.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Exodo',
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: '#151515',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      allowedRedirectOrigins={clerkAllowedRedirectOrigins.length ? clerkAllowedRedirectOrigins : undefined}
      signInUrl="/sign-in"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/">
      <html lang="en">
        <body>
          <PwaRegistration />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
