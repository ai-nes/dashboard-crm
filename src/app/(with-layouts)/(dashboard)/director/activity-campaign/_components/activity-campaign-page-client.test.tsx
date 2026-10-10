import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ActivityCampaignPageClient from "./activity-campaign-page-client";
const grants = vi.hoisted(() => ({ school: false, campaign: true }));
vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => ({
    isLoading: false,
    user: {
      roles: ["Admissions Director"],
      crm_doctype_permissions: {
        "CRM High School": { read: grants.school },
        "CRM Campaign": { read: grants.campaign },
        "CRM Student": { read: true, row_scope: "all" },
      },
    },
  }),
}));
vi.mock(
  "../../school-field-activity/_components/school-field-activity-page-client",
  () => ({ default: () => <div>School activity content</div> }),
);
vi.mock(
  "../../../marketing/_component/campaign-intelligence/campaign-intelligence-dashboard",
  () => ({ default: () => <div>Campaign report content</div> }),
);
vi.mock("../../../marketing/_component/time-range-context", () => ({
  MarketingTimeRangeProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));
describe("combined Director activity report", () => {
  it("selects an allowed campaign tab when the default field tab is denied", () => {
    grants.school = false;
    grants.campaign = true;
    const html = renderToStaticMarkup(
      <ActivityCampaignPageClient requestedTab="field" />,
    );
    expect(html).toContain("Campaign report content");
    expect(html).not.toContain("School activity content");
    expect(html).not.toContain("tab=field");
  });
  it("mounts only field content when the campaign tab is denied", () => {
    grants.school = true;
    grants.campaign = false;
    const html = renderToStaticMarkup(
      <ActivityCampaignPageClient requestedTab="campaign" />,
    );
    expect(html).toContain("School activity content");
    expect(html).not.toContain("Campaign report content");
    expect(html).not.toContain("tab=campaign");
  });
});
