import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { normalizeLeadDetail } from "@/services/api/lead-sale/leads";
import LeadDetailsTab from "./lead-details-tab";

vi.mock("@/hooks/use-student-school-field-options", () => ({
  useStudentSchoolFieldOptions: () => ({ data: { options: [] } }),
}));
vi.mock("@/hooks/use-lead-sale-leads-queries", () => ({
  useUpdateLeadMutation: () => ({ isPending: false }),
}));
vi.mock("./lead-detail-section", () => ({
  default: ({
    editLabel,
    isEditing,
  }: {
    editLabel: string;
    isEditing: boolean;
  }) => <section aria-label={editLabel} data-editing={isEditing} />,
}));

const lead = normalizeLeadDetail({
  lead: { id: "lead-1", name: "Lead Test", phone: "0912345678" },
  log: [],
  meta: {},
}).lead;

describe("Lead contact edit entry", () => {
  it.each([
    { canEdit: true, initialEditContact: true, editing: true },
    { canEdit: true, initialEditContact: false, editing: false },
    { canEdit: false, initialEditContact: true, editing: false },
  ])(
    "opens the contact editor only with permission and edit intent: %j",
    ({ canEdit, initialEditContact, editing }) => {
      const html = renderToStaticMarkup(
        <LeadDetailsTab
          lead={lead}
          leadId={lead.id}
          canEdit={canEdit}
          initialEditContact={initialEditContact}
        />,
      );
      expect(html).toContain(
        `aria-label="Chỉnh sửa thông tin liên hệ Lead" data-editing="${editing}"`,
      );
      expect(html).toContain(
        'aria-label="Chỉnh sửa thông tin tuyển sinh Lead" data-editing="false"',
      );
    },
  );
});
