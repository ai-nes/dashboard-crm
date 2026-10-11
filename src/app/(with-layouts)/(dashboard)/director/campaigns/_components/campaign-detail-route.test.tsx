import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CampaignDetailDashboard from "./campaign-detail-dashboard";

const routeHook = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/use-canonical-business-route", () => ({
  useCanonicalBusinessRoute: routeHook,
}));
vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => ({ user: { roles: [] }, isLoading: false }),
}));
vi.mock("@/components/common/auth/permissions", () => ({
  getCrmDoctypePermissions: () => ({ canRead: true }),
  getCrmPermissions: () => ({
    lead: { canRead: true },
    student: {
      canRead: true,
      canAssign: false,
      readScope: "all",
      scope: "all",
    },
  }),
}));
vi.mock("@/hooks/use-lead-sale-campaign-queries", () => ({
  useLeadSaleCampaignChannelTypesQuery: () => ({ data: { channelTypes: [] } }),
  useLeadSaleCampaignQuery: () => ({
    data: {
      name: "8f2d69d0-1795-4c52-a94a-e77c9ef64918",
      stableCode: "K26-014",
      title: "Campaign 2026",
      status: "ACTIVE",
      startDate: "2026-01-01",
      endDate: "2026-12-31",
    },
    isPending: false,
    isError: false,
  }),
}));
vi.mock("@/hooks/use-lead-sale-leads-queries", () => ({
  useLeadSaleLeadsQuery: () => ({
    data: { data: [], meta: { stats: {} } },
    isPending: false,
    isError: false,
  }),
}));
vi.mock("@/hooks/use-students-queries", () => ({
  useAssignedStudentsQuery: () => ({ data: { data: [], meta: {} } }),
  useDirectorStudentsQuery: () => ({ data: { data: [], meta: {} } }),
  studentsKeys: {
    assignedStudents: () => ["assigned-students"],
    directorStudents: () => ["director-students"],
  },
}));
vi.mock("@tanstack/react-query", () => ({
  keepPreviousData: undefined,
  useQueries: ({ queries }: { queries: unknown[] }) =>
    queries.map(() => ({ data: { meta: { total: 0 } } })),
}));

describe("campaign detail routes", () => {
  beforeEach(() => routeHook.mockClear());

  it("canonicalizes a legacy campaign id to its loaded business code", () => {
    renderToStaticMarkup(
      <CampaignDetailDashboard campaignCode="8f2d69d0-1795-4c52-a94a-e77c9ef64918" />,
    );

    expect(routeHook).toHaveBeenCalledWith(
      "8f2d69d0-1795-4c52-a94a-e77c9ef64918",
      "K26-014",
    );
  });
});
