import { v } from 'convex/values'
import { mutation, query, internalMutation } from './_generated/server'
import { getAuthenticatedUser, now } from './helpers'

export const upsertFromClerk = internalMutation({
  args: {
    clerkId: v.string(), email: v.string(),
    displayName: v.optional(v.string()), avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query('users').withIndex('by_clerk_id', q => q.eq('clerkId', args.clerkId)).unique()
    if (existing) {
      await ctx.db.patch(existing._id, { email: args.email, displayName: args.displayName, avatarUrl: args.avatarUrl, updatedAt: now() })
      return existing._id
    }
    return ctx.db.insert('users', { clerkId: args.clerkId, email: args.email, displayName: args.displayName, avatarUrl: args.avatarUrl, plan: 'free', preferredLanguage: 'en', createdAt: now(), updatedAt: now() })
  },
})

export const deleteByClerkId = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db.query('users').withIndex('by_clerk_id', q => q.eq('clerkId', clerkId)).unique()
    if (user) await ctx.db.delete(user._id)
  },
})

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null
    return ctx.db.query('users').withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject)).unique()
  },
})

export const updateProfile = mutation({
  args: { displayName: v.optional(v.string()), preferredLanguage: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx)
    await ctx.db.patch(user._id, { ...args, updatedAt: now() })
  },
})

export const upgradeToPro = internalMutation({
  args: { userId: v.id('users'), paddleCustomerId: v.optional(v.string()), planExpiresAt: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { plan: 'pro', planExpiresAt: args.planExpiresAt, paddleCustomerId: args.paddleCustomerId, updatedAt: now() })
  },
})

export const downgradeToFree = internalMutation({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    await ctx.db.patch(userId, { plan: 'free', planExpiresAt: undefined, updatedAt: now() })
  },
})

export const getMySubscription = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null
    const user = await ctx.db.query('users').withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject)).unique()
    if (!user) return null
    return ctx.db.query('subscriptions').withIndex('by_user_id', q => q.eq('userId', user._id)).filter(q => q.or(q.eq(q.field('status'), 'active'), q.eq(q.field('status'), 'trialing'))).first()
  },
})
