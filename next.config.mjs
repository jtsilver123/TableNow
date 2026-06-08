/** @type {import('next').NextConfig} */

// When deployed to GitHub Pages the site lives under /<repo-name>, so we need a
// basePath. The deploy workflow sets NEXT_PUBLIC_BASE_PATH to the repo name
// automatically; locally it's empty so the app serves from "/".
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  reactStrictMode: true,
  // Emit a fully static site (out/) — works on GitHub Pages with no server.
  output: "export",
  basePath,
  // GitHub Pages serves /route/ as /route/index.html.
  trailingSlash: true,
  // No image optimization server on static hosts.
  images: { unoptimized: true },
  // Expose basePath to client code that needs to build absolute asset URLs.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
