import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { LeadSaleCampaign } from "@/services/api/lead-sale";
import LeadImportDialog from "./lead-import-dialog";

const state = vi.hoisted(() => ({
  campaigns: [] as LeadSaleCampaign[],
  options: [] as { id: string; label: string }[],
}));

vi.mock("@/hooks/use-lead-sale-campaign-queries", () => ({
  useLeadSaleCampaignsQuery: () => ({
    data: { campaigns: state.campaigns },
    isPending: false,
    isError: false,
  }),
}));
vi.mock("@/components/common/multi-step-dialog", () => ({
  MultiStepDialog: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock("./quick-create-lead-import-panel", () => ({
  default: ({ campaignOptions }: { campaignOptions: typeof state.options }) => {
    state.options = campaignOptions;
    return null;
  },
}));

function campaign(
  index: number,
  overrides: Partial<LeadSaleCampaign> = {},
): LeadSaleCampaign {
  return {
    name: `campaign-id-${index}`,
    stableCode: `CAM-${index}`,
    title: `Chiến dịch ${index}`,
    status: "ACTIVE",
    ...overrides,
  };
}

function renderDialog() {
  renderToStaticMarkup(
    <LeadImportDialog isOpen onOpenChange={() => {}} onImport={vi.fn()} />,
  );
}

describe("Lead import campaign options", () => {
  beforeEach(() => {
    state.campaigns = [];
    state.options = [];
  });

  it("keeps all five active campaigns when one has no stable code", () => {
    state.campaigns = [1, 2, 3, 4].map((index) => campaign(index));
    state.campaigns.push(campaign(5, { stableCode: "" }));

    renderDialog();

    expect(state.options).toHaveLength(5);
    expect(state.options[0]).toEqual({
      id: "CAM-1",
      label: "CAM-1 — Chiến dịch 1",
    });
    expect(state.options[4]).toEqual({
      id: "campaign-id-5",
      label: "Chiến dịch 5",
    });
  });

  it("keeps closed campaigns and excludes draft and upcoming campaigns", () => {
    state.campaigns = [
      campaign(1, { status: "CLOSED", stableCode: " " }),
      campaign(2, { status: "DRAFT" }),
      campaign(3, { status: "UPCOMING" }),
    ];

    renderDialog();

    expect(state.options).toEqual([
      { id: "campaign-id-1", label: "Chiến dịch 1" },
    ]);
  });
});
