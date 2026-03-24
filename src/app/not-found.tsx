import Link from 'next/link'
import { Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center mb-6 shadow-glow">
        <Leaf className="w-8 h-8 text-white" strokeWidth={2.5} />
      </div>

      <p className="section-label mb-3">404 — Page not found</p>

      <h1 className="font-serif text-4xl sm:text-5xl text-gray-900 mb-4">
        This page doesn't exist
      </h1>

      <p className="text-gray-500 text-lg mb-8 max-w-md leading-relaxed">
        Looks like you wandered off the path. Let's get you back to your hygiene journey.
      </p>

      <div className="flex gap-3">
        <Link href="/">
          <Button>Go home</Button>
        </Link>
        <Link href="/tips">
          <Button variant="secondary">Browse tips</Button>
        </Link>
      </div>
    </div>
  )
}
