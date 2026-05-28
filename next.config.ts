import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "firebasestorage.googleapis.com",
      "eg.jumia.is",
      "www.jumia.com.eg",
      "static.jumia.is",
      "m.media-amazon.com",
      "mcprod.hyperone.com.eg",
      "gourmetegypt.com",
      "cdn.shopify.com",
    ],
  },
};

export default nextConfig;
