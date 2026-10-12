import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { useStudentProfileUpdate } from "@/app/(with-layouts)/(dashboard)/director/students/_components/use-student-profile-update";

const state = vi.hoisted(() => ({ client: null as QueryClient | null }));
vi.mock("@tanstack/react-query", async () => ({
  ...(await vi.importActual<typeof import("@tanstack/react-query")>(
    "@tanstack/react-query",
  )),
  useQueryClient: () => state.client,
  useMutation: (options: unknown) => options,
}));

describe("profile save refresh", () => {
  it("refreshes the mounted business-code detail after a UUID mutation and invalidates lists/audit", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    state.client = client;
    let persistedName = "Old name";
    const detail = new QueryObserver(client, {
      queryKey: ["student-360", "HS-001"],
      queryFn: async () => ({ name: persistedName }),
      initialData: { name: "Old name" },
    });
    const unsubscribe = detail.subscribe(() => {});
    for (const key of [
      ["director-students", {}],
      ["assigned-students", "sale", {}],
      ["student-audit", "uuid"],
    ])
      client.setQueryData(key, {});
    try {
      persistedName = "Saved name";
      const mutation = useStudentProfileUpdate("student-uuid") as unknown as {
        onSuccess: () => Promise<void>;
      };
      await mutation.onSuccess();
      expect(detail.getCurrentResult().data?.name).toBe("Saved name");
      expect(
        client.getQueryState(["director-students", {}])?.isInvalidated,
      ).toBe(true);
      expect(
        client.getQueryState(["assigned-students", "sale", {}])?.isInvalidated,
      ).toBe(true);
      expect(
        client.getQueryState(["student-audit", "uuid"])?.isInvalidated,
      ).toBe(true);
    } finally {
      unsubscribe();
      client.clear();
    }
  });
});
