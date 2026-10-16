import { afterEach, describe, expect, it, vi } from "vitest";

import { NestApiError } from "../nest/nest-client";
import {
  activationErrorMessage,
  getLicenseStatus,
  isLicenseApiError,
  isLicenseUsable,
} from "./index";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function backendAnswers(status: number, body: unknown) {
  vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://api.test");
  const fetchMock = vi.fn(async () => Response.json(body, { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("license API", () => {
  it("treats only ACTIVE and DISABLED as usable", () => {
    expect(isLicenseUsable("ACTIVE")).toBe(true);
    expect(isLicenseUsable("DISABLED")).toBe(true);
    expect(isLicenseUsable("NOT_ACTIVATED")).toBe(false);
    expect(isLicenseUsable("LICENSE_REVOKED")).toBe(false);
    expect(isLicenseUsable(undefined)).toBe(false);
  });

  it("tells license 403s apart from permission 403s", () => {
    expect(isLicenseApiError({ status: 403, code: "LICENSE_REQUIRED" })).toBe(
      true,
    );
    expect(isLicenseApiError({ status: 403, code: "LEASE_EXPIRED" })).toBe(
      true,
    );
    expect(isLicenseApiError({ status: 403, code: "FORBIDDEN" })).toBe(false);
    expect(isLicenseApiError({ status: 401, code: "LICENSE_REQUIRED" })).toBe(
      false,
    );
  });

  it("reads the backend license status", async () => {
    const fetchMock = backendAnswers(200, { status: "NOT_ACTIVATED" });

    await expect(getLicenseStatus()).resolves.toEqual({
      status: "NOT_ACTIVATED",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/api/v1/license/status",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("does not lock against a backend without the license module", async () => {
    backendAnswers(404, {});

    await expect(getLicenseStatus()).resolves.toEqual({ status: "DISABLED" });
  });

  it("maps activation failures to Vietnamese messages", () => {
    expect(
      activationErrorMessage(
        new NestApiError(401, "INVALID_LICENSE_KEY", "Invalid key."),
      ),
    ).toBe("License key không hợp lệ.");
    expect(
      activationErrorMessage(new NestApiError(500, "SOMETHING", "boom")),
    ).toContain("Kích hoạt thất bại");
  });
});
