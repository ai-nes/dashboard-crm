import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import CampaignList from "./campaign-list";
import type { CampaignListItem } from "./types";

const campaign: CampaignListItem = {
  id: "8f2d69d0-1795-4c52-a94a-e77c9ef64918",
  code: "K26",
  name: "Campaign One",
  admissionYear: 2026,
  startDate: "2026-01-01",
  endDate: "2026-12-31",
  status: "ACTIVE",
  mode: "ONLINE",
  channelType: "",
  channelUrl: "",
  campus: "campus-1",
  leadRoutingEnabled: false,
  leadRoutingTargetType: "Team",
  leadRoutingTargetTeam: "",
  leadRoutingTargetGroup: "",
};

function renderCampaignList(canUpdate: boolean, canDelete: boolean) {
  return renderToStaticMarkup(
    <CampaignList
      campaigns={[campaign]}
      detailListPath="/director/campaigns"
      channelTypes={[]}
      canUpdate={canUpdate}
      canDelete={canDelete}
      onStatusChange={() => undefined}
      onModeChange={() => undefined}
      onChannelSave={() => undefined}
      onEdit={() => undefined}
      onDelete={() => undefined}
      toolbar={<div />}
      pagination={{ page: 1, totalPages: 1, total: 1, pageSize: 5 }}
      onPageChange={() => undefined}
    />,
  );
}

describe("campaign list actions", () => {
  it("shows edit and delete actions only for their effective grants", () => {
    const html = renderCampaignList(false, false);
    expect(html).not.toContain('aria-label="Sửa Campaign One"');
    expect(html).not.toContain('aria-label="Xóa Campaign One"');
    expect(html).not.toContain('aria-label="Đổi trạng thái Campaign One"');
    expect(html).toContain("Campaign One");
  });

  it("keeps permitted campaign actions available", () => {
    const html = renderCampaignList(true, true);
    expect(html).toContain('aria-label="Sửa Campaign One"');
    expect(html).toContain('aria-label="Xóa Campaign One"');
    expect(html).toContain('aria-label="Đổi trạng thái Campaign One"');
  });

  it("uses the campaign business code for detail links", () => {
    const html = renderCampaignList(false, false);

    expect(html).toContain('href="/director/campaigns/K26"');
    expect(html).not.toContain(
      'href="/director/campaigns/8f2d69d0-1795-4c52-a94a-e77c9ef64918"',
    );
    expect(html).toContain("K26");
  });

  it("uses the internal id only when the campaign has no business code", () => {
    const html = renderToStaticMarkup(
      <CampaignList
        campaigns={[{ ...campaign, code: "" }]}
        detailListPath="/director/campaigns"
        channelTypes={[]}
        canUpdate={false}
        canDelete={false}
        onStatusChange={() => undefined}
        onModeChange={() => undefined}
        onChannelSave={() => undefined}
        onEdit={() => undefined}
        onDelete={() => undefined}
        toolbar={<div />}
        pagination={{ page: 1, totalPages: 1, total: 1, pageSize: 5 }}
        onPageChange={() => undefined}
      />,
    );

    expect(
      html,
    ).toContain('href="/director/campaigns/8f2d69d0-1795-4c52-a94a-e77c9ef64918"');
    expect(html).toContain("Chưa có mã chiến dịch");
  });
});
