'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { useRouter } from 'next/navigation'
import { TrendingUp } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import { cn } from '@/lib/utils'

interface VoteButtonProps {
  postId:       Id<'communityPosts'>
  initialCount: number
  hasVoted:     boolean
  isLoggedIn:   boolean
}

export function VoteButton({ postId, initialCount, hasVoted, isLoggedIn }: VoteButtonProps) {
  const [voted, setVoted] = useState(hasVoted)
  const [count, setCount] = useState(initialCount)
  const toggleVote = useMutation(api.community.toggleVote)
  const router     = useRouter()

  async function handleVote() {
    if (!isLoggedIn) { router.push('/sign-in'); return }
    // Optimistic update
    const wasVoted = voted
    setVoted(!wasVoted)
    setCount(c => wasVoted ? c - 1 : c + 1)
    try {
      await toggleVote({ postId })
    } catch {
      // Revert on error
      setVoted(wasVoted)
      setCount(initialCount)
    }
  }

  return (
    <button onClick={handleVote}
      className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border',
        voted ? 'bg-brand-50 text-brand-600 border-brand-200' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600 border-transparent')}>
      <TrendingUp className={cn('w-4 h-4', voted && 'fill-brand-100')} />
      {count}
    </button>
  )
}
