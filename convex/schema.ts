import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  users: defineTable({
    clerkId:           v.string(),
    email:             v.string(),
    displayName:       v.optional(v.string()),
    avatarUrl:         v.optional(v.string()),
    plan:              v.union(v.literal('free'), v.literal('pro')),
    planExpiresAt:     v.optional(v.number()),
    paddleCustomerId:  v.optional(v.string()),
    preferredLanguage: v.string(),
    createdAt:         v.number(),
    updatedAt:         v.number(),
  })
    .index('by_clerk_id',  ['clerkId'])
    .index('by_email',     ['email'])
    .index('by_paddle_id', ['paddleCustomerId']),

  subscriptions: defineTable({
    userId:               v.id('users'),
    paddleSubscriptionId: v.string(),
    paddleTransactionId:  v.optional(v.string()),
    status: v.union(
      v.literal('active'), v.literal('canceled'),
      v.literal('past_due'), v.literal('paused'), v.literal('trialing'),
    ),
    plan:               v.union(v.literal('monthly'), v.literal('yearly')),
    currentPeriodStart: v.number(),
    currentPeriodEnd:   v.number(),
    cancelAtPeriodEnd:  v.boolean(),
    createdAt:          v.number(),
    updatedAt:          v.number(),
  })
    .index('by_user_id',       ['userId'])
    .index('by_paddle_sub_id', ['paddleSubscriptionId']),

  categories: defineTable({
    name: v.string(), slug: v.string(), icon: v.string(),
    description: v.optional(v.string()), sortOrder: v.number(),
  }).index('by_slug', ['slug']),

  hygieneTips: defineTable({
    title: v.string(), slug: v.string(), excerpt: v.string(),
    body: v.string(), category: v.string(), tags: v.array(v.string()),
    isPremium: v.boolean(), published: v.boolean(),
    coverImageUrl: v.optional(v.string()), readTimeMinutes: v.number(),
    createdAt: v.number(), updatedAt: v.number(),
  })
    .index('by_slug',               ['slug'])
    .index('by_category',           ['category'])
    .index('by_published',          ['published'])
    .index('by_published_category', ['published', 'category'])
    .searchIndex('search_tips', {
      searchField: 'title',
      filterFields: ['category', 'published', 'isPremium'],
    }),

  products: defineTable({
    name: v.string(), brand: v.string(), description: v.string(),
    imageUrl: v.optional(v.string()), affiliateUrl: v.string(),
    category: v.string(), priceUsd: v.number(), currency: v.string(),
    isFeatured: v.boolean(), isPremium: v.boolean(), published: v.boolean(),
    clickCount: v.number(), rating: v.optional(v.number()),
    createdAt: v.number(), updatedAt: v.number(),
  })
    .index('by_category',  ['category'])
    .index('by_published', ['published'])
    .index('by_featured',  ['isFeatured']),

  communityPosts: defineTable({
    userId: v.id('users'), body: v.string(), isAnonymous: v.boolean(),
    voteCount: v.number(), replyCount: v.number(), flagged: v.boolean(),
    flaggedReason: v.optional(v.string()), category: v.optional(v.string()),
    createdAt: v.number(), updatedAt: v.number(),
  })
    .index('by_vote_count', ['voteCount'])
    .index('by_created_at', ['createdAt'])
    .index('by_flagged',    ['flagged'])
    .index('by_category',   ['category'])
    .index('by_user',       ['userId']),

  communityReplies: defineTable({
    postId: v.id('communityPosts'), userId: v.id('users'),
    body: v.string(), isAnonymous: v.boolean(), flagged: v.boolean(),
    createdAt: v.number(), updatedAt: v.number(),
  })
    .index('by_post_id',    ['postId'])
    .index('by_created_at', ['createdAt']),

  postVotes: defineTable({
    postId: v.id('communityPosts'), userId: v.id('users'), createdAt: v.number(),
  })
    .index('by_post_id',       ['postId'])
    .index('by_post_and_user', ['postId', 'userId']),

  affiliateClicks: defineTable({
    productId: v.id('products'), userId: v.optional(v.id('users')),
    sessionId: v.optional(v.string()), ipHash: v.optional(v.string()),
    createdAt: v.number(),
  }).index('by_product_id', ['productId']),
})
