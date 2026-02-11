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
};

export default nextConfig;
