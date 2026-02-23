import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com https://us-assets.i.posthog.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: blob: https:",
          "connect-src 'self' https://ktvomvlweyqxxewuqubw.supabase.co https://www.google-analytics.com https://api.stripe.com https://n8n.goodbreeze.ai https://us.i.posthog.com https://us-assets.i.posthog.com https://app.posthog.com",
          "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
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
