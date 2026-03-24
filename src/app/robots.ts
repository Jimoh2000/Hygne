import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hgyne.com'
  return {
    rules: [
      {
        userAgent: '*',
        allow:    '/',
        disallow: ['/api/', '/dashboard', '/settings', '/profile'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
