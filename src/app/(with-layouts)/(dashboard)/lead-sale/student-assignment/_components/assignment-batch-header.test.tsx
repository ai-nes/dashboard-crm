import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AssignmentBatchHeader from "./assignment-batch-header";

const config = vi.hoisted(() => ({
  enabled: true,
  autoProcessEnabled: true,
  scheduledMinAgeMinutes: 1,
  maxLeadsPerRun: 100,
}));

vi.mock("@/hooks/use-lead-assignment-workflow-config-queries", () => ({
  useLeadAssignmentWorkflowConfigQuery: () => ({
    data: {
      steps: {
        input: {
          enabled: config.enabled,
          settings: { ...config },
        },
      },
    },
  }),
}));

vi.mock("@/hooks/use-lead-sale-leads-queries", () => ({
  useLeadSaleLeadsQuery: () => ({
    data: { meta: { pendingNew: 0 } },
    isPending: false,
  }),
}));

vi.mock("../../_shared/lead-assignment-batch/batch-assignment-context", () => ({
  useBatchAssignment: () => ({
    workflow: { pendingCount: 0 },
    isWorkflowLoading: false,
    isWorkflowProcessing: false,
    isProcessingNewLeads: false,
    processNewLeads: vi.fn(),
    runUnassignedLeads: vi.fn(),
  }),
}));

describe("AssignmentBatchHeader intake guidance", () => {
  beforeEach(() => {
    config.enabled = true;
    config.autoProcessEnabled = true;
    config.scheduledMinAgeMinutes = 1;
  });

  it("explains the configured polling cycle without adding a lead-age wait", () => {
    const html = renderToStaticMarkup(<AssignmentBatchHeader />);

    expect(html).toContain("mỗi 1 phút");
    expect(html).toContain("lần quét kế tiếp");
    expect(html).toContain("không có thời gian chờ theo tuổi Lead");
    expect(html).not.toContain("sau 5 phút");
  });

  it("does not describe automatic intake when that step is disabled", () => {
    config.enabled = false;
    const html = renderToStaticMarkup(<AssignmentBatchHeader />);

    expect(html).toContain("Tự động tiếp nhận Lead đang tắt");
    expect(html).not.toContain("mỗi 1 phút");
  });
});
