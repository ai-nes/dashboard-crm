import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  listPermissionProfiles,
  updatePermissionProfile,
  UserManagementApiError,
} from ".";

const API = "http://localhost:3001";

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

const page = (overrides: Record<string, unknown> = {}) => ({
  data: {
    profiles: [],
    selectedRole: "Sale",
    viewMode: "grouped",
    ...overrides,
  },
  meta: { pagination: { total: 20, start: 8, pageSize: 8 } },
});

describe("User management permission profile API", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", API);
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("maps the Nest permission profile page into the dashboard shape", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        data: {
          profiles: [
            {
              name: "Sale",
              role: "Sale",
              rowScope: "assigned",
              deleteRequiresOwnership: true,
              isSystemManaged: true,
              applicableDoctypes: [
                {
                  documentType: "CRM Student",
                  label: "Học sinh",
                  description:
                    "Bao gồm hồ sơ tuyển sinh và tài liệu của học sinh.",
                  includedDoctypes: [
                    "CRM Student",
                    "CRM Student Admission Profile",
                    "CRM Student Document",
                  ],
                  read: true,
                  write: true,
                  create: false,
                  delete: false,
                  export: false,
                },
              ],
            },
          ],
          selectedRole: "Sale",
          viewMode: "grouped",
        },
        meta: { pagination: { total: 1, start: 0, pageSize: 8 } },
      }),
    );

    const result = await listPermissionProfiles();

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
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/api/v1/permission-profiles?start=0&pageSize=8`);
    expect(init).toMatchObject({ method: "GET", credentials: "include" });
  });

  it("sends the selected role and matrix page", async () => {
    fetchMock.mockResolvedValue(jsonResponse(page()));

    await listPermissionProfiles({ role: "Sale", start: 8, pageLength: 8 });

    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${API}/api/v1/permission-profiles?role=Sale&start=8&pageSize=8`,
    );
  });

  it("requests the detailed view when selected", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(page({ viewMode: "detailed" })),
    );

    const result = await listPermissionProfiles({
      role: "Sale",
      viewMode: "detailed",
    });

    expect(result.viewMode).toBe("detailed");
    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${API}/api/v1/permission-profiles?role=Sale&start=0&pageSize=8&viewMode=detailed`,
    );
  });

  it("serializes a complete permission matrix update", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        data: {
          name: "Sale",
          role: "Sale",
          rowScope: "team_and_team_pool",
          deleteRequiresOwnership: true,
          isSystemManaged: true,
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
        },
      }),
    );

    const result = await updatePermissionProfile({
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
    });

    expect(result.rowScope).toBe("team_and_team_pool");
    expect(result.applicableDoctypes[0]?.export).toBe(true);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/api/v1/permission-profiles/Sale`);
    expect(init).toMatchObject({ method: "PUT" });
    expect(JSON.parse(init.body)).toEqual({
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
    });
  });

  it("uses the shared permission message for forbidden responses", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        {
          error: {
            code: "PERMISSION_DENIED",
            message: "Insufficient Permission",
          },
        },
        403,
      ),
    );

    await expect(listPermissionProfiles()).rejects.toEqual(
      expect.objectContaining<Partial<UserManagementApiError>>({
        status: 403,
        code: "PERMISSION_DENIED",
        message: "Bạn không có quyền thao tác.",
      }),
    );
  });

  it("reports a network failure as a user-management error", async () => {
    fetchMock.mockRejectedValue(new TypeError("offline"));

    await expect(listPermissionProfiles()).rejects.toEqual(
      expect.objectContaining<Partial<UserManagementApiError>>({
        status: 503,
        code: "API_UNAVAILABLE",
      }),
    );
  });
});
