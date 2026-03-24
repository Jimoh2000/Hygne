'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, useClerk } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { LayoutDashboard, BookOpen, ShoppingBag, Users, Settings, LogOut, Leaf, Sparkles, Crown, Menu, X } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tips',      label: 'Tips',       icon: BookOpen },
  { href: '/products',  label: 'Products',   icon: ShoppingBag },
  { href: '/community', label: 'Community',  icon: Users },
]

export function AppSidebar() {
  const pathname    = usePathname()
  const { signOut } = useClerk()
  const { user }    = useUser()
  const convexUser  = useQuery(api.users.getMe)
  const [open, setOpen] = useState(false)

  const isPro       = convexUser?.plan === 'pro'
  const displayName = convexUser?.displayName ?? user?.firstName ?? 'Member'
  const email       = convexUser?.email ?? user?.primaryEmailAddress?.emailAddress ?? ''

  const Content = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-cream-100">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-sm">
            <Leaf className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-serif text-xl font-semibold text-brand-900">HGyne</span>
        </Link>
      </div>
      <div className="px-4 py-4 border-b border-cream-100">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-cream-50">
          <Avatar src={user?.imageUrl} name={displayName} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
            <p className="text-xs text-gray-400 truncate">{email}</p>
          </div>
          {isPro && <Badge variant="pro" icon={<Crown className="w-3 h-3" />}>Pro</Badge>}
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')}>
              <item.icon className={cn('w-4 h-4', active ? 'text-brand-600' : 'text-gray-400')} />
              {item.label}
            </Link>
          )
        })}
      </nav>
      {!isPro && (
        <div className="px-4 pb-4">
          <div className="p-4 rounded-2xl bg-brand-900 text-white">
            <div className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-brand-300" /><span className="text-xs font-semibold text-brand-300 uppercase tracking-wider">Go Pro</span></div>
            <p className="text-xs text-brand-200 mb-3">Unlock all premium tips and exclusive deals.</p>
            <Link href="/settings?checkout=pro" className="block text-center py-2 px-3 rounded-xl bg-white text-brand-700 text-xs font-semibold hover:bg-cream-50 transition-colors">Upgrade for $7/mo</Link>
          </div>
        </div>
      )}
      <div className="px-3 pb-4 border-t border-cream-100 pt-3 space-y-0.5">
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <Settings className="w-4 h-4 text-gray-400" />Settings
        </Link>
        <button onClick={() => signOut({ redirectUrl: '/' })} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
          <LogOut className="w-4 h-4" />Sign out
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 bg-white border-r border-cream-200 z-40"><Content /></aside>
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-cream-200 h-14 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center"><Leaf className="w-3.5 h-3.5 text-white" strokeWidth={2.5} /></div><span className="font-serif text-lg font-semibold text-brand-900">HGyne</span></Link>
        <button onClick={() => setOpen(v => !v)} className="p-2 rounded-lg text-gray-600 hover:bg-gray-50">{open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
      </div>
      {open && (<><div className="md:hidden fixed inset-0 bg-black/30 z-40" onClick={() => setOpen(false)} /><aside className="md:hidden fixed left-0 top-0 h-screen w-72 bg-white z-50 shadow-2xl"><Content /></aside></>)}
      <div className="md:hidden h-14" />
    </>
  )
}
