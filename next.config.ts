import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.117"],
  async rewrites() {
    const configuredUrl = process.env.CRM_BACKEND_INTERNAL_URL?.trim();
    if (!configuredUrl) return [];

    const backendUrl = new URL(configuredUrl);
    if (
      !["http:", "https:"].includes(backendUrl.protocol) ||
      backendUrl.pathname !== "/" ||
      backendUrl.search ||
      backendUrl.hash ||
      backendUrl.username ||
      backendUrl.password
    ) {
      throw new Error(
        "CRM_BACKEND_INTERNAL_URL must be an HTTP(S) origin without credentials or a path.",
      );
    }

    return [
      {
        source: "/api/auth/:path*",
        destination: `${backendUrl.origin}/api/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
