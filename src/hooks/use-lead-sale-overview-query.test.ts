import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import {
  invalidateLeadSaleOverview,
  leadSaleOverviewKeys,
} from "./use-lead-sale-overview-query";

describe("Lead Sale overview query invalidation", () => {
  it("invalidates every parameterized overview snapshot", async () => {
    const queryClient = new QueryClient();
    const keys = [
      leadSaleOverviewKeys.overview({ admissionYear: 2026 }),
      leadSaleOverviewKeys.overview({ admissionYear: 2025 }),
    ];

    for (const key of keys) {
      queryClient.setQueryData(key, {});
    }

    await invalidateLeadSaleOverview(queryClient);

    for (const key of keys) {
      expect(queryClient.getQueryState(key)?.isInvalidated).toBe(true);
    }

    queryClient.clear();
  });
});
