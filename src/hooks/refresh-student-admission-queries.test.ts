import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { refreshStudentAdmissionQueries } from "./refresh-student-admission-queries";

describe("admission save refresh", () => {
  it.each(["create", "update"])(
    "%s refreshes the mounted student alias and high-school profile",
    async (operation) => {
      const client = new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: Infinity } },
      });
      let saved = false;
      const previous = operation === "create" ? null : "old-profile";
      const detail = new QueryObserver(client, {
        queryKey: ["student-360", "HS-001"],
        queryFn: async () => ({ profile: saved ? "new-profile" : previous }),
        initialData: { profile: previous },
      });
      const score = new QueryObserver(client, {
        queryKey: ["student-high-school-score", "HS-001", "2026"],
        queryFn: async () => ({
          admission_profile: saved ? "new-profile" : previous,
        }),
        initialData: { admission_profile: previous },
      });
      const unsubscribeDetail = detail.subscribe(() => {});
      const unsubscribeScore = score.subscribe(() => {});
      saved = true;
      try {
        await refreshStudentAdmissionQueries(client, "student-uuid", "HS-001");
        expect(detail.getCurrentResult().data?.profile).toBe("new-profile");
        expect(score.getCurrentResult().data?.admission_profile).toBe(
          "new-profile",
        );
      } finally {
        unsubscribeDetail();
        unsubscribeScore();
        client.clear();
      }
    },
  );

  it("marks every cached year for this student stale without affecting another student", async () => {
    const client = new QueryClient();
    const affected = [
      ["student-360", "student-uuid"],
      ["student-high-school-score", "student-uuid", "2025"],
      ["student-high-school-score", "student-uuid", "2026"],
      ["student-high-school-score", "HS-001", null],
      ["student-score-context", "HS-001"],
    ];
    for (const key of affected) client.setQueryData(key, { old: true });
    client.setQueryData(["student-360", "other-student"], { old: true });
    client.setQueryData(
      ["student-high-school-score", "other-student", "2026"],
      { old: true },
    );
    try {
      await refreshStudentAdmissionQueries(client, "student-uuid", "HS-001");
      for (const key of affected) {
        expect(client.getQueryState(key)?.isInvalidated, String(key)).toBe(
          true,
        );
      }
      expect(
        client.getQueryState(["student-360", "other-student"])?.isInvalidated,
      ).toBe(false);
      expect(
        client.getQueryState([
          "student-high-school-score",
          "other-student",
          "2026",
        ])?.isInvalidated,
      ).toBe(false);
    } finally {
      client.clear();
    }
  });

  it("waits for the mounted high-school query to receive the new profile", async () => {
    const client = new QueryClient();
    let finish!: (value: { admission_profile: string }) => void;
    const response = new Promise<{ admission_profile: string }>((resolve) => {
      finish = resolve;
    });
    const score = new QueryObserver(client, {
      queryKey: ["student-high-school-score", "student-uuid", "2026"],
      queryFn: () => response,
      initialData: { admission_profile: "old-profile" },
      staleTime: Infinity,
    });
    const unsubscribe = score.subscribe(() => {});
    try {
      const refreshed = refreshStudentAdmissionQueries(client, "student-uuid");
      expect(score.getCurrentResult().fetchStatus).toBe("fetching");
      finish({ admission_profile: "new-profile" });
      await refreshed;
      expect(score.getCurrentResult().data?.admission_profile).toBe(
        "new-profile",
      );
    } finally {
      finish({ admission_profile: "new-profile" });
      unsubscribe();
      client.clear();
    }
  });
});
