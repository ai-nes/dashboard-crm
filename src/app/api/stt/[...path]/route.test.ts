import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { NextRequest } from "next/server";

import { GET, POST } from "./route";

const request = new Request("http://localhost/api/stt") as unknown as NextRequest;

function context(path: string[]) {
  return { params: Promise.resolve({ path }) };
}

describe("STT dashboard proxy", () => {
  beforeEach(() => {
    vi.stubEnv("STT_BASE_URL", "https://stt.faip.pro");
    vi.stubEnv("STT_API_SECRET", "test-secret");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("injects the server-only secret when forwarding a status request", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ status: "COMPLETED" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(request, context(["status", "1788077950.625384"]));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "COMPLETED" });
    const target = new URL(String(fetchMock.mock.calls[0][0]));
    expect(target.href).toBe(
      "https://stt.faip.pro/status/1788077950.625384?secret=test-secret",
    );
  });

  it("does not send the secret to the public health endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(request, context(["health"]));

    expect(response.status).toBe(200);
    expect(String(fetchMock.mock.calls[0][0])).toBe("https://stt.faip.pro/health");
  });

  it("does not call the upstream when the secret is missing", async () => {
    vi.stubEnv("STT_API_SECRET", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(request, context(["transcribe", "1788077950.625384"]));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "STT_API_SECRET is not configured" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects unsupported paths and malformed call UUIDs", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const unsupported = await GET(request, context(["playback-url", "1788077950.625384"]));
    const malformed = await POST(request, context(["transcribe", "not-a-call"]));

    expect(unsupported.status).toBe(404);
    expect(malformed.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps the proxy disabled in production unless explicitly enabled", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(request, context(["status", "1788077950.625384"]));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "STT proxy is disabled" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
