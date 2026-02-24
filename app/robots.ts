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
          '/tools/competitive-analyzer',
          '/tools/ai-seo',
          '/tools/seo-audit',
          '/tools/keyword-research',
          '/tools/landing-page-optimizer',
          '/tools/seo-comprehensive',
        ],
      },
    ],
    sitemap: 'https://goodbreeze.ai/sitemap.xml',
  }
}
