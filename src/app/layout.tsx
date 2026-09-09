import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { PwaRegistration } from '@/features/pwa/PwaRegistration'
import { getClerkAllowedRedirectOrigins } from '@/lib/clerk-origins'
import '../styles.css'

const clerkAllowedRedirectOrigins = getClerkAllowedRedirectOrigins()
const metadataBase = new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')

export const metadata: Metadata = {
  metadataBase,
  title: 'Exodo — daily money practice',
  description: 'Track income, expenses, and what today makes possible.',
  openGraph: {
    title: 'Exodo — daily money practice',
    description: 'Track income, expenses, and what today makes possible.',
    siteName: 'Exodo',
    type: 'website',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'Exodo daily money practice' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Exodo — daily money practice',
    description: 'Track income, expenses, and what today makes possible.',
    images: ['/og-image.svg'],
  },
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
