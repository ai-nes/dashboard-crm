import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LeadDetailDashboard from "./lead-detail-dashboard";

const state = vi.hoisted(() => ({
  id: "23600821-7310-458a-9b9d-54135d0d33aa",
  code: "LD-2026-HCM-003978",
  allowed: true,
  query: vi.fn(),
  callQuery: vi.fn(),
  canonical: vi.fn(),
  convert: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  processLead: vi.fn(),
  replace: vi.fn(),
  childIds: [] as string[],
  status: "ASSIGNED",
  ownerId: null as string | null,
  result: "PENDING" as string,
  hasMatchedStudent: false as boolean | undefined,
  onProcessLead: undefined as (() => void) | undefined,
  onConvert: undefined as (() => void) | undefined,
  onDelete: undefined as (() => void) | undefined,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: state.replace, refresh: vi.fn() }),
}));
vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => ({ user: { roles: ["Director"] }, isLoading: false }),
}));
vi.mock("@/components/common/auth/permissions", () => ({
  getCrmPermissions: () => ({
    lead: { canRead: state.allowed, canAssign: state.allowed },
  }),
  getCrmDoctypePermissions: () => ({ canCreate: state.allowed }),
  canReadCrmPath: () => state.allowed,
  canAccessStudent: () => state.allowed,
  canPerformStudentAction: () => state.allowed,
  hasCrmCapability: () => state.allowed,
  canConvertLeadToStudent: () => state.allowed,
}));
vi.mock("@/hooks/use-canonical-business-route", () => ({
  useCanonicalBusinessRoute: state.canonical,
}));
vi.mock("@/hooks/use-lead-call-logs-query", () => ({
  useLeadCallLogsQuery: (...args: unknown[]) => {
    state.callQuery(...args);
    return { data: { calls: [] }, refetch: vi.fn() };
  },
}));
vi.mock("@/hooks/use-lead-sale-leads-queries", () => ({
  useLeadSaleLeadQuery: (...args: unknown[]) => {
    state.query(...args);
    return {
      data: {
        lead: {
          id: state.id,
          leadCode: state.code,
          name: "Võ Khánh Linh",
          processingStatus: state.status,
          ownerId: state.ownerId,
          result: state.result,
          hasMatchedStudent: state.hasMatchedStudent,
          phone: "0835102605",
          province: "HCM",
          school: "THPT An Nhơn Tây",
          interestedMajor: "Business Administration",
        },
      },
    };
  },
  useConvertLeadToStudentMutation: () => ({ mutate: state.convert }),
  useUpdateLeadMutation: () => ({ mutateAsync: state.update }),
  useDeleteLeadMutation: () => ({ mutate: state.remove }),
  useProcessLeadMutation: () => ({
    mutate: state.processLead,
    isPending: false,
  }),
}));
vi.mock("@/components/common/detail-tabs", () => ({
  default: ({ tabs }: { tabs: { content: ReactNode }[] }) => (
    <>
      {tabs.map((tab, index) => (
        <div key={index}>{tab.content}</div>
      ))}
    </>
  ),
}));
vi.mock("@/components/common/delete-record-dialog", () => ({
  DeleteRecordDialog: ({ onConfirm }: { onConfirm: () => void }) => {
    state.onDelete = onConfirm;
    return null;
  },
}));
vi.mock("./lead-header", () => ({
  default: ({
    children,
    onConvertRequest,
  }: {
    children: ReactNode;
    onConvertRequest?: () => void;
  }) => {
    state.onConvert = onConvertRequest;
    return children;
  },
}));
function captureChild({ leadId }: { leadId: string }) {
  state.childIds.push(leadId);
  return null;
}
vi.mock("./lead-details-tab", () => ({
  default: (props: { leadId: string; onProcessLead?: () => void }) => {
    state.onProcessLead = props.onProcessLead;
    return captureChild(props);
  },
}));
vi.mock("./lead-calls-tab", () => ({
  default: (props: { leadId: string }) => captureChild(props),
}));
vi.mock("./lead-notes-tab", () => ({
  default: (props: { leadId: string }) => captureChild(props),
}));
vi.mock("./lead-log-tab", () => ({
  default: (props: { leadId: string }) => captureChild(props),
}));
vi.mock("./lead-workflow-section", () => ({
  default: (props: { leadId: string }) => captureChild(props),
}));
vi.mock("./lead-conversion-dialog", () => ({ default: () => null }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("Lead detail route identity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.allowed = true;
    state.childIds = [];
    state.status = "ASSIGNED";
    state.ownerId = null;
    state.result = "PENDING";
    state.hasMatchedStudent = false;
    state.onProcessLead = undefined;
    state.onConvert = undefined;
    state.onDelete = undefined;
  });
  it.each(["LD-2026-HCM-003978", "23600821-7310-458a-9b9d-54135d0d33aa"])(
    "reads %s and uses the resolved UUID for child APIs and writes",
    (reference) => {
      renderToStaticMarkup(<LeadDetailDashboard leadId={reference} />);
      expect(state.query).toHaveBeenCalledWith(
        reference,
        expect.objectContaining({ enabled: true }),
      );
      expect(state.canonical).toHaveBeenCalledWith(reference, state.code);
      expect(state.callQuery).toHaveBeenCalledWith(state.id, expect.anything());
      expect(state.childIds).toHaveLength(5);
      expect(state.childIds.every((id) => id === state.id)).toBe(true);
      state.onDelete?.();
      expect(state.remove).toHaveBeenCalledWith(state.id, expect.anything());
      state.onConvert?.();
      expect(state.convert).toHaveBeenCalledWith(state.id, expect.anything());
    },
  );
  it("opens the converted student by its business code", () => {
    renderToStaticMarkup(<LeadDetailDashboard leadId={state.code} />);
    state.onConvert?.();
    const options = state.convert.mock.calls[0]?.[1] as {
      onSuccess: (result: { student: string; studentCode: string }) => void;
    };
    options.onSuccess({
      student: "student-id",
      studentCode: "HS-2026-HCM-002670",
    });
    expect(state.replace).toHaveBeenCalledWith(
      "/director/students/HS-2026-HCM-002670",
    );
  });
  it("offers the processing mutation before assignment for a NEW Lead", () => {
    state.status = "NEW";
    renderToStaticMarkup(<LeadDetailDashboard leadId={state.code} />);

    expect(state.onProcessLead).toBeTypeOf("function");
    state.onProcessLead?.();
    expect(state.processLead).toHaveBeenCalledWith(
      { lead: state.id },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });
  it("offers conversion for an owned PROCESSED lead with pending resolution", () => {
    state.status = "PROCESSED";
    state.ownerId = "owner-user-id";
    renderToStaticMarkup(<LeadDetailDashboard leadId={state.code} />);

    expect(state.onConvert).toBeTypeOf("function");
  });
  it("preserves ASSIGNED conversion when match-state metadata is unavailable", () => {
    state.status = "ASSIGNED";
    state.hasMatchedStudent = undefined;
    renderToStaticMarkup(<LeadDetailDashboard leadId={state.code} />);

    expect(state.onConvert).toBeTypeOf("function");
  });
  it("keeps conversion unavailable for a matched PROCESSED lead", () => {
    state.status = "PROCESSED";
    state.ownerId = "owner-user-id";
    state.result = "MATCHED";
    renderToStaticMarkup(<LeadDetailDashboard leadId={state.code} />);

    expect(state.onConvert).toBeUndefined();
  });
  it("keeps conversion unavailable when a PENDING Lead is already linked to a matched Student", () => {
    state.status = "PROCESSED";
    state.ownerId = "owner-user-id";
    state.hasMatchedStudent = true;
    renderToStaticMarkup(<LeadDetailDashboard leadId={state.code} />);

    expect(state.onConvert).toBeUndefined();
  });
  it("fails closed for stale PROCESSED Leads when matched-Student state is unknown", () => {
    state.status = "PROCESSED";
    state.ownerId = "owner-user-id";
    state.hasMatchedStudent = undefined;
    renderToStaticMarkup(<LeadDetailDashboard leadId={state.code} />);

    expect(state.onConvert).toBeUndefined();
  });
  it("keeps code routes gated by the existing read permission", () => {
    state.allowed = false;
    const html = renderToStaticMarkup(
      <LeadDetailDashboard leadId={state.code} />,
    );
    expect(state.query).toHaveBeenCalledWith(state.code, { enabled: false });
    expect(html).toContain("Bạn không có quyền xem Lead này.");
    expect(state.childIds).toEqual([]);
    expect(state.onConvert).toBeUndefined();
    expect(state.onDelete).toBeUndefined();
  });
});
