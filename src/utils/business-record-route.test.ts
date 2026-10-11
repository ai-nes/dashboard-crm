import { describe, expect, it } from "vitest";

import {
  getBusinessRouteKey,
  getCanonicalBusinessRouteUrl,
} from "./business-record-route";

describe("business record routes", () => {
  it("prefers a real business code and falls back to the internal id", () => {
    expect(getBusinessRouteKey(" HS-2026-0001 ", "student-uuid")).toBe(
      "HS-2026-0001",
    );
    expect(getBusinessRouteKey("", "student-uuid")).toBe("student-uuid");
    expect(
      getBusinessRouteKey(
        "8f2d69d0-1795-4c52-a94a-e77c9ef64918",
        "internal-id",
      ),
    ).toBe("internal-id");
  });

  it("canonicalizes an old id URL while preserving query and hash", () => {
    expect(
      getCanonicalBusinessRouteUrl(
        "/director/students/8f2d69d0-1795-4c52-a94a-e77c9ef64918",
        "8f2d69d0-1795-4c52-a94a-e77c9ef64918",
        "HS 2026/001",
        "?tab=activities&taskId=task-1",
        "#timeline",
      ),
    ).toBe(
      "/director/students/HS%202026%2F001?tab=activities&taskId=task-1#timeline",
    );
  });

  it("leaves a business-code URL or a missing-code URL unchanged", () => {
    expect(
      getCanonicalBusinessRouteUrl(
        "/director/students/HS-2026-0001",
        "HS-2026-0001",
        "HS-2026-0001",
      ),
    ).toBeNull();
    expect(
      getCanonicalBusinessRouteUrl(
        "/director/students/student-uuid",
        "student-uuid",
        "",
      ),
    ).toBeNull();
  });
});
