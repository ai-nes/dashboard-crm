import { describe, expect, it } from "vitest";

import { interactionIntelligenceKeys } from "./use-interaction-intelligence-queries";

describe("NPS query cache keys", () => {
  it("separates accounts and filter sets so cached private data cannot cross users or filters", () => {
    const allCalls = interactionIntelligenceKeys.npsSummary("user-1", {});
    const otherUser = interactionIntelligenceKeys.npsSummary("user-2", {});
    const filtered = interactionIntelligenceKeys.npsSummary("user-1", {
      from_date: "2026-10-01",
    });

    expect(allCalls).not.toEqual(otherUser);
    expect(allCalls).not.toEqual(filtered);
  });

  it("isolates history by account, Sale and date filters", () => {
    const baseline = interactionIntelligenceKeys.npsHistory("user-1", {});
    expect(baseline).not.toEqual(
      interactionIntelligenceKeys.npsHistory("user-2", {}),
    );
    expect(baseline).not.toEqual(
      interactionIntelligenceKeys.npsHistory("user-1", { sale: "SALE-2" }),
    );
    expect(baseline).not.toEqual(
      interactionIntelligenceKeys.npsHistory("user-1", {
        from_date: "2026-10-01",
        to_date: "2026-10-12",
      }),
    );
  });
});
