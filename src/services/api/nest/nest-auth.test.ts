import { describe, expect, it, vi } from "vitest";
import { nestGetCurrentUser } from "./nest-auth";
import { nestRequest } from "./nest-client";
vi.mock("./nest-client", () => ({
  nestRequest: vi.fn(),
  NestApiError: class extends Error {},
}));
describe("Nest effective Lead permissions", () => {
  it("uses saved false flags even when student.execute is granted", async () => {
    const lead = {
      row_scope: "all",
      read: true,
      write: true,
      create: false,
      delete: false,
      export: false,
      delete_requires_ownership: true,
    };
    vi.mocked(nestRequest).mockResolvedValue({
      data: {
        email: "lead@example.test",
        name: "Lead",
        crmProfile: "lead_sales",
        identityRole: "user",
        leadScope: "all",
        crmCapabilities: [{ key: "student.execute" }],
        crmDoctypePermissions: { "CRM Lead": lead },
      },
    });
    expect(
      (await nestGetCurrentUser())?.crm_doctype_permissions?.["CRM Lead"],
    ).toEqual(lead);
  });
});
