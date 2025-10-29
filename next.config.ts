import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Silence "inferred workspace root" by explicitly setting the root to this project
    root: __dirname,
  },
};

export default nextConfig;
