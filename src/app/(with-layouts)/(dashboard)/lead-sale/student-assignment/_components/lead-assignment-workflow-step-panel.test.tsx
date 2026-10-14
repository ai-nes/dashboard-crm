import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import LeadAssignmentWorkflowStepPanel from "./lead-assignment-workflow-step-panel";
import type { LeadAssignmentWorkflowStepSnapshot } from "@/services/api/lead-sale";

const configuration: LeadAssignmentWorkflowStepSnapshot = {
  id: "input",
  enabled: true,
  canToggle: true,
  settings: {
    enabled: true,
    autoProcessEnabled: false,
    scheduledMinAgeMinutes: 5,
    maxLeadsPerRun: 25,
  },
};
describe("automatic Lead intake setting", () => {
  it("renders the processing toggle for permitted editors", () => {
    const html = renderToStaticMarkup(
      <LeadAssignmentWorkflowStepPanel
        configuration={configuration}
        canEdit
        isSaving={false}
        onSettingsChange={() => {}}
      />,
    );
    expect(html).toContain('aria-label="Tự động xử lý Lead đầu vào"');
    expect(html).toContain('type="checkbox"');
  });
  it("shows read-only state without a mutation toggle", () => {
    const html = renderToStaticMarkup(
      <LeadAssignmentWorkflowStepPanel
        configuration={configuration}
        canEdit={false}
        isSaving={false}
        onSettingsChange={() => {}}
      />,
    );
    expect(html).toContain("Tự động xử lý Lead đầu vào");
    expect(html).not.toContain('type="checkbox"');
  });
});
