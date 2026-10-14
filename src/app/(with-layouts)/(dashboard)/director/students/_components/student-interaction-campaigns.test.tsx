import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import StudentInteractionsTabs from "./student-interactions-tabs";

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({}),
  useMutation: () => ({}),
}));
vi.mock("@/hooks/use-interaction-intelligence-queries", () => ({
  useInteractionCatalogQuery: () => ({ data: { interactionTypes: [] } }),
}));
vi.mock("@/components/common/detail-tabs", () => ({
  default: ({
    tabs,
    defaultSelectedKey,
    actions,
  }: {
    tabs: { label: string }[];
    defaultSelectedKey: string;
    actions?: React.ReactNode;
  }) => (
    <div data-selected={defaultSelectedKey}>
      {actions}
      {tabs.map((t) => (
        <span key={t.label}>{t.label}</span>
      ))}
    </div>
  ),
}));

describe("Campaigns inside Student interactions", () => {
  it("shows Add campaign instead of Create interaction on the campaign tab", () => {
    const html = renderToStaticMarkup(
      <StudentInteractionsTabs
        studentId="s"
        canReadInteractions
        canReadCampaigns
        canAddCampaign
        canCreateInteraction
        initialCampaignTab
        calls={[]}
        messages={[]}
      />,
    );
    expect(html).toContain("Thêm chiến dịch");
    expect(html).not.toContain("Tạo tương tác");
  });
  it("hides the campaign mutation action for read-only users", () => {
    const html = renderToStaticMarkup(
      <StudentInteractionsTabs
        studentId="s"
        canReadInteractions
        canReadCampaigns
        canCreateInteraction
        initialCampaignTab
        calls={[]}
        messages={[]}
      />,
    );
    expect(html).not.toContain("Thêm chiến dịch");
    expect(html).not.toContain("Tạo tương tác");
  });
  it("retains Create interaction on other tabs", () => {
    const html = renderToStaticMarkup(
      <StudentInteractionsTabs
        studentId="s"
        canReadInteractions
        canReadCampaigns
        canAddCampaign
        canCreateInteraction
        calls={[]}
        messages={[]}
      />,
    );
    expect(html).toContain("Tạo tương tác");
    expect(html).not.toContain("Thêm chiến dịch");
  });
  it("places Campaigns after Other when both grants are allowed", () => {
    const html = renderToStaticMarkup(
      <StudentInteractionsTabs
        studentId="s"
        canReadInteractions
        canReadCampaigns
        canCreateInteraction={false}
        calls={[]}
        messages={[]}
      />,
    );
    expect(html).toContain(
      "<span>Zalo</span><span>Cuộc gọi</span><span>Khác</span><span>Chiến dịch</span>",
    );
  });
  it("hides Campaigns when its read grant is denied", () => {
    const html = renderToStaticMarkup(
      <StudentInteractionsTabs
        studentId="s"
        canReadInteractions
        canReadCampaigns={false}
        canCreateInteraction={false}
        calls={[]}
        messages={[]}
      />,
    );
    expect(html).not.toContain("Chiến dịch");
  });
  it("keeps campaign access independent from interaction catalog grants", () => {
    const html = renderToStaticMarkup(
      <StudentInteractionsTabs
        studentId="s"
        canReadInteractions={false}
        canReadCampaigns
        canCreateInteraction={false}
        calls={[]}
        messages={[]}
      />,
    );
    expect(html).toContain(
      '<div data-selected="campaigns"><span>Chiến dịch</span>',
    );
    expect(html).not.toContain("<span>Khác</span>");
  });
});
