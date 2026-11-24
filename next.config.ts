import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  logging: {
    serverFunctions: false,
  },
};

export default nextConfig;
