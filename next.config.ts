import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serve from /ssh/ path instead of root
  basePath: '/ssh',
  // Enable static export for deployment
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Configure for client-side only app
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Modern Node.js LTS optimizations
  experimental: {
    optimizePackageImports: ['@xterm/xterm', 'lucide-react']
  }
};

export default nextConfig;
