import { QueryCtx, MutationCtx } from './_generated/server'
import { ConvexError } from 'convex/values'

export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw new ConvexError('Not authenticated')
  const user = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique()
  if (!user) throw new ConvexError('User profile not found')
  return user
}

export async function getOptionalUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) return null
  return ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique()
}

export async function requirePro(ctx: QueryCtx | MutationCtx) {
  const user = await getAuthenticatedUser(ctx)
  if (user.plan !== 'pro') throw new ConvexError('Pro subscription required')
  return user
}

export function now() { return Date.now() }
