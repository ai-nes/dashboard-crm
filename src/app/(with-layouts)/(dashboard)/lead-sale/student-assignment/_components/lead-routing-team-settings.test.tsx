import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import LeadRoutingTeamSettings from "./lead-routing-team-settings";

const options = [
  {
    id: "team-a",
    label: "Sales Hà Nội",
    province: "hanoi",
    provinceLabel: "Hà Nội",
  },
  {
    id: "team-b",
    label: "Sales HCM",
    province: "hcm",
    provinceLabel: "Hồ Chí Minh",
  },
];

describe("Province priority editing permissions", () => {
  it("shows add and remove actions for authorized editors", () => {
    const html = renderToStaticMarkup(
      <LeadRoutingTeamSettings
        options={options}
        priorities={{ hanoi: "team-a" }}
        canEdit
        isSaving={false}
        onChange={() => {}}
      />,
    );
    expect(html).toContain("Thêm tỉnh");
    expect(html).toContain("Bỏ team ưu tiên của hanoi");
    expect(html).not.toContain("Chọn tỉnh/thành phố");
  });

  it("preserves mapped values and hides all editing actions for viewers", () => {
    const html = renderToStaticMarkup(
      <LeadRoutingTeamSettings
        options={options}
        priorities={{ hanoi: "team-a" }}
        canEdit={false}
        isSaving={false}
        onChange={() => {}}
      />,
    );
    expect(html).toContain("Hà Nội");
    expect(html).toContain("Sales Hà Nội");
    expect(html).not.toContain("<button");
    expect(html).not.toContain("Thêm tỉnh");
  });

  it("disables applicable actions during autosave", () => {
    const html = renderToStaticMarkup(
      <LeadRoutingTeamSettings
        options={options}
        priorities={{ hanoi: "team-a" }}
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

  it("offers no add action when all available provinces are mapped", () => {
    const html = renderToStaticMarkup(
      <LeadRoutingTeamSettings
        options={options}
        priorities={{ hanoi: "team-a", hcm: "team-b" }}
        canEdit
        isSaving={false}
        onChange={() => {}}
      />,
    );
    expect(html).not.toContain("Thêm tỉnh");
  });
});
