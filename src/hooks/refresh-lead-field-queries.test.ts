import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import {
  refreshLeadFieldQueries,
  leadSaleLeadsKeys,
} from "./use-lead-sale-leads-queries";
import { leadSaleOverviewKeys } from "./use-lead-sale-overview-query";

describe("Lead field save refresh", () => {
  it.each(["create", "update"])(
    "%s refreshes mounted list, detail and overview before resolving",
    async () => {
      const client = new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: Infinity } },
      });
      let finish!: (value: string) => void;
      const response = new Promise<string>((resolve) => {
        finish = resolve;
      });
      const observers = [
        leadSaleLeadsKeys.list(),
        leadSaleLeadsKeys.detail("lead-id"),
        leadSaleOverviewKeys.overview(),
      ].map(
        (queryKey) =>
          new QueryObserver(client, {
            queryKey,
            queryFn: () => response,
            initialData: "old",
          }),
      );
      const subscriptions = observers.map((observer) =>
        observer.subscribe(() => {}),
      );
      try {
        const refreshed = refreshLeadFieldQueries(client);
        for (const observer of observers)
          expect(observer.getCurrentResult().fetchStatus).toBe("fetching");
        finish("saved");
        await refreshed;
        for (const observer of observers)
          expect(observer.getCurrentResult().data).toBe("saved");
      } finally {
        finish("saved");
        subscriptions.forEach((unsubscribe) => unsubscribe());
        client.clear();
      }
    },
  );
});
