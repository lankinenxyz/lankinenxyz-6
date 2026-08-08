import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Notion images are proxied through /api/notion-image, which only serves pages our own
    // integration can read. `search` is left open because the id and version vary per image.
    localPatterns: [{ pathname: "/api/notion-image" }],
    minimumCacheTTL: 2678400,
  },
};

export default nextConfig;
