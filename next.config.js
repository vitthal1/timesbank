/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // helps catch potential problems
  swcMinify: true,       // faster builds using Next.js compiler
  output: 'export',  // enables static site generation
  // You can add other custom configs here if needed
};

module.exports = nextConfig;