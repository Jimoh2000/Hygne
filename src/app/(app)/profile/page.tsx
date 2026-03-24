'use client'

import { useQuery } from 'convex/react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { api } from '../../../../convex/_generated/api'
import { Crown, MessageCircle, TrendingUp, Calendar } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatDate, formatRelativeTime } from '@/lib/utils'

export default function ProfilePage() {
  const { user }    = useUser()
  const convexUser  = useQuery(api.users.getMe)
  const myPosts     = useQuery(api.community.getMyPosts)
  const subscription = useQuery(api.users.getMySubscription)

  const isPro       = convexUser?.plan === 'pro'
  const displayName = convexUser?.displayName ?? user?.firstName ?? 'HGyne Member'
  const email       = convexUser?.email ?? user?.primaryEmailAddress?.emailAddress ?? ''

  if (!convexUser) return <div className="animate-pulse h-96 bg-cream-100 rounded-2xl" />

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <Card>
        <div className="flex items-start gap-4">
          <Avatar src={user?.imageUrl} name={displayName} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="font-serif text-2xl text-gray-900">{displayName}</h1>
              {isPro && <Badge variant="pro" icon={<Crown className="w-3 h-3" />}>Pro</Badge>}
            </div>
            <p className="text-sm text-gray-400 mb-3">{email}</p>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar className="w-3.5 h-3.5" />Member since {formatDate(convexUser.createdAt)}
            </div>
          </div>
          <Link href="/settings" className="text-sm text-brand-600 hover:underline flex-shrink-0">Edit profile</Link>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-cream-100">
          {[
            { label: 'Posts',    value: myPosts?.length ?? 0 },
            { label: 'Plan',     value: isPro ? 'Pro' : 'Free' },
            { label: 'Language', value: (convexUser.preferredLanguage ?? 'en').toUpperCase() },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="font-serif text-xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {isPro && subscription && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-lg text-gray-900">Pro membership</h2>
            <Badge variant="success">Active</Badge>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Plan</span><span className="font-medium capitalize">{subscription.plan}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Renews</span><span className="font-medium">{formatDate(subscription.currentPeriodEnd)}</span></div>
          </div>
          <Link href="/settings?tab=billing" className="block mt-4 text-xs text-brand-600 hover:underline">Manage billing →</Link>
        </Card>
      )}

      {!isPro && (
        <div className="rounded-2xl bg-brand-900 p-6 text-white">
          <div className="flex items-center gap-2 mb-2"><Crown className="w-4 h-4 text-brand-300" /><span className="text-xs font-semibold text-brand-300 uppercase tracking-wider">Upgrade to Pro</span></div>
          <p className="font-serif text-lg mb-4">Unlock premium tips, exclusive deals, and more.</p>
          <Link href="/settings?checkout=pro" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-brand-700 text-sm font-semibold hover:bg-cream-50 transition-colors">Start 7-day free trial</Link>
        </div>
      )}

      <section>
        <h2 className="font-serif text-xl text-gray-900 mb-4">Your community posts</h2>
        {myPosts && myPosts.length > 0 ? (
          <div className="space-y-3">
            {myPosts.map(post => (
              <Link key={post._id} href={`/community/${post._id}`}>
                <Card hoverable padded={false} className="p-4">
                  <p className="text-sm text-gray-800 line-clamp-2 mb-2">{post.body}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{post.voteCount}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{post.replyCount}</span>
                    <span className={post.isAnonymous ? 'text-brand-400' : ''}>{post.isAnonymous ? 'Posted anonymously' : 'Public'}</span>
                    <span className="ml-auto">{formatRelativeTime(post.createdAt)}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="text-center py-10">
            <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No posts yet.</p>
            <Link href="/community" className="mt-3 inline-block text-sm text-brand-600 hover:underline">Ask your first question →</Link>
          </Card>
        )}
      </section>
    </div>
  )
}
