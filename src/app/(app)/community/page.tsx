'use client'

import { useQuery } from 'convex/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '../../../../convex/_generated/api'
import { MessageCircle, TrendingUp, Clock, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatRelativeTime } from '@/lib/utils'
import { NewPostButton } from '@/components/community/new-post-button'
import { useUser } from '@clerk/nextjs'

const CATEGORIES = ['All','Body Care','Dental','Skincare','Hair Care','Feminine',"Men's Care",'General']

export default function CommunityPage() {
  const searchParams = useSearchParams()
  const { isSignedIn } = useUser()
  const tab      = (searchParams.get('tab') ?? 'trending') as 'trending' | 'recent'
  const category = searchParams.get('category') ?? 'All'

  const posts = useQuery(api.community.listPosts, {
    tab,
    category: category !== 'All' ? category : undefined,
    limit: 20,
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-gray-900 mb-1">Community</h1>
          <p className="text-gray-500 text-sm">Ask anything — anonymous by default.</p>
        </div>
        {isSignedIn && <NewPostButton />}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-cream-100 rounded-xl w-fit">
        {(['trending', 'recent'] as const).map(t => (
          <Link key={t} href={`/community?tab=${t}${category !== 'All' ? `&category=${category}` : ''}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <span className="flex items-center gap-1.5">
              {t === 'trending' ? <><TrendingUp className="w-3.5 h-3.5" />Trending</> : <><Clock className="w-3.5 h-3.5" />Recent</>}
            </span>
          </Link>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <Link key={cat} href={`/community?tab=${tab}${cat !== 'All' ? `&category=${encodeURIComponent(cat)}` : ''}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${category === cat ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-cream-200 hover:border-brand-200'}`}>
            {cat}
          </Link>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {posts === undefined && (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse h-24 bg-cream-100 rounded-2xl" />
          ))
        )}
        {posts?.map(post => (
          <Link key={post._id} href={`/community/${post._id}`}>
            <Card hoverable padded={false} className="p-5">
              <p className="text-gray-800 text-sm leading-relaxed mb-3 line-clamp-3">{post.body}</p>
              <div className="flex items-center gap-4 flex-wrap">
                {post.category && <Badge variant="default" className="text-xs">{post.category}</Badge>}
                <span className="flex items-center gap-1 text-xs text-gray-400"><TrendingUp className="w-3 h-3" />{post.voteCount}</span>
                <span className="flex items-center gap-1 text-xs text-gray-400"><MessageCircle className="w-3 h-3" />{post.replyCount}</span>
                <span className="text-xs text-gray-400">{post.isAnonymous ? 'Anonymous' : (post.author?.displayName ?? 'Member')}</span>
                <span className="text-xs text-gray-300 ml-auto">{formatRelativeTime(post.createdAt)}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {posts?.length === 0 && (
        <div className="text-center py-16">
          <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No posts yet. Be the first to ask!</p>
          {isSignedIn && <NewPostButton />}
        </div>
      )}
    </div>
  )
}
