import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();

function json(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

async function call(
  method: string,
  params: Record<string, string> = {},
  body?: Record<string, unknown>,
) {
  const { nestUserManagementHandler } =
    await import("./nest-user-management-router");
  return nestUserManagementHandler(method, params, body);
}

describe("user management with the Nest backend", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://api.test");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("maps the user directory without fetching retired capacity", async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url.includes("/api/v1/users?")) {
        return json({
          data: [
            {
              id: "u1",
              email: "sale@example.test",
              name: "Sale One",
              identityRole: "user",
              crmProfile: "sales",
              emailVerified: true,
              status: "active",
            },
          ],
          meta: { pagination: { page: 2, pageSize: 8, total: 9 } },
        });
      }
      if (url.endsWith("/api/v1/me")) {
        return json({
          data: {
            id: "u1",
            email: "sale@example.test",
            name: "Sale One",
            identityRole: "user",
            crmProfile: "sales",
            crmCapabilities: [],
          },
        });
      }
      throw new Error(`Unexpected URL: ${url}`);
    });

    const result = await call("crm.api.session.list_admin_users", {
      search: "sale",
      role: "Sale",
      start: "8",
      page_length: "8",
    });

    expect(result).toMatchObject({
      total: 9,
      start: 8,
      page_length: 8,
      users: [
        {
          name: "u1",
          full_name: "Sale One",
          role: "Sale",
          session_user: true,
        },
      ],
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/api/v1/users?page=2&pageSize=8&search=sale&crmProfile=sales",
      expect.anything(),
    );
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).includes("staff-capacity"),
      ),
    ).toBe(false);
  });

  it("maps profile mutations and account provisioning", async () => {
    fetchMock.mockImplementation((url: string, init?: RequestInit) => {
      if (url.endsWith("/api/v1/users/u1/crm-profile"))
        return json({ data: {} });
      if (url === "http://api.test/api/v1/users") {
        return json(
          {
            data: {
              id: "u2",
              email: "new@example.test",
              name: "New User",
              identityRole: "user",
              crmProfile: null,
              emailVerified: true,
            },
          },
          201,
        );
      }
      if (url.endsWith("/api/v1/users/u2/crm-profile"))
        return json({ data: {} });
      throw new Error(`Unexpected ${init?.method ?? "GET"} ${url}`);
    });

    await call(
      "crm.api.user.update_user_role",
      {},
      { user: "u1", new_role: "Lead Sale" },
    );
    await call(
      "crm.api.user.create_crm_user",
      {},
      {
        email: "new@example.test",
        full_name: "New User",
        password: "long-enough-password",
        role: "Sale",
      },
    );
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "http://api.test/api/v1/users/u1/crm-profile",
    );
    expect(
      JSON.parse((fetchMock.mock.calls[0]?.[1] as RequestInit).body as string),
    ).toEqual({
      crmProfile: "lead_sales",
    });
    expect((fetchMock.mock.calls[1]?.[1] as RequestInit).headers).toMatchObject(
      {
        "Idempotency-Key": expect.any(String),
      },
    );
    expect(fetchMock.mock.calls[2]?.[0]).toBe(
      "http://api.test/api/v1/users/u2/crm-profile",
    );
  });

  it("maps permission profile pages and updates to the Nest contract", async () => {
    fetchMock.mockImplementation((url: string, init?: RequestInit) => {
      if (
        url.startsWith("http://api.test/api/v1/permission-profiles?") ||
        url.endsWith("/permission-profiles/Sale")
      ) {
        return json(
          init?.method === "PUT"
            ? {
                data: {
                  name: "Sale",
                  role: "Sale",
                  rowScope: "assigned",
                  deleteRequiresOwnership: false,
                  isSystemManaged: true,
                  applicableDoctypes: [],
                },
              }
            : {
                data: {
                  profiles: [
                    {
                      name: "Sale",
                      role: "Sale",
                      rowScope: "assigned",
                      deleteRequiresOwnership: true,
                      isSystemManaged: true,
                      applicableDoctypes: [],
                    },
                  ],
                  selectedRole: "Sale",
                  viewMode: "grouped",
                },
                meta: { pagination: { total: 1, start: 0, pageSize: 8 } },
              },
        );
      }
      throw new Error(`Unexpected ${init?.method ?? "GET"} ${url}`);
    });

    const list = await call(
      "crm.api.permission_profile.list_permission_profiles",
      { role: "Sale", start: "0", page_length: "8" },
    );
    expect(list).toMatchObject({
      selected_role: "Sale",
      profiles: [{ role: "Sale", row_scope: "assigned" }],
    });

    await call(
      "crm.api.permission_profile.update_permission_profile",
      {},
      {
        role: "Sale",
        row_scope: "assigned",
        delete_requires_ownership: false,
        applicable_doctypes: [{ document_type: "CRM Lead", read: true }],
      },
    );
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      "http://api.test/api/v1/permission-profiles/Sale",
    );
    expect(
      JSON.parse((fetchMock.mock.calls[1]?.[1] as RequestInit).body as string),
    ).toMatchObject({
      rowScope: "assigned",
      applicableDoctypes: [{ documentType: "CRM Lead", read: true }],
    });
  });

  it("validates the requested CRM role before provisioning an account", async () => {
    await expect(
      call(
        "crm.api.user.create_crm_user",
        {},
        {
          email: "invalid-role@example.test",
          full_name: "Invalid Role",
          password: "long-enough-password",
          role: "Unknown Role",
        },
      ),
    ).rejects.toMatchObject({
      status: 400,
      code: "INVALID_CRM_PROFILE",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
