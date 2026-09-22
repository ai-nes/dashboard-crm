import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  listPermissionProfiles,
  updatePermissionProfile,
  UserManagementApiError,
} from ".";

describe("User management permission profile API", () => {
  const originalFetch = globalThis.fetch;
  const baseUrl = "http://crm-test.local:8000";

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("loads the Frappe permission profile envelope", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            selected_role: "Sale",
            total: 1,
            start: 0,
            page_length: 8,
            profiles: [
              {
                name: "Sale",
                role: "Sale",
                row_scope: "assigned",
                delete_requires_ownership: 1,
                is_system_managed: 1,
                applicable_doctypes: [
                  {
                    document_type: "CRM Student",
                    label: "Học sinh",
                    description:
                      "Bao gồm hồ sơ tuyển sinh và tài liệu của học sinh.",
                    included_doctypes: [
                      "CRM Student",
                      "CRM Student Admission Profile",
                      "CRM Student Document",
                    ],
                    read: 1,
                    write: 1,
                    create: 0,
                    delete: 0,
                    export: 0,
                  },
                ],
              },
            ],
          },
        }),
        { status: 200 },
      ),
    );

    const result = await listPermissionProfiles({ baseUrl });

    expect(result.profiles[0]).toMatchObject({
      role: "Sale",
      rowScope: "assigned",
      deleteRequiresOwnership: true,
      applicableDoctypes: [
        {
          documentType: "CRM Student",
          label: "Học sinh",
          includedDoctypes: [
            "CRM Student",
            "CRM Student Admission Profile",
            "CRM Student Document",
          ],
          read: true,
          write: true,
          create: false,
        },
      ],
    });
    expect(result).toMatchObject({
      selectedRole: "Sale",
      total: 1,
      start: 0,
      pageLength: 8,
    });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${baseUrl}/api/method/crm.api.permission_profile.list_permission_profiles?start=0&page_length=8`,
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("sends the selected role and matrix page to Frappe", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            selected_role: "Sale",
            total: 20,
            start: 8,
            page_length: 8,
            profiles: [],
          },
        }),
        { status: 200 },
      ),
    );

    await listPermissionProfiles(
      { role: "Sale", start: 8, pageLength: 8 },
      { baseUrl },
    );

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${baseUrl}/api/method/crm.api.permission_profile.list_permission_profiles?role=Sale&start=8&page_length=8`,
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("requests the detailed DocType view when selected", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            selected_role: "Sale",
            total: 37,
            start: 0,
            page_length: 8,
            view_mode: "detailed",
            profiles: [],
          },
        }),
        { status: 200 },
      ),
    );

    await listPermissionProfiles(
      { role: "Sale", viewMode: "detailed" },
      { baseUrl },
    );

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${baseUrl}/api/method/crm.api.permission_profile.list_permission_profiles?role=Sale&start=0&page_length=8&view_mode=detailed`,
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("serializes a complete permission matrix update", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: {
            name: "Sale",
            role: "Sale",
            row_scope: "team_and_team_pool",
            delete_requires_ownership: true,
            is_system_managed: true,
            applicable_doctypes: [
              {
                document_type: "CRM Student",
                read: true,
                write: false,
                create: false,
                delete: false,
                export: true,
              },
            ],
          },
        }),
        { status: 200 },
      ),
    );

    const result = await updatePermissionProfile(
      {
        role: "Sale",
        rowScope: "team_and_team_pool",
        deleteRequiresOwnership: true,
        applicableDoctypes: [
          {
            documentType: "CRM Student",
            read: true,
            write: false,
            create: false,
            delete: false,
            export: true,
          },
        ],
        replaceApplicableDoctypes: false,
        viewMode: "detailed",
      },
      { baseUrl },
    );

    expect(result.rowScope).toBe("team_and_team_pool");
    expect(result.applicableDoctypes[0]?.export).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${baseUrl}/api/method/crm.api.permission_profile.update_permission_profile`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          role: "Sale",
          row_scope: "team_and_team_pool",
          delete_requires_ownership: true,
          applicable_doctypes: [
            {
              document_type: "CRM Student",
              read: true,
              write: false,
              create: false,
              delete: false,
              export: true,
            },
          ],
          replace_applicable_doctypes: false,
          view_mode: "detailed",
        }),
      }),
    );
  });

  it("uses the shared permission message for forbidden responses", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: "PERMISSION_DENIED",
            message: "Insufficient Permission",
          },
        }),
        { status: 403 },
      ),
    );

    await expect(listPermissionProfiles({ baseUrl })).rejects.toEqual(
      expect.objectContaining<Partial<UserManagementApiError>>({
        status: 403,
        code: "PERMISSION_DENIED",
        message: "Bạn không có quyền thao tác.",
      }),
    );
  });
});
