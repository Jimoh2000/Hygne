'use client'

import { useQuery } from 'convex/react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { api } from '../../../../convex/_generated/api'
import { ArrowRight, BookOpen, ShoppingBag, Users, Crown, Sparkles, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatRelativeTime } from '@/lib/utils'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 18) return 'afternoon'
  return 'evening'
}

export default function DashboardPage() {
  const { user } = useUser()
  const convexUser      = useQuery(api.users.getMe)
  const recentTips      = useQuery(api.tips.getRecent, { limit: 4 })
  const featuredProducts = useQuery(api.products.getFeatured, { limit: 3 })
  const communityPosts  = useQuery(api.community.listPosts, { tab: 'trending', limit: 3 })
  const tipStats        = useQuery(api.tips.getStats)
  const productStats    = useQuery(api.products.getStats)
  const communityStats  = useQuery(api.community.getStats)

  const isPro       = convexUser?.plan === 'pro'
  const firstName   = convexUser?.displayName?.split(' ')[0] ?? user?.firstName ?? 'there'

  const stats = [
    { label: 'Hygiene tips',    value: tipStats?.total ?? 0,      icon: BookOpen,   color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Curated products', value: productStats?.total ?? 0,  icon: ShoppingBag, color: 'text-blush-600', bg: 'bg-blush-50' },
    { label: 'Community posts', value: communityStats?.total ?? 0, icon: Users,      color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl text-gray-900 mb-1">Good {getGreeting()}, {firstName} 👋</h1>
          <p className="text-gray-500 text-sm">Here's what's happening in your hygiene world today.</p>
        </div>
        {isPro && <Badge variant="pro" icon={<Crown className="w-3 h-3" />} className="hidden sm:flex">Pro Member</Badge>}
      </div>

      {!isPro && (
        <div className="relative overflow-hidden rounded-2xl bg-brand-900 p-6 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand-700/40 -translate-y-1/2 translate-x-1/4" />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-brand-300" /><span className="text-xs font-semibold text-brand-300 uppercase tracking-wider">Upgrade to Pro</span></div>
              <h3 className="font-serif text-xl mb-1">Unlock all premium content</h3>
              <p className="text-brand-200 text-sm">100+ premium tips, exclusive deals, and priority support.</p>
            </div>
            <Link href="/settings?checkout=pro" className="flex-shrink-0">
              <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>Start free trial</Button>
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="card-base p-5">
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="font-serif text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl text-gray-900">Latest tips</h2>
          <Link href="/tips" className="text-sm text-brand-600 hover:underline flex items-center gap-1">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {recentTips?.map(tip => (
            <Link key={tip._id} href={`/tips/${tip.slug}`}>
              <Card hoverable className="h-full">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <Badge variant="default">{tip.category}</Badge>
                  {tip.isPremium && !isPro && <Badge variant="premium" icon={<Crown className="w-3 h-3" />}>Pro</Badge>}
                </div>
                <h3 className="font-serif text-base text-gray-900 leading-snug mb-2 line-clamp-2">{tip.title}</h3>
                <p className="text-xs text-gray-400">{tip.readTimeMinutes} min read</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl text-gray-900">Community spotlight</h2>
          <Link href="/community" className="text-sm text-brand-600 hover:underline flex items-center gap-1">Browse all <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
        <div className="space-y-3">
          {communityPosts?.map(post => (
            <Link key={post._id} href={`/community/${post._id}`}>
              <Card hoverable padded={false} className="p-4">
                <p className="text-sm text-gray-800 line-clamp-2 mb-2">{post.body}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {post.voteCount} votes</span>
                  <span>{post.replyCount} replies</span>
                  <span className="ml-auto">{formatRelativeTime(post.createdAt)}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
