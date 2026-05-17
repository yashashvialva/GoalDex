import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  // Allow network access for local testing (e.g. mobile)
  allowedDevOrigins: ['192.168.0.102'],
};

export default nextConfig;
