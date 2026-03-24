import { MetadataRoute } from 'next'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../convex/_generated/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hgyne.com'
  const convex  = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

  const [tips, products] = await Promise.all([
    convex.query(api.tips.list, {}),
    convex.query(api.products.list, {}),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl,                changeFrequency: 'weekly',  priority: 1,   lastModified: new Date() },
    { url: `${baseUrl}/tips`,      changeFrequency: 'daily',   priority: 0.9, lastModified: new Date() },
    { url: `${baseUrl}/products`,  changeFrequency: 'weekly',  priority: 0.8, lastModified: new Date() },
    { url: `${baseUrl}/community`, changeFrequency: 'hourly',  priority: 0.8, lastModified: new Date() },
  ]

  const tipRoutes: MetadataRoute.Sitemap = (tips ?? [])
    .filter(t => !t.isPremium)
    .map(tip => ({
      url:             `${baseUrl}/tips/${tip.slug}`,
      lastModified:    new Date(tip.updatedAt),
      changeFrequency: 'monthly' as const,
      priority:        0.7,
    }))

  const productRoutes: MetadataRoute.Sitemap = (products ?? []).map(p => ({
    url:             `${baseUrl}/products/${p._id}`,
    lastModified:    new Date(p.updatedAt),
    changeFrequency: 'monthly' as const,
    priority:        0.6,
  }))

  return [...staticRoutes, ...tipRoutes, ...productRoutes]
}
