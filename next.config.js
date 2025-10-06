// next.config.mjs
// ES module configuration for Next.js to enable static export for deployment on static hosts like Render.
// Renamed from .js to .mjs to use native ES module syntax, resolving the TypeScript CommonJS warning (ts(80001)).

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enables static export mode, generating the 'out' directory required by Render.
  output: 'export',

  // Adds trailing slashes to routes (e.g., /about/ instead of /about) to avoid 404s in static hosting.
  trailingSlash: true,

  // Disables Next.js image optimization since static exports don't support the image server.
  // Use external CDNs or pre-optimized images if needed.
  images: {
    unoptimized: true,
  },

  // Optional: Skip unnecessary checks for cleaner builds (e.g., during CI/CD).
  // This ignores ESLint/TypeScript errors only in production builds, not development.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

// Export as default for ES module compatibility—Next.js will import this correctly.
export default nextConfig;