import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mock = vi.hoisted(() => ({
  user: null as null | { crm_profile: string; crm_user_id: string },
  summaryQuery: {
    data: undefined as unknown,
    isPending: false,
    isError: false,
    error: undefined as Error | undefined,
    refetch: vi.fn(),
  },
  historyQuery: {
    data: { pages: [] as unknown[] },
    isPending: false,
    isError: false,
    error: undefined as Error | undefined,
    hasNextPage: false,
    isFetchingNextPage: false,
    refetch: vi.fn(),
    fetchNextPage: vi.fn(),
  },
  useSummary: vi.fn(),
  useHistory: vi.fn(),
}));

vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => ({ user: mock.user }),
}));

vi.mock("@/hooks/use-interaction-intelligence-queries", () => ({
  useNpsSaleSummaryQuery: mock.useSummary,
  useNpsHistoryQuery: mock.useHistory,
}));

// Keep filter fields available to these data-contract assertions outside the portal.
vi.mock("./nps-history-filters", () => ({
  default: ({ children }: { children: ReactNode }) => children,
}));

import NpsSaleScoreCard from "./nps-sale-score-card";

describe("NPS dashboard panel", () => {
  beforeEach(() => {
    mock.user = null;
    mock.summaryQuery = {
      data: undefined,
      isPending: false,
      isError: false,
      error: undefined,
      refetch: vi.fn(),
    };
    mock.historyQuery = {
      data: { pages: [] },
      isPending: false,
      isError: false,
      error: undefined,
      hasNextPage: false,
      isFetchingNextPage: false,
      refetch: vi.fn(),
      fetchNextPage: vi.fn(),
    };
    mock.useSummary.mockImplementation(() => mock.summaryQuery);
    mock.useHistory.mockImplementation(() => mock.historyQuery);
  });

  it("renders no NPS controls or data for an unsupported profile and disables both queries", () => {
    mock.user = { crm_profile: "marketing", crm_user_id: "u-1" };

    const html = renderToStaticMarkup(<NpsSaleScoreCard mode="team" />);

    expect(html).toBe("");
    expect(mock.useSummary).toHaveBeenCalledWith({}, false, "u-1");
    expect(mock.useHistory).toHaveBeenCalledWith({ limit: 10 }, false, "u-1");
  });

  it("shows the weighted overall result, safe history fields, and cursor pagination affordance", () => {
    mock.user = { crm_profile: "ceo", crm_user_id: "u-ceo" };
    mock.summaryQuery.data = {
      records: [
        {
          sale: "SALE-1",
          sale_user: "user-1",
          count: 2,
          average_score: 8.5,
          average_normalized_score: 75,
        },
      ],
      total_points: 2,
      average_score: 8.5,
      average_normalized_score: 75,
      scope: "all",
      timezone: "Asia/Ho_Chi_Minh",
    };
    mock.historyQuery.data = {
      pages: [
        {
          items: [
            {
              name: "NPS-1",
              interaction: "INTX-1",
              interaction_datetime: "2026-10-12T02:30:00Z",
              source_revision: 1,
              sale: "SALE-1",
              sale_user: "user-1",
              status: "scored",
              satisfaction_score: 8,
              resolution_score: 8,
              friction_score: 9,
              complaint_score: 9,
              total_score: 8.5,
              normalized_score: 75,
              confidence: "high",
            },
          ],
        },
      ],
    };
    mock.historyQuery.hasNextPage = true;

    const html = renderToStaticMarkup(<NpsSaleScoreCard mode="organization" />);

    expect(html).toContain("Chất lượng cuộc gọi toàn hệ thống");
    expect(html).toContain("8.50");
    expect(html).toContain("2 cuộc gọi có điểm");
    expect(html).toContain("Lịch sử cuộc gọi đã chấm");
    expect(html).toContain("Tải thêm lịch sử");
    expect(html).toContain("SALE-1");
    expect(html).not.toContain("transcript");
    expect(mock.useSummary).toHaveBeenCalledWith({}, true, "u-ceo");
  });

  it("uses unique Sale user ids for duplicate-name breakdown and history options", () => {
    mock.user = { crm_profile: "lead_sales", crm_user_id: "lead-1" };
    mock.summaryQuery.data = {
      records: [
        { sale: "Same Name", sale_user: "user-1", count: 1, average_score: 8, average_normalized_score: 75 },
        { sale: "Same Name", sale_user: "user-2", count: 1, average_score: 9, average_normalized_score: 85 },
      ],
      total_points: 2,
      average_score: 8.5,
      average_normalized_score: 80,
      scope: "team",
      timezone: "Asia/Ho_Chi_Minh",
    };

    const html = renderToStaticMarkup(<NpsSaleScoreCard mode="team" />);

    expect(html).toContain('<option value="user-1">Same Name · user-1</option>');
    expect(html).toContain('<option value="user-2">Same Name · user-2</option>');
  });

  it("keeps the page visible with a retryable error state", () => {
    mock.user = { crm_profile: "sales", crm_user_id: "u-sale" };
    mock.summaryQuery.isError = true;
    mock.summaryQuery.error = new Error("Network unavailable");
    mock.historyQuery.isError = true;
    mock.historyQuery.error = new Error("Network unavailable");

    const html = renderToStaticMarkup(<NpsSaleScoreCard mode="personal" />);

    expect(html).toContain("role=\"alert\"");
    expect(html).toContain("Không thể tải tổng hợp chất lượng cuộc gọi");
    expect(html).toContain("Không thể tải lịch sử cuộc gọi");
    expect(html).toContain("Thử lại");
  });

  it("shows honest empty and pending states without treating missing scores as zero", () => {
    mock.user = { crm_profile: "lead_sales", crm_user_id: "lead-1" };
    mock.summaryQuery.data = {
      records: [],
      total_points: 0,
      average_score: null,
      average_normalized_score: null,
      scope: "team",
      timezone: "Asia/Ho_Chi_Minh",
    };
    const empty = renderToStaticMarkup(<NpsSaleScoreCard mode="team" />);
    expect(empty).toContain("Chưa có cuộc gọi nào được chấm trong phạm vi này.");
    expect(empty).toContain("Không có lịch sử cuộc gọi đã chấm");
    expect(empty).toContain("—");
    expect(empty).not.toContain("0.00/10");

    mock.summaryQuery.isPending = true;
    mock.historyQuery.isPending = true;
    const pending = renderToStaticMarkup(<NpsSaleScoreCard mode="team" />);
    expect(pending).toContain("aria-busy=\"true\"");
    expect(pending).not.toContain("Không có lịch sử cuộc gọi đã chấm");
  });
});
