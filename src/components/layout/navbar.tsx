'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Menu, X, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/tips',      label: 'Tips' },
  { href: '/products',  label: 'Products' },
  { href: '/community', label: 'Community' },
]

export function Navbar() {
  const [open, setOpen]     = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname  = usePathname()
  const convexUser = useQuery(api.users.getMe)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <header className={cn('fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-white/90 backdrop-blur-md border-b border-cream-200 shadow-sm' : 'bg-transparent')}>
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <Leaf className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-serif text-xl font-semibold text-brand-900 tracking-tight">HGyne</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href}
              className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname.startsWith(link.href) ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:text-brand-700 hover:bg-brand-50')}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <SignedOut>
            <Link href="/sign-in"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link href="/sign-up"><Button size="sm">Get started</Button></Link>
          </SignedOut>
          <SignedIn>
            {convexUser?.plan === 'free' && (
              <Link href="/settings?checkout=pro" className="text-xs font-semibold text-brand-600 hover:underline mr-1">Upgrade to Pro</Link>
            )}
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-brand-700 font-medium px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors">Dashboard</Link>
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-9 h-9' } }} />
          </SignedIn>
        </div>

        <button className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-brand-50" onClick={() => setOpen(v => !v)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-white border-t border-cream-200 shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                className={cn('flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                  pathname.startsWith(link.href) ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50')}>
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-cream-100 flex flex-col gap-2">
              <SignedOut>
                <Link href="/sign-in"><Button variant="secondary" className="w-full">Sign in</Button></Link>
                <Link href="/sign-up"><Button className="w-full">Get started</Button></Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard"><Button variant="secondary" className="w-full">Dashboard</Button></Link>
              </SignedIn>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
