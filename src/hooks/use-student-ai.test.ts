import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  useStudentAi,
  useStudentAnalysis,
  useStudentMemory,
} from "./use-student-ai";

const mocks = vi.hoisted(() => ({
  data: undefined as unknown,
  mutation: undefined as unknown as { mutationFn: () => unknown },
  request: vi.fn(),
  mutate: vi.fn(),
  query: vi.fn(),
  invalidate: vi.fn(),
  effect: undefined as unknown as () => void,
}));
vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  useEffect: (effect: () => void) => {
    mocks.effect = effect;
  },
}));
vi.mock("@tanstack/react-query", () => ({
  useQuery: (options: unknown) => {
    mocks.query(options);
    return { data: mocks.data };
  },
  useQueryClient: () => ({ invalidateQueries: mocks.invalidate }),
  useMutation: (options: { mutationFn: () => unknown }) => {
    mocks.mutation = options;
    return { isPending: false, mutate: mocks.mutate };
  },
}));
vi.mock("@/services/api/student-ai", () => ({
  requestStudentAnalysis: mocks.request,
  listStudentMemory: vi.fn(),
}));
vi.mock("@/services/api/student-ai/to-analysis-run", () => ({
  toAnalysisRun: () => null,
}));

describe("shared student analysis request", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.data = undefined;
  });
  it("forces a fresh NBA and insight when the user analyzes again", () => {
    mocks.data = {
      state: "idle",
      analysis: { nba: { disposition: "NO_ACTION" } },
    };
    useStudentAnalysis("STUDENT-1");
    mocks.mutation.mutationFn();
    expect(mocks.request).toHaveBeenCalledWith("STUDENT-1", true);
  });
  it("uses the normal first analysis when no result exists", () => {
    useStudentAnalysis("STUDENT-1");
    mocks.mutation.mutationFn();
    expect(mocks.request).toHaveBeenCalledWith("STUDENT-1", false);
  });
  it("does not queue another request while analysis is running", () => {
    mocks.data = { state: "running" };
    useStudentAnalysis("STUDENT-1").request();
    expect(mocks.mutate).not.toHaveBeenCalled();
  });
  it("does not queue or execute a request without permission", () => {
    useStudentAnalysis("STUDENT-1", { canRequest: false }).request();
    expect(mocks.mutate).not.toHaveBeenCalled();
    expect(() => mocks.mutation.mutationFn()).toThrow("không có quyền");
  });
  it("does not fetch memory while its tab or read access is disabled", () => {
    useStudentMemory("STUDENT-1", false);
    expect(mocks.query).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false }),
    );
  });
  it("refreshes profile and score history when the completed analysis has a score, including zero", () => {
    mocks.data = {
      state: "idle",
      potential_score: 0,
      analysis: { generated_at: "2026-10-15T00:00:00Z" },
    };
    useStudentAi("STUDENT-1");
    mocks.effect();
    expect(mocks.invalidate).toHaveBeenCalledWith({
      queryKey: ["student-360"],
    });
    expect(mocks.invalidate).toHaveBeenCalledWith({
      queryKey: ["student-score-context"],
    });
  });
  it("does not refresh scores for an unfinished or unscored analysis", () => {
    mocks.data = { state: "running", analysis: null };
    useStudentAi("STUDENT-1");
    mocks.effect();
    expect(mocks.invalidate).not.toHaveBeenCalled();
  });
});
