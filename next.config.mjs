/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Photos are served from /public today (see docs/ESTIMATES.md - the real reference
    // images could not be downloaded while the checkpoint blocks the site). When they
    // land, either drop them into /public/photos or add the CDN host here.
    remotePatterns: [],
  },
};
export default nextConfig;
