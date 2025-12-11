/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static HTML export for traditional hosting (Namecheap, etc.)
  output: 'export',
  
  // Disable image optimization (not available in static export)
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
    ],
  },
  
  // Generate trailing slashes for cleaner URLs on static hosts
  trailingSlash: true,
  
  // Base path (if hosting in subdirectory, otherwise leave empty)
  basePath: '',
}

module.exports = nextConfig
