import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getApiUrl,
  isNestApiEnabled,
  nestRequest,
  NestApiError,
  notMigrated,
  toServiceError,
} from "./nest-client";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://localhost:3001/");
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

describe("getApiUrl", () => {
  it("returns the configured origin without a trailing slash", () => {
    expect(getApiUrl()).toBe("http://localhost:3001");
    expect(isNestApiEnabled()).toBe(true);
  });

  it("fails with a configuration error when the origin is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "");
    expect(isNestApiEnabled()).toBe(false);
    expect(() => getApiUrl()).toThrowError(
      expect.objectContaining({ status: 503, code: "API_URL_MISSING" }),
    );
  });
});

describe("nestRequest", () => {
  it("sends credentials and builds the query string", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));

    await nestRequest("/api/v1/items", { query: { page: 2, q: "", skip: null } });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("http://localhost:3001/api/v1/items?page=2");
    expect(init).toMatchObject({ method: "GET", credentials: "include" });
  });

  it("sends JSON bodies with a content type and FormData without one", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));

    await nestRequest("/api/v1/items", { method: "POST", body: { a: 1 } });
    await nestRequest("/api/v1/files", {
      method: "POST",
      body: new FormData(),
    });

    const [, json] = fetchMock.mock.calls[0]!;
    const [, form] = fetchMock.mock.calls[1]!;
    expect(json.headers["Content-Type"]).toBe("application/json");
    expect(json.body).toBe('{"a":1}');
    expect(form.headers["Content-Type"]).toBeUndefined();
  });

  it("resolves null for 204", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    await expect(nestRequest("/api/v1/items/1", { method: "DELETE" })).resolves
      .toBeNull();
  });

  it("surfaces the backend error code and message", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: { code: "FORBIDDEN", message: "Không có quyền" } }, 403),
    );
    await expect(nestRequest("/api/v1/items")).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN",
      message: "Không có quyền",
    });
  });

  it("maps a network failure to 503 API_UNAVAILABLE", async () => {
    fetchMock.mockRejectedValue(new TypeError("offline"));
    await expect(nestRequest("/api/v1/items")).rejects.toMatchObject({
      status: 503,
      code: "API_UNAVAILABLE",
    });
  });
});

describe("toServiceError", () => {
  class ServiceError extends Error {
    constructor(
      public status: number,
      public code: string,
      message: string,
    ) {
      super(message);
    }
  }

  it("rewraps Nest errors and keeps status, code and message", () => {
    const result = toServiceError(new NestApiError(409, "STALE", "Cũ"), ServiceError);
    expect(result).toBeInstanceOf(ServiceError);
    expect(result).toMatchObject({ status: 409, code: "STALE", message: "Cũ" });
  });

  it("passes other errors through untouched", () => {
    const original = new Error("boom");
    expect(toServiceError(original, ServiceError)).toBe(original);
  });
});

describe("notMigrated", () => {
  it("throws the 501 feature error", () => {
    expect(() => notMigrated()).toThrowError(
      expect.objectContaining({ status: 501, code: "FEATURE_NOT_MIGRATED" }),
    );
  });
});
