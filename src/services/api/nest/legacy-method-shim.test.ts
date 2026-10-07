import { beforeEach, describe, expect, it, vi } from "vitest";
import { NestApiError } from "./nest-client";

const handler = vi.fn();
vi.mock("./nest-method-router", () => ({
  NOT_HANDLED: Symbol.for("not-handled"),
  nestMethodRequest: (...args: unknown[]) => handler(...args),
}));

const { createLegacyFetch } = await import("./legacy-method-shim");
const NOT_HANDLED = Symbol.for("not-handled");

const FRAPPE = "http://frappe.test";

describe("legacy method shim", () => {
  const original = vi.fn();
  const fetchShim = createLegacyFetch(
    original as unknown as typeof fetch,
    FRAPPE,
  );

  beforeEach(() => {
    handler.mockReset();
    original.mockReset();
    original.mockResolvedValue(new Response("{}", { status: 200 }));
  });

  it("answers a handled Frappe method in Frappe's response shape", async () => {
    handler.mockResolvedValue({ rows: [1] });
    const response = await fetchShim(
      `${FRAPPE}/api/method/crm.api.major_catalog.list_majors?search=ai`,
    );
    expect(await response.json()).toEqual({ message: { rows: [1] } });
    expect(handler).toHaveBeenCalledWith(
      "crm.api.major_catalog.list_majors",
      { search: "ai" },
      undefined,
    );
    expect(original).not.toHaveBeenCalled();
  });

  it("passes the JSON body of a write to the handler", async () => {
    handler.mockResolvedValue({ ok: true });
    await fetchShim(`${FRAPPE}/api/method/crm.api.user.create_crm_user`, {
      method: "POST",
      body: JSON.stringify({ email: "a@b.vn" }),
    });
    expect(handler.mock.calls[0]?.[2]).toEqual({ email: "a@b.vn" });
  });

  it("answers 501 instead of reaching Frappe for methods Nest does not serve", async () => {
    handler.mockResolvedValue(NOT_HANDLED);
    const response = await fetchShim(
      `${FRAPPE}/api/method/crm.api.unknown.thing`,
    );
    expect(response.status).toBe(501);
    expect(await response.json()).toMatchObject({
      error: { code: "FEATURE_NOT_MIGRATED" },
    });
    expect(original).not.toHaveBeenCalled();
  });

  it("never touches requests that are not Frappe method calls", async () => {
    await fetchShim("http://localhost:3001/api/v1/me");
    await fetchShim(`${FRAPPE}/api/resource/Note`);
    expect(handler).not.toHaveBeenCalled();
    expect(original).toHaveBeenCalledTimes(2);
  });

  it("turns a Nest error into an error response with the same status", async () => {
    handler.mockRejectedValue(
      new NestApiError(409, "REVISION_CONFLICT", "stale"),
    );
    const response = await fetchShim(`${FRAPPE}/api/method/crm.api.x.y`);
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: { code: "REVISION_CONFLICT", message: "stale" },
    });
  });
});
