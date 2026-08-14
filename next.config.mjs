/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fully static site — works on Vercel, Netlify, GitHub Pages, S3, any static host.
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  webpack: (config) => {
    // transformers.js (recitation mode) ships Node-only optional deps. Neither
    // is reachable in the browser build, but webpack still tries to resolve
    // them from the inference worker.
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      "onnxruntime-node$": false,
    };
    return config;
  },
};

export default nextConfig;
