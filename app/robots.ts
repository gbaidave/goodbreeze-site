import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // Block all crawlers on staging — prevents duplicate content issues with production
  if (process.env.NEXT_PUBLIC_SITE_ENV === 'staging') {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    }
  }

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
          '/expired-password',
          '/auth/',
          // Admin area
          '/admin',
          // API
          '/api/',
          // Individual report results (auth-required) — NOT the public form pages
          '/reports/business-presence', // auth-gated report viewer (form is on /free-business-presence-report)
          // Not ready to index yet
          '/testimonials',
          '/refund-policy',
          // WordPress artifacts
          '/comments/',
          '/wp-*',
        ],
      },
    ],
    sitemap: 'https://goodbreeze.ai/sitemap.xml',
  }
}
