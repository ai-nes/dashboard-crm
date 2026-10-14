import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { LeadDetail } from "@/services/api/lead-sale";
import LeadAssigneeField from "./lead-assignee-field";

const state = vi.hoisted(() => ({
  onPress: undefined as (() => void) | undefined,
  targets: [
    {
      id: "sales-user",
      displayName: "Nguyễn Minh An",
      teamId: "sales-team",
      teamName: "Sale HCM",
      function: "Sale",
      effectiveActive: 0,
    },
  ],
}));

vi.mock("@/components/tailgrids/core/button", () => ({
  Button: ({
    children,
    isDisabled,
    onPress,
  }: {
    children: ReactNode;
    isDisabled?: boolean;
    onPress?: () => void;
  }) => {
    state.onPress = onPress;
    return <button disabled={isDisabled}>{children}</button>;
  },
}));
vi.mock("@/components/common/dropdown-field", () => ({
  DropdownField: ({ ariaLabel }: { ariaLabel: string }) => (
    <div aria-label={ariaLabel} />
  ),
}));
vi.mock("@/hooks/use-lead-sale-leads-queries", () => ({
  useAssignLeadMutation: () => ({ mutate: vi.fn(), isPending: false }),
  useLeadAssignmentTargetsQuery: () => ({
    data: { targets: state.targets, ownershipRevision: 2 },
    isPending: false,
    isError: false,
  }),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const lead = (status: string) =>
  ({
    id: "lead-id",
    ownerStaff: "",
    owner: "",
    owningTeam: "",
    processingStatus: status,
    studentId: null,
    ownershipRevision: 2,
  }) as LeadDetail;

describe("Lead assignment readiness", () => {
  beforeEach(() => {
    state.onPress = undefined;
    state.targets = [
      {
        id: "sales-user",
        displayName: "Nguyễn Minh An",
        teamId: "sales-team",
        teamName: "Sale HCM",
        function: "Sale",
        effectiveActive: 0,
      },
    ];
  });

  it("hides assignment for NEW and offers processing to an authorized user", () => {
    const processLead = vi.fn();
    const html = renderToStaticMarkup(
      <LeadAssigneeField
        canAssign
        canProcess
        lead={lead("NEW")}
        leadId="lead-id"
        onProcessLead={processLead}
      />,
    );

    expect(html).toContain(
      "Lead mới cần được xử lý trước khi có thể phân công.",
    );
    expect(html).toContain("Xử lý Lead để phân công");
    expect(html).not.toContain("Chọn Sale hoặc CTV phụ trách Lead");
    state.onPress?.();
    expect(processLead).toHaveBeenCalledOnce();
  });

  it("explains the NEW prerequisite without exposing a process action to unauthorized users", () => {
    const html = renderToStaticMarkup(
      <LeadAssigneeField canAssign lead={lead("NEW")} leadId="lead-id" />,
    );

    expect(html).toContain(
      "Lead mới cần được xử lý trước khi có thể phân công.",
    );
    expect(html).not.toContain("Xử lý Lead để phân công");
    expect(html).not.toContain("Chọn Sale hoặc CTV phụ trách Lead");
  });

  it("exposes assignment targets after the Lead is processed", () => {
    const html = renderToStaticMarkup(
      <LeadAssigneeField canAssign lead={lead("PROCESSED")} leadId="lead-id" />,
    );

    expect(html).toContain("Chọn Sale hoặc CTV phụ trách Lead");
    expect(html).not.toContain("Xử lý Lead để phân công");
  });
});
