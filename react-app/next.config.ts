import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "pdfjs-build-generic": path.resolve(__dirname, "node_modules/pdfjs-build-generic"),
    };
    return config;
  },
};

export default nextConfig;
