import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Force project root even if Next.js detects a different workspace root
    // due to lockfiles higher up the directory tree.
    root: __dirname,
  },
};

export default nextConfig;
