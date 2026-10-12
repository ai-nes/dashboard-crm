import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import LeadList from "./lead-list";
import type { LeadListItem } from "./types";

const lead: LeadListItem = {
  id: "lead-id",
  leadCode: "LD-001",
  studentCode: null,
  studentId: null,
  initials: "NT",
  name: "Nguyễn Test",
  phone: "0912345678",
  school: "School",
  status: "NEW",
  result: "PENDING",
  source: "Campaign",
  owner: "",
  contactNoAnswer: 0,
  contactSuccess: 0,
};
describe("Lead row delete action", () => {
  it("renders a delete action for an authorized row", () => {
    const html = renderToStaticMarkup(
      <QueryClientProvider client={new QueryClient()}>
        <LeadList
          leads={[lead]}
          canDeleteLead={() => true}
          onDeleteRequest={() => {}}
        />
      </QueryClientProvider>,
    );
    expect(html).toContain('aria-label="Xóa Lead LD-001"');
  });
  it("hides delete for denied rows", () => {
    const html = renderToStaticMarkup(
      <QueryClientProvider client={new QueryClient()}>
        <LeadList
          leads={[lead]}
          canDeleteLead={() => false}
          onDeleteRequest={() => {}}
        />
      </QueryClientProvider>,
    );
    expect(html).not.toContain('aria-label="Xóa Lead');
  });
});
