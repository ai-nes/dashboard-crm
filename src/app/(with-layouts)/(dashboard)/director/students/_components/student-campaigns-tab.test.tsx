import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StudentCampaignsTab from "./student-campaigns-tab";

const state = vi.hoisted(() => ({
  allowed: true,
  query: {
    data: { data: [], meta: { total: 0, totalPages: 0, hasNextPage: false } },
    isPending: false,
    isError: false,
    isFetching: false,
    error: null,
  } as Record<string, unknown>,
  hook: vi.fn(),
}));
vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => ({ user: {}, isLoading: false }),
}));
vi.mock("@/components/common/auth/permissions", () => ({
  canReadStudentCampaigns: () => state.allowed,
}));
vi.mock("@/hooks/use-student-campaigns-query", () => ({
  useStudentCampaignsQuery: (...args: unknown[]) => {
    state.hook(...args);
    return { ...state.query, refetch: vi.fn() };
  },
}));

beforeEach(() => {
  state.allowed = true;
  state.hook.mockClear();
  state.query = {
    data: { data: [], meta: { total: 0, totalPages: 0, hasNextPage: false } },
    isPending: false,
    isError: false,
    isFetching: false,
    error: null,
  };
});

describe("Student campaign tab states", () => {
  it("hides content and disables fetching for a denied viewer", () => {
    state.allowed = false;
    expect(
      renderToStaticMarkup(<StudentCampaignsTab studentId="s" isActive />),
    ).toBe("");
    expect(state.hook).toHaveBeenCalledWith("s", 1, false);
  });
  it("does not fetch an inactive tab", () => {
    renderToStaticMarkup(
      <StudentCampaignsTab studentId="s" isActive={false} />,
    );
    expect(state.hook).toHaveBeenCalledWith("s", 1, false);
  });
  it("explains empty history", () => {
    expect(
      renderToStaticMarkup(<StudentCampaignsTab studentId="s" isActive />),
    ).toContain("Chưa có chiến dịch được ghi nhận");
    expect(state.hook).toHaveBeenCalledWith("s", 1, true);
  });
  it("shows failures as errors instead of empty data", () => {
    state.query = {
      ...state.query,
      isError: true,
      error: new Error("Network unavailable"),
    };
    const html = renderToStaticMarkup(
      <StudentCampaignsTab studentId="s" isActive />,
    );
    expect(html).toContain('role="alert"');
    expect(html).toContain("Network unavailable");
    expect(html).not.toContain("Chưa có chiến dịch được ghi nhận");
  });
  it("provides page navigation when history exceeds a page", () => {
    state.query = {
      ...state.query,
      data: {
        data: [
          {
            id: "c",
            title: "Campaign",
            status: "ACTIVE",
            registeredAt: "2026-10-11T05:44:33Z",
          },
        ],
        meta: { total: 21, totalPages: 2, hasNextPage: true },
      },
    };
    const html = renderToStaticMarkup(
      <StudentCampaignsTab studentId="s" isActive />,
    );
    expect(html).toContain("Phân trang chiến dịch");
    expect(html).toContain("Trang sau");
  });
});
