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
    expect(html).not.toContain('title="Kéo để đổi thứ tự ưu tiên"');
    expect(html).toContain("Cân bằng theo tải");
    expect(html).toContain("Các thiết lập bên dưới được giữ");
  });
  it("offers position selection and toggles to authorized editors", () => {
    const html = renderToStaticMarkup(
      <LeadRoutingSettings
        policy={policy}
        canEdit
        isSaving={false}
        onChange={() => {}}
      />,
    );
    expect(html.match(/<select/g)).toHaveLength(4);
    expect(html.match(/type="checkbox"/g)).toHaveLength(5);
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
