import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createForbiddenQueryCache,
  getApiErrorStatus,
  isForbiddenApiError,
  redirectToAccessDenied,
} from "./forbidden-redirect";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("forbidden API redirect helpers", () => {
  it("reads the HTTP status from API errors", () => {
    expect(getApiErrorStatus({ status: 403 })).toBe(403);
    expect(getApiErrorStatus({ status: "403" })).toBeNull();
    expect(getApiErrorStatus(new Error("forbidden"))).toBeNull();
  });

  it("recognizes only forbidden API errors", () => {
    expect(isForbiddenApiError({ status: 403 })).toBe(true);
    expect(isForbiddenApiError({ status: 401 })).toBe(false);
    expect(isForbiddenApiError({ status: 500 })).toBe(false);
    expect(isForbiddenApiError(new Error("forbidden"))).toBe(false);
  });

  it("redirects a forbidden query to the access-denied page", async () => {
    const replace = vi.fn();
    vi.stubGlobal("window", { location: { pathname: "/sale", replace } });
    const queryClient = new QueryClient({
      queryCache: createForbiddenQueryCache(),
      defaultOptions: { queries: { retry: false } },
    });

    await expect(
      queryClient.fetchQuery({
        queryKey: ["students"],
        queryFn: async () => {
          throw { status: 403 };
        },
      }),
    ).rejects.toMatchObject({ status: 403 });

    expect(replace).toHaveBeenCalledWith("/access-denied");
    queryClient.clear();
  });

  it("does not redirect when already on the access-denied page", () => {
    const replace = vi.fn();
    vi.stubGlobal("window", {
      location: { pathname: "/access-denied", replace },
    });

    redirectToAccessDenied();

    expect(replace).not.toHaveBeenCalled();
  });
});
