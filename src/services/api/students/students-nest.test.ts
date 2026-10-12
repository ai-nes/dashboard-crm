import { afterEach, describe, expect, it, vi } from "vitest";
import { nestDirectorStudents, toNestStudentFilters } from "./students-nest";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});
describe("Student list Nest filters", () => {
  it.each(["assigned", "unassigned", "all", "invalid"])(
    "normalizes assignment status %s for list and export",
    (assignmentStatus) => {
      expect(toNestStudentFilters({ assignmentStatus }).assignmentStatus).toBe(
        assignmentStatus === "assigned" || assignmentStatus === "unassigned"
          ? assignmentStatus
          : undefined,
      );
    },
  );
  it("sends canonical enrollment, province and assignment filters instead of dropping them", async () => {
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://api.test");
    let requested = "";
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      requested = String(input);
      return new Response(
        JSON.stringify({
          data: [],
          meta: {
            total: 0,
            page: 1,
            pageSize: 10,
            totalPages: 1,
            hasNextPage: false,
          },
        }),
      );
    });
    await nestDirectorStudents({
      stage: "New Enter",
      provinceId: "province-id",
      assignmentStatus: "unassigned",
      q: "001234567890",
    });
    const url = new URL(requested);
    expect(url.searchParams.get("stage")).toBe("New Enter");
    expect(url.searchParams.get("provinceId")).toBe("province-id");
    expect(url.searchParams.get("assignmentStatus")).toBe("unassigned");
    expect(url.searchParams.get("q")).toBe("001234567890");
  });
  it("maps New Enter to the enrolled journey and never maps Connected to enrolled", async () => {
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://api.test");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
              id: "one",
              studentCode: "HS-1",
              fullName: "One",
              studentStage: "New Enter",
              owner: "",
              latestScore: null,
            },
            {
              id: "two",
              studentCode: "HS-2",
              fullName: "Two",
              studentStage: "Connected",
              owner: "",
              latestScore: null,
            },
          ],
          meta: {
            total: 2,
            page: 1,
            pageSize: 10,
            totalPages: 1,
            hasNextPage: false,
          },
        }),
      ),
    );
    const result = await nestDirectorStudents();
    expect(result.data[0].stage).toBe("Nhập học");
    expect(result.data[0].lifecycleStatus).toBe("Enrolled");
    expect(result.data[1].stage).not.toBe("Nhập học");
    expect(result.data[1].lifecycleStatus).not.toBe("Enrolled");
  });
});
