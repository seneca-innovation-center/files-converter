import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // webpack: (config) => {
  //   config.module.rules.push({
  //     test: /\.(glb|gltf)$/,
  //     type: "asset/resource",
  //   });
  //   return config;
  // },
  experimental: {
    optimizeCss: false, // disable lightningcss
  },
};

export default nextConfig;
