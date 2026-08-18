import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The dev overlay badge sits bottom-left, right on top of the mobile tab bar.
  devIndicators: false,
  // A production build shares `.next` with a running `next dev` and overwrites the
  // chunks that dev server holds in memory, which breaks every route until `.next`
  // is deleted. Point verification builds at their own directory instead:
  //   NEXT_DIST_DIR=.next-build npx next build
  distDir: process.env['NEXT_DIST_DIR'] ?? '.next',
}

export default nextConfig
