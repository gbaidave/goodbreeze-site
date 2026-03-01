import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/account',
          '/api/',
          '/login',
          '/signup',
          '/forgot-password',
          '/forgot-password/by-phone',
          '/reset-password',
          '/auth/',
          '/reports/competitive-analyzer',
          '/reports/ai-seo',
          '/reports/seo-audit',
          '/reports/keyword-research',
          '/reports/landing-page-optimizer',
          '/reports/seo-comprehensive',
        ],
      },
    ],
    sitemap: 'https://goodbreeze.ai/sitemap.xml',
  }
}
