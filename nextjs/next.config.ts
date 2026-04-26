import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // v10: raise API body limit so multipart PDF uploads up to 25 MB pass
    // (CamScanner scans of real officer case files are 8-25 MB)
    serverActions: {
      bodySizeLimit: '25mb',
    },
  },
};

export default nextConfig;
