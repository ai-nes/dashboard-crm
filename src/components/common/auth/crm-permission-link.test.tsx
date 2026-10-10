import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { CurrentUser } from "@/services/api/auth";
import { CrmPermissionLink } from "./crm-permission-link";

const auth = vi.hoisted(() => ({ user: null as CurrentUser | null }));
vi.mock("./auth-provider", () => ({ useAuth: () => auth }));

describe("Director resource action links", () => {
  it("uses the resource route policy for links with filters", () => {
    auth.user = {
      user: "sale@example.test",
      email: "sale@example.test",
      full_name: "Sale",
      user_image: null,
      roles: ["Sale"],
      crm_profile: "sales",
      crm_role: "Sale",
      crm_capabilities: [],
      crm_doctype_permissions: {
        "CRM Student": {
          row_scope: "assigned",
          read: true,
          write: false,
          create: false,
          delete: false,
          export: false,
        },
      },
    };
    expect(
      renderToStaticMarkup(
        <CrmPermissionLink href="/director/students?owner=one">
          Học sinh
        </CrmPermissionLink>,
      ),
    ).toContain('href="/director/students?owner=one"');
  });
  it("hides denied drilldowns and preserves permitted link content and styling", () => {
    auth.user = {
      user: "director@example.test",
      email: "director@example.test",
      full_name: "Director",
      user_image: null,
      roles: ["Admissions Director"],
      crm_profile: "admissions_director",
      crm_role: "Admissions Director",
      crm_capabilities: [],
      crm_doctype_permissions: {
        "CRM Student": {
          row_scope: "all",
          read: false,
          write: true,
          create: true,
          delete: true,
          export: true,
        },
        "CRM Campaign": {
          read: true,
          write: false,
          create: false,
          delete: false,
          export: false,
        },
      },
    };
    expect(
      renderToStaticMarkup(
        <CrmPermissionLink href="/director/students/one">
          Học sinh
        </CrmPermissionLink>,
      ),
    ).toBe("");
    auth.user.crm_doctype_permissions!["CRM Student"].read = true;
    const html = renderToStaticMarkup(
      <CrmPermissionLink
        href="/director/campaign-intelligence"
        className="text-sm"
      >
        Chiến dịch
      </CrmPermissionLink>,
    );
    expect(html).toContain('href="/director/campaign-intelligence"');
    expect(html).toContain('class="text-sm"');
    expect(html).toContain("Chiến dịch");
  });

  it("checks the requested activity tab in an object href", () => {
    const readOnly = {
      read: true,
      write: false,
      create: false,
      delete: false,
      export: false,
    };
    auth.user = {
      user: "director@example.test",
      email: "director@example.test",
      full_name: "Director",
      user_image: null,
      roles: ["Admissions Director"],
      crm_profile: "admissions_director",
      crm_role: "Admissions Director",
      crm_capabilities: [],
      crm_doctype_permissions: {
        "CRM Campaign": readOnly,
        "CRM Student": { ...readOnly, row_scope: "all" },
      },
    };
    expect(
      renderToStaticMarkup(
        <CrmPermissionLink
          href={{
            pathname: "/director/activity-campaign",
            query: { tab: "field" },
          }}
        >
          Trường
        </CrmPermissionLink>,
      ),
    ).toBe("");
    expect(
      renderToStaticMarkup(
        <CrmPermissionLink
          href={{
            pathname: "/director/activity-campaign",
            query: { tab: "campaign" },
          }}
        >
          Chiến dịch
        </CrmPermissionLink>,
      ),
    ).toContain("tab=campaign");
  });

  it("keeps the existing role restriction even when a resource read grant is present", () => {
    auth.user = {
      user: "promoter@example.test",
      email: "promoter@example.test",
      full_name: "Promoter",
      user_image: null,
      roles: ["Promoter"],
      crm_profile: "pr",
      crm_role: "Promoter",
      crm_capabilities: [],
      crm_doctype_permissions: {
        "CRM Student": {
          read: true,
          write: false,
          create: false,
          delete: false,
          export: false,
        },
      },
    };
    expect(
      renderToStaticMarkup(
        <CrmPermissionLink href="/director/students">
          Học sinh
        </CrmPermissionLink>,
      ),
    ).toBe("");
  });
});
