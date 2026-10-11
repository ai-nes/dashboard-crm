import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MajorGroupDetailPage } from "./major-group-detail-page";

const state = vi.hoisted(() => ({
  canonicalRoute: null as [string, string | undefined] | null,
  childGroupId: null as string | null,
  group: {
    id: "6d8c0d1a-4053-4aa4-9329-8e1185cd7d35",
    code: "MG-SCIENCE",
    name: "Khoa học",
    description: "Các ngành khoa học",
    enabled: true,
    sortOrder: 1,
  },
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => ({ user: {} }),
}));
vi.mock("@/components/common/admin/admin-page-header", () => ({
  default: () => null,
}));
vi.mock("@/components/tailgrids/core/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));
vi.mock("@/hooks/use-major-catalog-queries", () => ({
  useMajorGroupsQuery: () => ({
    data: { groups: [state.group], total: 1 },
    isPending: false,
    error: null,
  }),
}));
vi.mock("@/hooks/use-canonical-business-route", () => ({
  useCanonicalBusinessRoute: (reference: string, code?: string) => {
    state.canonicalRoute = [reference, code];
  },
}));
vi.mock("./major-catalog-management", () => ({
  MajorCatalogManagement: ({ groupId }: { groupId: string }) => {
    state.childGroupId = groupId;
    return <div />;
  },
}));
vi.mock("./student-configuration-permissions", () => ({
  getMajorCatalogPermissions: () => ({
    majors: { canCreate: false, canRead: false, canUpdate: false, canDelete: false },
    majorGroups: { canCreate: false, canRead: true, canUpdate: false, canDelete: false },
    educationPrograms: {},
    provinces: {},
    wards: {},
    highSchools: {},
    schoolAreas: {},
    admissionYears: {},
    campaignChannelTypes: {},
  }),
}));

function renderPage(reference: string) {
  state.canonicalRoute = null;
  state.childGroupId = null;

  renderToStaticMarkup(<MajorGroupDetailPage groupId={reference} />);
}

describe("Major Group detail route identity", () => {
  beforeEach(() => {
    state.canonicalRoute = null;
    state.childGroupId = null;
  });

  it("resolves business-code routes and keeps the UUID for child data queries", () => {
    renderPage("MG-SCIENCE");

    expect(state.canonicalRoute).toEqual(["MG-SCIENCE", "MG-SCIENCE"]);
    expect(state.childGroupId).toBe("6d8c0d1a-4053-4aa4-9329-8e1185cd7d35");
  });

  it("keeps legacy UUID routes readable and canonicalizes to the group code", () => {
    renderPage("6d8c0d1a-4053-4aa4-9329-8e1185cd7d35");

    expect(state.canonicalRoute).toEqual([
      "6d8c0d1a-4053-4aa4-9329-8e1185cd7d35",
      "MG-SCIENCE",
    ]);
    expect(state.childGroupId).toBe("6d8c0d1a-4053-4aa4-9329-8e1185cd7d35");
  });
});
