import { v } from 'convex/values'
import { query, mutation } from './_generated/server'
import { getOptionalUser, now } from './helpers'

export const list = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, { category }) => {
    const all = await ctx.db.query('products').withIndex('by_published', q => q.eq('published', true)).order('desc').collect()
    return category ? all.filter(p => p.category === category) : all
  },
})

export const getById = query({
  args: { id: v.id('products') },
  handler: async (ctx, { id }) => {
    const product = await ctx.db.get(id)
    return product?.published ? product : null
  },
})

export const getFeatured = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 3 }) => {
    return ctx.db.query('products').withIndex('by_featured', q => q.eq('isFeatured', true)).filter(q => q.eq(q.field('published'), true)).take(limit)
  },
})

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query('products').withIndex('by_published', q => q.eq('published', true)).collect()
    return { total: products.length }
  },
})

export const getRelated = query({
  args: { category: v.string(), excludeId: v.id('products') },
  handler: async (ctx, { category, excludeId }) => {
    return ctx.db.query('products').withIndex('by_category', q => q.eq('category', category)).filter(q => q.and(q.neq(q.field('_id'), excludeId), q.eq(q.field('published'), true))).take(3)
  },
})

export const trackClick = mutation({
  args: { productId: v.id('products'), ipHash: v.optional(v.string()), sessionId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getOptionalUser(ctx)
    await ctx.db.insert('affiliateClicks', { productId: args.productId, userId: user?._id, ipHash: args.ipHash, sessionId: args.sessionId, createdAt: now() })
    const product = await ctx.db.get(args.productId)
    if (product) await ctx.db.patch(args.productId, { clickCount: product.clickCount + 1, updatedAt: now() })
  },
})
