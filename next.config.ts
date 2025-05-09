import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Handle .mjs files
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });

    // Handle GLB files
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: "asset/resource",
    });

    return config;
  },
  // Allow importing from outside the src directory
  experimental: {
    externalDir: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
