import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DirectorLeadsPage from "../page";
import LeadsOverviewDashboard from "./leads-overview-dashboard";

const state = vi.hoisted(() => ({
  read: true,
  list: vi.fn<(params: unknown, options: unknown) => { isPending: boolean }>(
    () => ({ isPending: true }),
  ),
}));

vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => ({
    isLoading: false,
    user: {
      roles: ["Admissions Director"],
      crm_capabilities: [],
      crm_doctype_permissions: {
        "CRM Lead": { read: state.read, row_scope: "all" },
      },
    },
  }),
}));
vi.mock("@tanstack/react-query", () => ({
  keepPreviousData: (data: unknown) => data,
  useQueryClient: () => ({}),
}));
vi.mock("@/hooks/use-lead-sale-leads-queries", () => ({
  useLeadSaleLeadsQuery: state.list,
  useCreateLeadMutation: () => ({}),
  useImportLeadFileMutation: () => ({}),
  usePreviewNewLeadsMutation: () => ({}),
  useProcessNewLeadsMutation: () => ({}),
}));
vi.mock("@/hooks/use-lead-assignment-batch-queries", () => ({
  useRunUnassignedLeadAssignmentMutation: () => ({}),
}));
vi.mock("@/hooks/use-lead-sale-campaign-queries", () => ({
  useLeadSaleCampaignsQuery: () => ({ data: { campaigns: [] } }),
}));
vi.mock("./lead-list-toolbar", () => ({ default: () => null }));
vi.mock("./quick-create-lead-dialog", () => ({ default: () => null }));
vi.mock("./lead-import-dialog", () => ({ default: () => null }));
vi.mock("./lead-processing-preview-dialog", () => ({ default: () => null }));

describe("Director lead list scope", () => {
  beforeEach(() => {
    state.read = true;
    state.list.mockClear();
  });

  it("requests all leads without a default year, status, campaign or owner filter", () => {
    const html = renderToStaticMarkup(<DirectorLeadsPage />);
    expect(state.list.mock.calls[0]?.[0]).toEqual({
      page: 1,
      pageSize: 10,
      q: undefined,
      status: undefined,
      resolution: undefined,
      campaign: undefined,
      order: "desc",
    });
    expect(html).toContain("Tất cả kỳ tuyển sinh");
    expect(html).not.toContain("Kỳ 2026");
  });

  it("preserves the default intake year on the existing sales screens", () => {
    renderToStaticMarkup(<LeadsOverviewDashboard />);
    expect(state.list.mock.calls[0]?.[0]).toMatchObject({
      admissionYear: 2026,
    });
  });

  it("keeps the list query disabled when Lead read permission is denied", () => {
    state.read = false;
    const html = renderToStaticMarkup(<DirectorLeadsPage />);
    expect(state.list.mock.calls[0]?.[1]).toMatchObject({ enabled: false });
    expect(html).toContain("Bạn không có quyền xem danh sách Lead.");
  });
});
