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
