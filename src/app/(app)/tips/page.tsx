'use client'

import { useQuery } from 'convex/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '../../../../convex/_generated/api'
import { BookOpen, Crown, Lock, Clock, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { useState } from 'react'

const CATEGORIES = ['All','Body Care','Dental','Skincare','Hair Care','Feminine','Fragrance',"Men's Care",'Gut & Diet']

export default function TipsPage() {
  const searchParams   = useSearchParams()
  const activeCategory = searchParams.get('category') ?? 'All'
  const [search, setSearch] = useState(searchParams.get('q') ?? '')

  const convexUser = useQuery(api.users.getMe)
  const allTips    = useQuery(api.tips.list, activeCategory !== 'All' ? { category: activeCategory } : {})
  const isPro      = convexUser?.plan === 'pro'

  const tips = (allTips ?? []).filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.excerpt.toLowerCase().includes(search.toLowerCase())
  )
  const freeTips    = tips.filter(t => !t.isPremium)
  const premiumTips = tips.filter(t =>  t.isPremium)

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl text-gray-900 mb-1">Hygiene Tips</h1>
        <p className="text-gray-500 text-sm">Evidence-based advice for every part of your routine.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tips…"
          className="w-full pl-11 pr-4 py-3 bg-white border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <Link key={cat} href={cat === 'All' ? '/tips' : `/tips?category=${encodeURIComponent(cat)}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${activeCategory === cat ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-cream-200 hover:border-brand-200 hover:text-brand-700'}`}>
            {cat}
          </Link>
        ))}
      </div>

      {freeTips.length > 0 && (
        <section>
          <h2 className="font-serif text-xl text-gray-900 mb-4">Free tips</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {freeTips.map(tip => (
              <Link key={tip._id} href={`/tips/${tip.slug}`}>
                <Card hoverable className="h-full">
                  <div className="flex items-start justify-between gap-2 mb-3"><Badge variant="default">{tip.category}</Badge></div>
                  <h3 className="font-serif text-base text-gray-900 leading-snug mb-2 line-clamp-2">{tip.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{tip.excerpt}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3" />{tip.readTimeMinutes} min read</div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {premiumTips.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-serif text-xl text-gray-900">Premium tips</h2>
            <Badge variant="premium" icon={<Crown className="w-3 h-3" />}>Pro only</Badge>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {premiumTips.map(tip => (
              <Link key={tip._id} href={isPro ? `/tips/${tip.slug}` : '/settings?checkout=pro'}>
                <Card hoverable className={`h-full relative ${!isPro ? 'opacity-75' : ''}`}>
                  {!isPro && (
                    <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-white/80 backdrop-blur-[1px] z-10">
                      <div className="text-center"><Lock className="w-5 h-5 text-brand-500 mx-auto mb-1" /><p className="text-xs font-medium text-brand-600">Pro only</p></div>
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-2 mb-3"><Badge variant="default">{tip.category}</Badge><Badge variant="premium" icon={<Crown className="w-3 h-3" />}>Pro</Badge></div>
                  <h3 className="font-serif text-base text-gray-900 leading-snug mb-2 line-clamp-2">{tip.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{tip.excerpt}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3" />{tip.readTimeMinutes} min read</div>
                </Card>
              </Link>
            ))}
          </div>
          {!isPro && (
            <div className="mt-6 p-6 rounded-2xl bg-brand-900 text-white text-center">
              <Crown className="w-8 h-8 text-brand-300 mx-auto mb-3" />
              <h3 className="font-serif text-xl mb-2">Unlock {premiumTips.length} premium tips</h3>
              <p className="text-brand-200 text-sm mb-4">Get unlimited access with Pro.</p>
              <Link href="/settings?checkout=pro" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-brand-700 font-medium text-sm hover:bg-cream-50 transition-colors">
                <Crown className="w-4 h-4" /> Upgrade to Pro — $7/mo
              </Link>
            </div>
          )}
        </section>
      )}

      {tips.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No tips found. Try a different search or category.</p>
        </div>
      )}
    </div>
  )
}
