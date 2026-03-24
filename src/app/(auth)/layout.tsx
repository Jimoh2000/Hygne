import Link from 'next/link'
import { Leaf } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      <div className="py-6 px-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-serif text-xl font-semibold text-brand-900">HGyne</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </div>
      <div className="py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} HGyne ·{' '}
        <Link href="/privacy" className="hover:text-brand-600">Privacy</Link> ·{' '}
        <Link href="/terms" className="hover:text-brand-600">Terms</Link>
      </div>
    </div>
  )
}
