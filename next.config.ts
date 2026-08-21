import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Where the pins' own attachments live. Every shop photo in the
        // catalogue is one of these; nothing is stock imagery any more.
        protocol: "https",
        hostname: "cdn-2.matterport.com",
      },
    ],
  },
};

export default nextConfig;
