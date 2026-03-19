import type { NextConfig } from "next";

// Resolve environment-specific variable names (PRODUCTION/STAGING) to the
// canonical names the codebase uses. Vercel sets exactly one of each pair
// per environment — _PRODUCTION on production deploys, _STAGING on preview.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_PRODUCTION || process.env.NEXT_PUBLIC_SUPABASE_URL_STAGING || ''
const isStaging = process.env.NEXT_PUBLIC_SITE_ENV === 'staging'

const nextConfig: NextConfig = {
  env: {
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL:      supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PRODUCTION || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING || '',
    SUPABASE_SERVICE_ROLE_KEY:     process.env.SUPABASE_SERVICE_ROLE_KEY_PRODUCTION     || process.env.SUPABASE_SERVICE_ROLE_KEY_STAGING     || '',

    // Site URL
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL_PRODUCTION || process.env.NEXT_PUBLIC_SITE_URL_STAGING || '',

    // Stripe — keys and webhook secret
    STRIPE_SECRET_KEY:     process.env.STRIPE_SECRET_KEY_PRODUCTION     || process.env.STRIPE_SECRET_KEY_STAGING     || '',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET_PRODUCTION || process.env.STRIPE_WEBHOOK_SECRET_STAGING || '',

    // Stripe price IDs
    STRIPE_STARTER_PLAN_PRICE_ID: process.env.STRIPE_STARTER_PLAN_PRICE_ID_PRODUCTION || process.env.STRIPE_STARTER_PLAN_PRICE_ID_STAGING || '',
    STRIPE_GROWTH_PLAN_PRICE_ID:  process.env.STRIPE_GROWTH_PLAN_PRICE_ID_PRODUCTION  || process.env.STRIPE_GROWTH_PLAN_PRICE_ID_STAGING  || '',
    STRIPE_PRO_PLAN_PRICE_ID:     process.env.STRIPE_PRO_PLAN_PRICE_ID_PRODUCTION     || process.env.STRIPE_PRO_PLAN_PRICE_ID_STAGING     || '',
    STRIPE_BOOST_PACK_PRICE_ID:   process.env.STRIPE_BOOST_PACK_PRICE_ID_PRODUCTION   || process.env.STRIPE_BOOST_PACK_PRICE_ID_STAGING   || '',
    STRIPE_SPARK_PACK_PRICE_ID:   process.env.STRIPE_SPARK_PACK_PRICE_ID_PRODUCTION   || process.env.STRIPE_SPARK_PACK_PRICE_ID_STAGING   || '',

    // Stripe publishable key
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PRODUCTION || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_STAGING || '',

    // Turnstile (fallback to original name until Vercel vars are renamed)
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY_PRODUCTION || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY_STAGING || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '',
    TURNSTILE_SECRET_KEY:           process.env.TURNSTILE_SECRET_KEY_PRODUCTION           || process.env.TURNSTILE_SECRET_KEY_STAGING           || process.env.TURNSTILE_SECRET_KEY           || '',

    // Testimonial videos folder (fallback to original name until Vercel vars are renamed)
    TESTIMONIAL_VIDEOS_FOLDER_ID: process.env.TESTIMONIAL_VIDEOS_FOLDER_ID_PRODUCTION || process.env.TESTIMONIAL_VIDEOS_FOLDER_ID_STAGING || process.env.TESTIMONIAL_VIDEOS_FOLDER_ID || '',

    // PostHog (fallback to original name — currently All Environments)
    NEXT_PUBLIC_POSTHOG_KEY:  process.env.NEXT_PUBLIC_POSTHOG_KEY_PRODUCTION  || process.env.NEXT_PUBLIC_POSTHOG_KEY_STAGING  || process.env.NEXT_PUBLIC_POSTHOG_KEY  || '',
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST_PRODUCTION || process.env.NEXT_PUBLIC_POSTHOG_HOST_STAGING || process.env.NEXT_PUBLIC_POSTHOG_HOST || '',
  },

  /* config options here */
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Disable HTML minification for readable source code
  ...( process.env.NODE_ENV !== "production" && {
    productionBrowserSourceMaps: false,
  }),

  // Security headers — applied to all routes
  async headers() {
    const securityHeaders = [
      // Prevent clickjacking
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      // Stop MIME type sniffing
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      // Referrer policy — send origin only on cross-site requests
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      // Permissions policy — disable unused browser features
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
      // XSS protection (legacy browsers)
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      // HSTS — force HTTPS for 1 year, include subdomains
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
      // Content Security Policy
      // Note: 'unsafe-inline' needed for Framer Motion inline styles + GTM; tighten post-launch
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com https://us-assets.i.posthog.com https://challenges.cloudflare.com${isStaging ? ' https://vercel.live' : ''}`,
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: blob: https:",
          `connect-src 'self' ${supabaseUrl} https://www.google-analytics.com https://api.stripe.com https://n8n.goodbreeze.ai https://us.i.posthog.com https://us-assets.i.posthog.com https://app.posthog.com https://www.googleapis.com${isStaging ? ' https://vercel.live' : ''}`,
          "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://challenges.cloudflare.com",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "upgrade-insecure-requests",
        ].join('; '),
      },
    ];

    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  // 301 redirects from old WordPress site (goodbreeze.ai) to new URLs
  async redirects() {
    return [
      // /tools → /reports (URL rename — ACC3-K)
      { source: '/tools', destination: '/reports', permanent: true },
      { source: '/tools/:path*', destination: '/reports/:path*', permanent: true },
      // Route renames — old URL → new URL
      { source: '/tools/sales-analyzer', destination: '/reports/competitive-analyzer', permanent: true },

      // Trailing slash → no trailing slash (WordPress used trailing slashes)
      { source: '/about/', destination: '/about', permanent: true },
      { source: '/services/', destination: '/services', permanent: true },
      { source: '/contact/', destination: '/contact', permanent: true },
      { source: '/terms-of-use/', destination: '/terms-of-use', permanent: true },
      { source: '/privacy-policy/', destination: '/privacy-policy', permanent: true },

      // Old slugs → new destinations
      { source: '/close-clients', destination: '/services', permanent: true },
      { source: '/close-clients/', destination: '/services', permanent: true },

      // WordPress junk → homepage
      { source: '/hello-world', destination: '/', permanent: true },
      { source: '/hello-world/', destination: '/', permanent: true },
      { source: '/category/uncategorized', destination: '/', permanent: true },
      { source: '/category/uncategorized/', destination: '/', permanent: true },
      { source: '/category/:slug', destination: '/', permanent: true },
      { source: '/author/:slug', destination: '/', permanent: true },
      { source: '/tag/:slug', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
