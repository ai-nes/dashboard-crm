import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import StudentCampaignsTable from "./student-campaigns-table";

describe("Student campaigns display", () => {
  it("shows original and returning campaigns with real registration metadata", () => {
    const html = renderToStaticMarkup(
      <StudentCampaignsTable
        items={[
          {
            id: "new",
            campaignId: "c2",
            title: "Referral",
            code: "C002",
            status: "ACTIVE",
            channel: null,
            startDate: null,
            endDate: null,
            registeredAt: "2026-10-11T05:44:33.418Z",
            timestampEstimated: false,
            isOriginalCampaign: false,
            isNewLead: false,
          },
          {
            id: "original",
            campaignId: "c1",
            title: "Admission",
            code: "C001",
            status: "CLOSED",
            channel: null,
            startDate: null,
            endDate: null,
            registeredAt: "2026-10-10T03:45:36.351Z",
            timestampEstimated: true,
            isOriginalCampaign: true,
            isNewLead: true,
          },
        ]}
      />,
    );
    expect(html).toContain("Referral");
    expect(html).toContain("C002");
    expect(html).toContain("Admission");
    expect(html).toContain("Chiến dịch đầu tiên");
    expect(html).toContain("Tham gia tiếp");
    expect(html).toContain("Thời gian ước tính");
    expect(html).toContain("Đang diễn ra");
    expect(html).toContain("11/10/2026");
  });

  it("shows a readable missing-code label without exposing the campaign id", () => {
    const html = renderToStaticMarkup(
      <StudentCampaignsTable
        items={[
          {
            id: "participation-uuid",
            campaignId: "campaign-uuid",
            title: "Tư vấn tuyển sinh",
            code: null,
            status: "ACTIVE",
            channel: null,
            startDate: null,
            endDate: null,
            registeredAt: "2026-10-10T03:45:36.351Z",
            timestampEstimated: false,
            isOriginalCampaign: true,
            isNewLead: false,
          },
        ]}
      />,
    );

    expect(html).toContain("Chưa có mã chiến dịch");
    expect(html).not.toContain("campaign-uuid");
    expect(html).not.toContain("participation-uuid");
  });
});
