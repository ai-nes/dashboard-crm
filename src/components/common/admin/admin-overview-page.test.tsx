import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminOverviewPage from "./admin-overview-page";

const state = vi.hoisted(() => ({
  queries: {
    users: {
      data: { total: 12, allUsers: [{ enabled: true }] },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    },
    rules: {
      data: {
        total: 2,
        versions: [{ isActive: true, rulesCount: 4, versionName: "v2" }],
      },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    },
    actions: {
      data: { total: 79, actions: [] },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    },
    policies: {
      data: { total: 0 },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    },
    messageTemplates: {
      data: { total: 5 },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    },
    segments: {
      data: { total: 7 },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    },
    majorGroups: {
      data: { total: 10 },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    },
    majors: {
      data: { total: 20 },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    },
    provinces: {
      data: { total: 30 },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    },
    wards: {
      data: { total: 40 },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    },
    schools: {
      data: { total: 50 },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    },
    schoolAreas: {
      data: { total: 1792 },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    },
    activity: {
      data: { total: 99, logs: [] },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    },
  },
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => state.queries.messageTemplates,
}));
vi.mock("@/hooks/use-activity-logs-query", () => ({
  useActivityLogsQuery: () => state.queries.activity,
}));
vi.mock("@/hooks/use-nba-admin-queries", () => ({
  useNbaAdminActionTypesQuery: () => ({
    data: { total: 8 },
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useNbaTimingPoliciesQuery: () => state.queries.policies,
}));
vi.mock("@/hooks/use-nba-actions-queries", () => ({
  useNbaActionsQuery: () => state.queries.actions,
}));
vi.mock("@/hooks/use-rules-config-queries", () => ({
  useCrmRuleVersionsQuery: () => state.queries.rules,
}));
vi.mock("@/hooks/use-major-catalog-queries", () => ({
  useMajorGroupsQuery: () => state.queries.majorGroups,
  useMajorsQuery: () => state.queries.majors,
}));
vi.mock("@/hooks/use-reference-catalog-queries", () => ({
  useProvincesQuery: () => state.queries.provinces,
  useSchoolAreasQuery: () => state.queries.schoolAreas,
  useSchoolsQuery: () => state.queries.schools,
  useWardsQuery: () => state.queries.wards,
}));
vi.mock("@/hooks/use-segment-queries", () => ({
  useSegmentsQuery: () => state.queries.segments,
}));
vi.mock("@/hooks/use-user-management-queries", () => ({
  useCrmUsersQuery: () => state.queries.users,
}));
vi.mock("@/services/api/message-templates", () => ({
  listAdminMessageTemplateLibrary: vi.fn(),
}));
vi.mock("./admin-overview-charts", () => ({
  default: () => null,
  AdminOverviewConfigurationChart: () => null,
}));
vi.mock("./admin-overview-configuration", () => ({
  default: ({
    modules,
  }: {
    modules: { label: string; value: string; detail: string; status: string }[];
  }) => (
    <div>
      {modules.map((module) => (
        <span
          key={module.label}
          data-module={module.label}
          data-value={module.value}
          data-detail={module.detail}
          data-status={module.status}
        />
      ))}
    </div>
  ),
  AdminOverviewQuickLinks: () => null,
}));
vi.mock("./admin-overview-kpi-strip", () => ({
  default: ({
    items,
  }: {
    items: { label: string; value: string; detail: string }[];
  }) => (
    <div>
      {items.map((item) => (
        <span
          key={item.label}
          data-kpi={item.label}
          data-value={item.value}
          data-detail={item.detail}
        />
      ))}
    </div>
  ),
}));

describe("admin overview source counts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("leaves refreshing to the shared application header", () => {
    const html = renderToStaticMarkup(<AdminOverviewPage links={[]} />);
    expect(html).not.toContain("Làm mới dữ liệu");
    expect(html).not.toContain("Đang làm mới dữ liệu");
  });

  it("uses the full NBA action total for status and scoped configuration count", () => {
    const html = renderToStaticMarkup(<AdminOverviewPage links={[]} />);
    expect(html).toContain(
      'data-module="NBA" data-value="79" data-detail="79 hành động · 0 khung giờ" data-status="ready"',
    );
    expect(html).toContain(
      'data-kpi="Bản ghi cấu hình" data-value="2.021" data-detail="NBA + danh mục tuyển sinh"',
    );
  });
});
