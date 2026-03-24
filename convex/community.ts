import { v } from 'convex/values'
import { query, mutation } from './_generated/server'
import { getAuthenticatedUser, getOptionalUser, now } from './helpers'
import { ConvexError } from 'convex/values'

// ── Posts ─────────────────────────────────────────────────────────────────────

export const listPosts = query({
  args: {
    tab:      v.optional(v.union(v.literal('trending'), v.literal('recent'))),
    category: v.optional(v.string()),
    limit:    v.optional(v.number()),
  },
  handler: async (ctx, { tab = 'trending', category, limit = 20 }) => {
    let postsQuery = ctx.db
      .query('communityPosts')
      .filter(q => q.eq(q.field('flagged'), false))

    const posts = tab === 'trending'
      ? await postsQuery.withIndex('by_vote_count').order('desc').take(limit * 2)
      : await postsQuery.withIndex('by_created_at').order('desc').take(limit)

    const filtered = category
      ? posts.filter(p => p.category === category)
      : posts

    const result = filtered.slice(0, limit)

    // Fetch author display names for non-anonymous posts
    const authorIds = [...new Set(result.filter(p => !p.isAnonymous).map(p => p.userId))]
    const authors   = await Promise.all(authorIds.map(id => ctx.db.get(id)))
    const authorMap = Object.fromEntries(
      authors.filter(Boolean).map(a => [a!._id, { displayName: a!.displayName, avatarUrl: a!.avatarUrl }])
    )

    return result.map(post => ({
      ...post,
      author: post.isAnonymous ? null : (authorMap[post.userId] ?? null),
    }))
  },
})

export const getPost = query({
  args: { id: v.id('communityPosts') },
  handler: async (ctx, { id }) => {
    const post = await ctx.db.get(id)
    if (!post || post.flagged) return null

    const user = await getOptionalUser(ctx)
    const hasVoted = user
      ? !!(await ctx.db
          .query('postVotes')
          .withIndex('by_post_and_user', q => q.eq('postId', id).eq('userId', user._id))
          .unique())
      : false

    const author = !post.isAnonymous ? await ctx.db.get(post.userId) : null

    return {
      ...post,
      author: author ? { displayName: author.displayName, avatarUrl: author.avatarUrl } : null,
      hasVoted,
    }
  },
})

export const createPost = mutation({
  args: {
    body:        v.string(),
    isAnonymous: v.boolean(),
    category:    v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.body.length < 10) throw new ConvexError('Post must be at least 10 characters')
    if (args.body.length > 1000) throw new ConvexError('Post cannot exceed 1000 characters')

    const user = await getAuthenticatedUser(ctx)
    return ctx.db.insert('communityPosts', {
      userId:      user._id,
      body:        args.body,
      isAnonymous: args.isAnonymous,
      voteCount:   0,
      replyCount:  0,
      flagged:     false,
      category:    args.category,
      createdAt:   now(),
      updatedAt:   now(),
    })
  },
})

export const flagPost = mutation({
  args: { postId: v.id('communityPosts') },
  handler: async (ctx, { postId }) => {
    await getAuthenticatedUser(ctx) // must be signed in to flag
    await ctx.db.patch(postId, { flagged: true, flaggedReason: 'User reported', updatedAt: now() })
  },
})

// ── Replies ───────────────────────────────────────────────────────────────────

export const listReplies = query({
  args: { postId: v.id('communityPosts') },
  handler: async (ctx, { postId }) => {
    const replies = await ctx.db
      .query('communityReplies')
      .withIndex('by_post_id', q => q.eq('postId', postId))
      .filter(q => q.eq(q.field('flagged'), false))
      .order('asc')
      .collect()

    const authorIds = [...new Set(replies.filter(r => !r.isAnonymous).map(r => r.userId))]
    const authors   = await Promise.all(authorIds.map(id => ctx.db.get(id)))
    const authorMap = Object.fromEntries(
      authors.filter(Boolean).map(a => [a!._id, { displayName: a!.displayName, avatarUrl: a!.avatarUrl }])
    )

    return replies.map(r => ({
      ...r,
      author: r.isAnonymous ? null : (authorMap[r.userId] ?? null),
    }))
  },
})

export const createReply = mutation({
  args: {
    postId:      v.id('communityPosts'),
    body:        v.string(),
    isAnonymous: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (args.body.length < 2)   throw new ConvexError('Reply is too short')
    if (args.body.length > 500) throw new ConvexError('Reply cannot exceed 500 characters')

    const user = await getAuthenticatedUser(ctx)
    const post = await ctx.db.get(args.postId)
    if (!post) throw new ConvexError('Post not found')

    const replyId = await ctx.db.insert('communityReplies', {
      postId:      args.postId,
      userId:      user._id,
      body:        args.body,
      isAnonymous: args.isAnonymous,
      flagged:     false,
      createdAt:   now(),
      updatedAt:   now(),
    })

    // Atomically increment reply count
    await ctx.db.patch(args.postId, {
      replyCount: post.replyCount + 1,
      updatedAt:  now(),
    })

    return replyId
  },
})

// ── Votes ─────────────────────────────────────────────────────────────────────

export const toggleVote = mutation({
  args: { postId: v.id('communityPosts') },
  handler: async (ctx, { postId }) => {
    const user = await getAuthenticatedUser(ctx)
    const post = await ctx.db.get(postId)
    if (!post) throw new ConvexError('Post not found')

    const existing = await ctx.db
      .query('postVotes')
      .withIndex('by_post_and_user', q => q.eq('postId', postId).eq('userId', user._id))
      .unique()

    if (existing) {
      await ctx.db.delete(existing._id)
      await ctx.db.patch(postId, { voteCount: Math.max(0, post.voteCount - 1), updatedAt: now() })
      return { voted: false, count: Math.max(0, post.voteCount - 1) }
    } else {
      await ctx.db.insert('postVotes', { postId, userId: user._id, createdAt: now() })
      await ctx.db.patch(postId, { voteCount: post.voteCount + 1, updatedAt: now() })
      return { voted: true, count: post.voteCount + 1 }
    }
  },
})

// ── Stats ─────────────────────────────────────────────────────────────────────

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query('communityPosts').filter(q => q.eq(q.field('flagged'), false)).collect()
    return { total: posts.length }
  },
})

export const getMyPosts = query({
  args: {},
  handler: async (ctx) => {
    const user = await getOptionalUser(ctx)
    if (!user) return []
    return ctx.db
      .query('communityPosts')
      .withIndex('by_user', q => q.eq('userId', user._id))
      .filter(q => q.eq(q.field('flagged'), false))
      .order('desc')
      .take(10)
  },
})
