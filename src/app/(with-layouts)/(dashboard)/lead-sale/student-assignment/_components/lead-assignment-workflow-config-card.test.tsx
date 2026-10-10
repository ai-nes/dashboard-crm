import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  LeadAssignmentWorkflowConfigResponse,
  LeadRoutingPolicy,
} from "@/services/api/lead-sale";
import LeadAssignmentWorkflowConfigCard from "./lead-assignment-workflow-config-card";

const access = vi.hoisted(() => ({
  capability: true,
  canManage: true,
  state: "ready",
}));
vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => ({ user: {} }),
}));
vi.mock("@/components/common/auth/permissions", () => ({
  hasCrmCapability: () => access.capability,
}));
vi.mock("@/hooks/use-lead-assignment-workflow-config-queries", () => ({
  useLeadAssignmentWorkflowConfigQuery: () => ({
    data:
      access.state === "ready"
        ? { ...fixture, canManage: access.canManage }
        : undefined,
    isPending: access.state === "loading",
    isError: access.state === "error",
    error: new Error("Không có kết nối"),
  }),
  useUpdateLeadAssignmentWorkflowStepMutation: () => ({ isPending: false }),
}));

const policy: LeadRoutingPolicy = {
  enabled: true,
  routingMode: "global",
  provinceTeamPriority: {},
  layers: ["global", "group", "campaign"].map((key, index) => ({
    key: key as "global" | "group" | "campaign",
    label: key,
    enabled: key === "global",
    priority: index + 1,
  })),
  layerOrder: ["global", "group", "campaign"],
  distributionStrategy: "round_robin",
  capacityRequired: true,
  revision: 1,
  version: "test",
  applyScope: "new_decisions",
  sameCampus: true,
  teamLeadFallback: false,
  lastChangedBy: null,
  lastChangeReason: null,
};
const input = {
  enabled: true,
  scheduledMinAgeMinutes: 5,
  maxLeadsPerRun: 1000,
};
const fixture: LeadAssignmentWorkflowConfigResponse = {
  schemaVersion: "test",
  canManage: true,
  policy,
  config: {
    schemaVersion: "test",
    version: "test",
    revision: 1,
    applyScope: "new_decisions",
    lastChangedBy: null,
    lastChangeReason: null,
    stored: {
      input,
      classification: { enabled: true },
      review: { maxRetries: 3 },
    },
  },
  steps: {
    input: { id: "input", enabled: true, canToggle: true, settings: input },
    classification: {
      id: "classification",
      enabled: true,
      canToggle: true,
      settings: { enabled: true },
    },
    matching: {
      id: "matching",
      enabled: true,
      canToggle: false,
      settings: { routingPolicy: policy, noEligibleOutcome: "review" },
    },
    review: {
      id: "review",
      enabled: true,
      canToggle: false,
      settings: { maxRetries: 3, retryMode: "manual" },
    },
    validation: {
      id: "validation",
      enabled: true,
      canToggle: false,
      settings: {
        requiredFields: ["student_name", "phone", "province"],
        optionalFields: [],
        invalidOutcome: "review",
      },
    },
    assignment: {
      id: "assignment",
      enabled: true,
      canToggle: false,
      settings: {
        preserveExistingOwner: true,
        recipientFunctions: ["Sale", "CTV Sale"],
        createStudent: false,
      },
    },
  },
};

beforeEach(() => {
  access.capability = true;
  access.canManage = true;
  access.state = "ready";
});

describe("Lead assignment settings", () => {
  it.each([
    ["loading", "status"],
    ["error", "alert"],
  ])("announces %s to assistive technology", (state, role) => {
    access.state = state;
    const html = renderToStaticMarkup(<LeadAssignmentWorkflowConfigCard />);
    expect(html).toContain(`role="${role}"`);
    expect(html).not.toContain('type="radio"');
  });
  it("leads with recipient choices and explains each editable setting without workflow navigation", () => {
    const html = renderToStaticMarkup(<LeadAssignmentWorkflowConfigCard />);
    expect(html).toContain("Người nhận Lead");
    expect(html).toContain("Tiếp nhận tự động");
    expect(html).toContain("Kiểm tra Lead");
    expect(html).toContain("Xử lý lại");
    expect(html).toContain("Quy tắc hệ thống");
    expect(html).not.toContain("Quy trình phân công");
    expect(html).not.toContain("Lý do thay đổi");
    expect(html).not.toContain('data-slot="collapsible"');
    expect(html.match(/type="number"/g)).toHaveLength(3);
    expect(html.match(/type="radio"/g)).toHaveLength(3);
  });

  it.each(["capability", "canManage"] as const)(
    "hides every configuration action when %s is denied",
    (permission) => {
      access[permission] = false;
      const html = renderToStaticMarkup(<LeadAssignmentWorkflowConfigCard />);
      expect(html).toContain("Chỉ có quyền xem");
      expect(html).toContain("Chia đều cho toàn bộ Sales");
      expect(html).not.toMatch(/type="(?:checkbox|radio|number)"/);
      expect(html).not.toContain("Lưu và áp dụng");
    },
  );
});
