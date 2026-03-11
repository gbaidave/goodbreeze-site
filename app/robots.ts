import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Auth & user-only pages
          '/dashboard',
          '/account',
          '/notifications',
          '/support',
          '/welcome',
          // Auth flows
          '/login',
          '/signup',
          '/forgot-password',
          '/forgot-password/by-phone',
          '/reset-password',
          '/auth/',
          // Admin area
          '/admin',
          // API
          '/api/',
          // Report tool forms & individual report results (hub /reports stays crawlable)
          '/reports/',
          // Not ready to index yet
          '/testimonials',
          '/refund-policy',
        ],
      },
    ],
    sitemap: 'https://goodbreeze.ai/sitemap.xml',
  }
}
