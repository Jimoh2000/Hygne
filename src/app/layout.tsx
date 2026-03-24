import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { ConvexClientProvider } from '@/lib/convex/provider'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: { default: 'HGyne — Hygiene Advisor', template: '%s | HGyne' },
  description: 'Your personal hygiene advisor. Expert tips, curated product recommendations, and an anonymous community.',
  keywords: ['hygiene', 'skincare', 'health', 'wellness', 'beauty', 'personal care'],
  openGraph: { type: 'website', siteName: 'HGyne', title: 'HGyne — Your Personal Hygiene Advisor' },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = { themeColor: '#23724d', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#23724d',
          colorBackground: '#fdfcf8',
          borderRadius: '12px',
          fontFamily: '"DM Sans", system-ui, sans-serif',
        },
      }}
    >
      <ConvexClientProvider>
        <html lang="en">
          <head>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap" rel="stylesheet" />
          </head>
          <body className="min-h-screen bg-cream-50 font-sans antialiased">
            {children}
            <Toaster />
          </body>
        </html>
      </ConvexClientProvider>
    </ClerkProvider>
  )
}
