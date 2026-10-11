import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCanonicalBusinessRoute } from "./use-canonical-business-route";

const replace = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("react", () => ({ useEffect: (effect: () => void) => effect() }));

describe("canonical business route navigation", () => {
  beforeEach(() => {
    replace.mockClear();
    vi.stubGlobal("window", {
      location: {
        pathname: "/director/leads/old-id",
        search: "?tab=log",
        hash: "#event",
      },
    });
  });
  it("replaces a legacy link and keeps its query, anchor and scroll", () => {
    useCanonicalBusinessRoute("old-id", "LD-2026-HCM-003978");
    expect(replace).toHaveBeenCalledWith(
      "/director/leads/LD-2026-HCM-003978?tab=log#event",
      { scroll: false },
    );
  });
  it("waits for a real code and avoids changing a different route", () => {
    useCanonicalBusinessRoute("old-id", undefined);
    useCanonicalBusinessRoute("another-id", "LD-2026-HCM-003978");
    expect(replace).not.toHaveBeenCalled();
  });
});
