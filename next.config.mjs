/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fully static site — works on Vercel, Netlify, GitHub Pages, S3, any static host.
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
