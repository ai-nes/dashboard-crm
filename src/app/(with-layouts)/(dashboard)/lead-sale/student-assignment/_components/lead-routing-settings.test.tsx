import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { LeadRoutingPolicy } from "@/services/api/lead-sale";
import LeadRoutingSettings from "./lead-routing-settings";

const policy: LeadRoutingPolicy = {
  enabled: false,
  layers: [
    { key: "campaign", label: "Chiến dịch", enabled: true, priority: 1 },
    { key: "group", label: "Nhóm", enabled: true, priority: 2 },
    { key: "global", label: "Campus", enabled: true, priority: 3 },
  ],
  layerOrder: ["campaign", "group", "global"],
  distributionStrategy: "least_load",
  capacityRequired: true,
  revision: 1,
  version: "test",
  applyScope: "new_decisions",
  sameCampus: true,
  teamLeadFallback: false,
  lastChangedBy: null,
  lastChangeReason: null,
};

describe("LeadRoutingSettings permissions", () => {
  it("hides editing controls for viewers but preserves policy information", () => {
    const html = renderToStaticMarkup(
      <LeadRoutingSettings
        policy={policy}
        canEdit={false}
        isSaving={false}
        onChange={() => {}}
      />,
    );
    expect(html).not.toContain("<select");
    expect(html).not.toContain('type="checkbox"');
    expect(html).not.toContain('type="radio"');
    expect(html).not.toContain('title="Kéo để đổi thứ tự ưu tiên"');
    expect(html).toContain("Theo chiến dịch");
    expect(html).toContain("Cấu hình được giữ lại");
  });
  it("shows all three assignment choices directly to authorized editors", () => {
    const html = renderToStaticMarkup(
      <LeadRoutingSettings
        policy={policy}
        canEdit
        isSaving={false}
        onChange={() => {}}
      />,
    );
    expect(html.match(/type="radio"/g)).toHaveLength(3);
    expect(html.match(/type="checkbox"/g)).toHaveLength(1);
    expect(html).toContain("Chia đều cho toàn bộ Sales");
    expect(html).toContain("Theo team/tỉnh");
    expect(html).toContain("Theo chiến dịch");
  });
  it("disables all settings during save", () => {
    const html = renderToStaticMarkup(
      <LeadRoutingSettings
        policy={policy}
        canEdit
        isSaving
        onChange={() => {}}
      />,
    );
    for (const control of html.match(/<(?:select|input|button)\b[^>]*>/g) ??
      []) {
      expect(control).toContain('disabled=""');
    }
  });
});
