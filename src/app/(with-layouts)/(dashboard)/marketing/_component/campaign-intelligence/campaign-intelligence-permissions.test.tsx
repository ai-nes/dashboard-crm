import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import CampaignIntelligenceDashboard from "./campaign-intelligence-dashboard";

const session = vi.hoisted(() => ({
  canReadCampaign: false,
  canReadStudent: false,
  studentScope: "none" as "none" | "assigned" | "team" | "all",
  options: {} as { enabled?: boolean },
}));

vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => ({
    isLoading: false,
    user: {
      user: "u1",
      email: "u1@example.test",
      full_name: "User One",
      user_image: null,
      roles: [],
      crm_profile: null,
      crm_role: null,
      crm_capabilities: [],
      crm_doctype_permissions: {
        "CRM Campaign": { read: session.canReadCampaign },
        "CRM Student": {
          read: session.canReadStudent,
          row_scope: session.studentScope,
        },
      },
    },
  }),
}));
vi.mock("@/hooks/use-campaign-intelligence-queries", () => ({
  useCampaignIntelligenceQuery: (options?: { enabled?: boolean }) => {
    session.options = options ?? {};
    return {
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
  },
}));

describe("campaign intelligence permissions", () => {
  it("requires campaign read and all-scope Student read before querying", () => {
    session.canReadCampaign = true;
    session.canReadStudent = false;
    session.studentScope = "none";
    session.options = {};

    const html = renderToStaticMarkup(
      <CampaignIntelligenceDashboard showLeadOverview />,
    );

    expect(session.options.enabled).toBe(false);
    expect(html).toContain("Bạn không có quyền xem dữ liệu chiến dịch.");
    expect(html).not.toContain("Danh sách Lead theo chiến dịch");
  });

  it("queries when Campaign.read and all-scope Student.read are granted", () => {
    session.canReadCampaign = true;
    session.canReadStudent = true;
    session.studentScope = "all";
    session.options = {};

    const html = renderToStaticMarkup(
      <CampaignIntelligenceDashboard showLeadOverview />,
    );

    expect(session.options.enabled).toBe(true);
    expect(html).not.toContain("Bạn không có quyền xem dữ liệu chiến dịch.");
  });
});
