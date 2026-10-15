import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStudentAnalysis, useStudentMemory } from "./use-student-ai";

const mocks = vi.hoisted(() => ({
  data: undefined as unknown,
  mutation: undefined as unknown as { mutationFn: () => unknown },
  request: vi.fn(),
  mutate: vi.fn(),
  query: vi.fn(),
}));
vi.mock("@tanstack/react-query", () => ({
  useQuery: (options: unknown) => {
    mocks.query(options);
    return { data: mocks.data };
  },
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
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
});
