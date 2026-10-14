import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LeadAssignmentHistoryItem } from "@/services/api/lead-sale";
import AssignmentBatchHistory from "./assignment-batch-history";

const access = vi.hoisted(() => ({ capability: true }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => ({ user: {}, isLoading: false }),
}));
vi.mock("@/components/common/auth/permissions", () => ({
  hasCrmCapability: () => access.capability,
}));
vi.mock("@/hooks/use-lead-assignment-batch-queries", () => ({
  useLeadAssignmentHistoryQuery: () => ({
    data: {
      items: [item],
      pagination: {
        total: 1,
        page: 1,
        pageSize: 50,
        totalPages: 1,
        hasNextPage: false,
      },
    },
    error: null,
    isLoading: false,
    isFetching: false,
  }),
}));
vi.mock(
  "../../_shared/lead-assignment-batch/assignment-history-item-drawer",
  () => ({ default: () => null }),
);

const item = {
  id: "item-1",
  batchId: "batch-1",
  leadId: "lead-1",
  leadCode: "LD-0001",
  studentName: "Nguyễn Văn A",
  phone: "0901234567",
  status: "failed",
  ownerStaff: "",
  team: "",
  reason: "NO_TEAM",
  batchCreatedAt: "2026-10-01T00:00:00.000Z",
} as unknown as LeadAssignmentHistoryItem;

describe("AssignmentBatchHistory", () => {
  beforeEach(() => {
    access.capability = true;
  });

  it("offers the resolve action to routing operators", () => {
    const html = renderToStaticMarkup(<AssignmentBatchHistory />);
    expect(html).toContain("Thao tác LD-0001");
    expect(html).toMatch(/>Cần kiểm tra<\/button>/);
  });

  it("hides the resolve action without the routing capability", () => {
    access.capability = false;
    const html = renderToStaticMarkup(<AssignmentBatchHistory />);
    expect(html).not.toContain("Thao tác LD-0001");
  });

  it("shows only the allowed status filters", () => {
    const html = renderToStaticMarkup(
      <AssignmentBatchHistory statuses={["assigned", "pending"]} />,
    );
    expect(html).toMatch(/>Chờ phân công<\/button>/);
    expect(html).not.toMatch(/>Cần kiểm tra<\/button>/);
    expect(html).not.toMatch(/>Lỗi xử lý<\/button>/);
  });

  it("hides the filter bar when a single status is allowed", () => {
    const html = renderToStaticMarkup(
      <AssignmentBatchHistory statuses={["assigned"]} />,
    );
    expect(html).not.toContain('aria-label="Trạng thái hồ sơ"');
  });
});
