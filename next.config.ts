import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.aceternity.com",
      },
    ],
  },
};

export default nextConfig;
