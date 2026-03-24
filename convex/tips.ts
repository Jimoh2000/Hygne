import { v } from 'convex/values'
import { query } from './_generated/server'
import { getOptionalUser } from './helpers'

export const list = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, { category }) => {
    let tips = category
      ? await ctx.db
          .query('hygieneTips')
          .withIndex('by_published_category', q =>
            q.eq('published', true).eq('category', category)
          )
          .order('desc')
          .collect()
      : await ctx.db
          .query('hygieneTips')
          .withIndex('by_published', q => q.eq('published', true))
          .order('desc')
          .collect()

    return tips
  },
})

export const search = query({
  args: { query: v.string(), category: v.optional(v.string()) },
  handler: async (ctx, { query: searchQuery, category }) => {
    if (!searchQuery.trim()) return []
    const results = await ctx.db
      .query('hygieneTips')
      .withSearchIndex('search_tips', q => {
        let base = q.search('title', searchQuery).eq('published', true)
        return category ? base.eq('category', category) : base
      })
      .take(20)
    return results
  },
})

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return ctx.db
      .query('hygieneTips')
      .withIndex('by_slug', q => q.eq('slug', slug))
      .unique()
  },
})

export const getRelated = query({
  args: { category: v.string(), excludeId: v.id('hygieneTips') },
  handler: async (ctx, { category, excludeId }) => {
    const tips = await ctx.db
      .query('hygieneTips')
      .withIndex('by_published_category', q =>
        q.eq('published', true).eq('category', category)
      )
      .filter(q => q.neq(q.field('_id'), excludeId))
      .take(3)
    return tips
  },
})

export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 4 }) => {
    return ctx.db
      .query('hygieneTips')
      .withIndex('by_published', q => q.eq('published', true))
      .order('desc')
      .take(limit)
  },
})

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const tips = await ctx.db.query('hygieneTips').withIndex('by_published', q => q.eq('published', true)).collect()
    return { total: tips.length }
  },
})
