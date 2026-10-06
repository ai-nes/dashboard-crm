import { afterEach, describe, expect, it } from "vitest";
import nextConfig from "./next.config";

const originalBackendUrl = process.env.CRM_BACKEND_INTERNAL_URL;

afterEach(() => {
  if (originalBackendUrl === undefined) {
    delete process.env.CRM_BACKEND_INTERNAL_URL;
  } else {
    process.env.CRM_BACKEND_INTERNAL_URL = originalBackendUrl;
  }
});

describe("CRM backend auth rewrite", () => {
  it("proxies the browser same-origin auth path to the private backend", async () => {
    process.env.CRM_BACKEND_INTERNAL_URL = "http://127.0.0.1:3001/";

    await expect(nextConfig.rewrites?.()).resolves.toEqual([
      {
        source: "/api/auth/:path*",
        destination: "http://127.0.0.1:3001/api/auth/:path*",
      },
    ]);
  });

  it("does not install a rewrite when the backend is not configured", async () => {
    delete process.env.CRM_BACKEND_INTERNAL_URL;

    await expect(nextConfig.rewrites?.()).resolves.toEqual([]);
  });

  it("rejects a non-origin or credentialed backend URL", async () => {
    process.env.CRM_BACKEND_INTERNAL_URL =
      "http://user:pass@127.0.0.1:3001/api";

    await expect(nextConfig.rewrites?.()).rejects.toThrow(
      "CRM_BACKEND_INTERNAL_URL must be an HTTP(S) origin without credentials or a path.",
    );
  });
});
