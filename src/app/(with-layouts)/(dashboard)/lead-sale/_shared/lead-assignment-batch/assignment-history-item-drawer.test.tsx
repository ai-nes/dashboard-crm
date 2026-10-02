import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { LeadAssignmentHistoryItem } from "@/services/api/lead-sale";
import AssignmentHistoryItemDrawer from "./assignment-history-item-drawer";

const state = vi.hoisted(() => ({ capabilities: ["student.routing.read"] }));
vi.mock("@/components/common/auth/auth-provider", () => ({ useAuth: () => ({ user: { user: "reader", roles: [], crm_capabilities: state.capabilities } }) }));
vi.mock("@tanstack/react-query", () => ({ useQueryClient: () => ({ invalidateQueries: vi.fn() }) }));
vi.mock("@/hooks/use-student-school-field-options", () => ({ useStudentSchoolFieldOptions: () => ({ data: { options: [] } }) }));
vi.mock("@/hooks/use-lead-assignment-batch-queries", () => ({
  useCreateLeadAssignmentBatchMutation: () => ({ mutateAsync: vi.fn() }),
  useRetryLeadAssignmentBatchMutation: () => ({ mutateAsync: vi.fn() }),
  useRunLeadAssignmentBatchMutation: () => ({ mutateAsync: vi.fn() }),
}));
vi.mock("@/hooks/use-lead-sale-leads-queries", () => ({ leadSaleLeadsKeys: { all: [] }, useUpdateLeadMutation: () => ({ mutateAsync: vi.fn() }) }));
vi.mock("../student-assignment/detail-drawer", () => ({ default: ({ children }: { children: ReactNode }) => <div>{children}</div> }));

const item: LeadAssignmentHistoryItem = {
  id: "ITEM-1", leadId: "LEAD-1", batchId: "BATCH-1", studentName: "Lead A",
  status: "manual_review", processingStatus: "PROCESSED", resolution: "PENDING",
  errorCode: "PROVINCE_TEAM_NOT_CONFIGURED", missingFields: [],
  leadCode: null, phone: null, idNumber: null, email: null, province: null,
  highSchool: null, highSchoolLabel: null, major: null, source: null, branch: null,
  convertedStudent: null, reason: null, retryCount: 0, routingTier: "group",
  zone: null, queue: null, team: null, ownerStaff: null, activeLoad: null,
  capacityLimit: null, remainingCapacity: null, policyVersion: null, routingRequest: null,
  batchCreatedAt: null, batchStatus: "completed_with_errors",
};

describe("Assignment history operation permissions", () => {
  it("hides assignment mutations from a routing reader", () => {
    state.capabilities = ["student.routing.read"];
    const html = renderToStaticMarkup(<AssignmentHistoryItemDrawer item={item} onClose={() => {}} />);
    expect(html).not.toContain("Lưu và phân công lại");
  });
  it("offers reassignment to an authorized routing operator", () => {
    state.capabilities = ["student.routing.read", "student.routing.operate"];
    const html = renderToStaticMarkup(<AssignmentHistoryItemDrawer item={item} onClose={() => {}} />);
    expect(html).toContain("Lưu và phân công lại");
    expect(html).not.toContain("Bổ sung thông tin định tuyến");
  });
});
