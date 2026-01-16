import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  htmlLimitedBots: /.*/, // disable streaming metadata
};

export default nextConfig;
