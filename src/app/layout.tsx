import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import '../styles.css'

export const metadata: Metadata = {
  title: 'Exodo — daily money practice',
  description: 'Track income, expenses, and what today makes possible.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ClerkProvider><html lang="en"><body>{children}</body></html></ClerkProvider>
}
