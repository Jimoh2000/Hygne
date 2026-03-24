'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body className="min-h-screen bg-cream-50 flex flex-col items-center justify-center px-4 text-center font-sans">
        <p className="text-xs font-semibold tracking-widest uppercase text-brand-500 mb-3">
          Something went wrong
        </p>
        <h1 className="font-serif text-4xl text-gray-900 mb-4">
          Unexpected error
        </h1>
        <p className="text-gray-500 mb-8 max-w-sm leading-relaxed">
          We hit a bump. Our team has been notified. Try refreshing or heading home.
        </p>
        <div className="flex gap-3">
          <Button onClick={reset}>Try again</Button>
          <Link href="/">
            <Button variant="secondary">Go home</Button>
          </Link>
        </div>
        {error.digest && (
          <p className="mt-6 text-xs text-gray-300 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </body>
    </html>
  )
}
