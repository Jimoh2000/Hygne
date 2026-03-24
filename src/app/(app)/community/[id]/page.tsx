'use client'

import { useQuery } from 'convex/react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '../../../../../convex/_generated/api'
import { Id } from '../../../../../convex/_generated/dataModel'
import { ArrowLeft, MessageCircle, Flag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { formatRelativeTime } from '@/lib/utils'
import { VoteButton } from '@/components/community/vote-button'
import { ReplyForm } from '@/components/community/reply-form'
import { useUser } from '@clerk/nextjs'

export default function PostPage() {
  const { id }        = useParams<{ id: string }>()
  const { isSignedIn } = useUser()

  const post    = useQuery(api.community.getPost,    { id: id as Id<'communityPosts'> })
  const replies = useQuery(api.community.listReplies, { postId: id as Id<'communityPosts'> })

  if (post === undefined) return <div className="animate-pulse h-96 bg-cream-100 rounded-2xl" />
  if (post === null) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Post not found or removed.</p>
      <Link href="/community" className="text-brand-600 text-sm hover:underline mt-2 block">Back to community</Link>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <Link href="/community" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors">
        <ArrowLeft className="w-4 h-4" />Back to community
      </Link>

      <Card>
        {post.category && <div className="mb-3"><Badge variant="default">{post.category}</Badge></div>}
        <div className="flex items-center gap-2.5 mb-4">
          <Avatar name={post.isAnonymous ? 'Anonymous' : (post.author?.displayName ?? 'Member')} size="sm" />
          <div>
            <p className="text-sm font-medium text-gray-800">{post.isAnonymous ? 'Anonymous' : (post.author?.displayName ?? 'Member')}</p>
            <p className="text-xs text-gray-400">{formatRelativeTime(post.createdAt)}</p>
          </div>
        </div>
        <p className="text-gray-800 leading-relaxed mb-5">{post.body}</p>
        <div className="flex items-center gap-4 pt-4 border-t border-cream-100">
          <VoteButton postId={id as Id<'communityPosts'>} initialCount={post.voteCount} hasVoted={post.hasVoted} isLoggedIn={!!isSignedIn} />
          <span className="flex items-center gap-1.5 text-sm text-gray-400">
            <MessageCircle className="w-4 h-4" />{post.replyCount} replies
          </span>
        </div>
      </Card>

      <section>
        <h2 className="font-serif text-xl text-gray-900 mb-4">
          {post.replyCount} {post.replyCount === 1 ? 'reply' : 'replies'}
        </h2>
        <div className="space-y-3">
          {replies?.map(reply => (
            <Card key={reply._id} padded={false} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Avatar name={reply.isAnonymous ? 'Anonymous' : (reply.author?.displayName ?? 'Member')} size="xs" />
                <p className="text-xs font-medium text-gray-600">{reply.isAnonymous ? 'Anonymous' : (reply.author?.displayName ?? 'Member')}</p>
                <p className="text-xs text-gray-300 ml-auto">{formatRelativeTime(reply.createdAt)}</p>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{reply.body}</p>
            </Card>
          ))}
        </div>

        {isSignedIn ? (
          <div className="mt-6"><ReplyForm postId={id as Id<'communityPosts'>} /></div>
        ) : (
          <div className="mt-6 p-5 rounded-2xl bg-cream-50 border border-cream-200 text-center">
            <p className="text-sm text-gray-600 mb-3">
              <Link href="/sign-in" className="text-brand-600 font-medium hover:underline">Sign in</Link>
              {' '}or{' '}
              <Link href="/sign-up" className="text-brand-600 font-medium hover:underline">create an account</Link>
              {' '}to reply
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
