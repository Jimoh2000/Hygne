import { v } from 'convex/values'
import { internalMutation, query } from './_generated/server'
import { now } from './helpers'

export const upsertSubscription = internalMutation({
  args: {
    userId:               v.id('users'),
    paddleSubscriptionId: v.string(),
    paddleTransactionId:  v.optional(v.string()),
    status:               v.union(
      v.literal('active'), v.literal('canceled'),
      v.literal('past_due'), v.literal('paused'), v.literal('trialing'),
    ),
    plan:               v.union(v.literal('monthly'), v.literal('yearly')),
    currentPeriodStart: v.number(),
    currentPeriodEnd:   v.number(),
    cancelAtPeriodEnd:  v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('subscriptions')
      .withIndex('by_paddle_sub_id', q =>
        q.eq('paddleSubscriptionId', args.paddleSubscriptionId)
      )
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt: now() })
    } else {
      await ctx.db.insert('subscriptions', { ...args, createdAt: now(), updatedAt: now() })
    }
  },
})

export const cancelSubscription = internalMutation({
  args: { paddleSubscriptionId: v.string() },
  handler: async (ctx, { paddleSubscriptionId }) => {
    const sub = await ctx.db
      .query('subscriptions')
      .withIndex('by_paddle_sub_id', q => q.eq('paddleSubscriptionId', paddleSubscriptionId))
      .unique()
    if (sub) {
      await ctx.db.patch(sub._id, { status: 'canceled', updatedAt: now() })
    }
  },
})
