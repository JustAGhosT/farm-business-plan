/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to enable dynamic Next.js features and API routes
  images: {
    // Keep images unoptimized for Netlify compatibility
    unoptimized: true,
  },
}

module.exports = nextConfig
