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
          '/reset-password',
          '/auth/',
          '/tools/sales-analyzer',
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
