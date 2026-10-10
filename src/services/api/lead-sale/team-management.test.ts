import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getTeamManagementWorkspace,
  saveTeam,
  addTeamMember,
  saveTeamGroup,
  TeamManagementApiError,
} from "./team-management";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", "http://localhost:3001");
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe("team management API", () => {
  it("preserves validation fields and request ID and logs a safe diagnostic", async () => {
    const diagnostic = vi.spyOn(console, "error").mockImplementation(() => {});
    const details = [
      {
        field: "user_id",
        code: "invalid_type",
        message: "Invalid input: expected string, received undefined",
      },
    ];
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: "INVALID_INPUT",
            message: "The request is invalid.",
            details,
            requestId: "request-test-123",
          },
        }),
        { status: 400 },
      ),
    );
    try {
      await expect(
        addTeamMember({ userId: "account-id", teamId: "team-id" }),
      ).rejects.toMatchObject({
        status: 400,
        code: "INVALID_INPUT",
        details,
        requestId: "request-test-123",
        message: expect.stringContaining("user_id"),
      });
      expect(diagnostic).toHaveBeenCalledWith(
        "[team-management] API request failed",
        expect.objectContaining({
          method: "POST",
          path: "/api/v1/team-management/members",
          status: 400,
          code: "INVALID_INPUT",
          details,
          requestId: "request-test-123",
        }),
      );
      expect(JSON.stringify(diagnostic.mock.calls)).not.toContain("account-id");
    } finally {
      diagnostic.mockRestore();
    }
  });
  it("sends User IDs for membership and designated leaders", async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ status: "created" }), { status: 201 }),
      ),
    );
    await addTeamMember({ userId: "account-id", teamId: "team-id" });
    await saveTeam({
      teamName: "Team",
      campus: "campus",
      teamLeadUser: "account-id",
    });
    await saveTeamGroup({ groupName: "Group", groupLeadUser: "account-id" });
    expect(JSON.parse(fetchMock.mock.calls[0]![1].body)).toMatchObject({
      user_id: "account-id",
      team_id: "team-id",
    });
    expect(JSON.parse(fetchMock.mock.calls[1]![1].body)).toMatchObject({
      team_lead_user: "account-id",
    });
    expect(JSON.parse(fetchMock.mock.calls[2]![1].body)).toMatchObject({
      group_lead_user: "account-id",
    });
  });
  it("loads the workspace from the Nest API", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ groups: [], teams: [] }), { status: 200 }),
    );

    await expect(getTeamManagementWorkspace()).resolves.toMatchObject({
      groups: [],
      teams: [],
    });
    expect(fetchMock.mock.calls[0]![0]).toBe(
      "http://localhost:3001/api/v1/team-management/workspace",
    );
    expect(fetchMock.mock.calls[0]![1]).toMatchObject({
      method: "GET",
      credentials: "include",
    });
  });

  it("rejects a workspace without groups and teams", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await expect(getTeamManagementWorkspace()).rejects.toMatchObject({
      status: 502,
      code: "INVALID_TEAM_MANAGEMENT_RESPONSE",
    });
  });

  it("posts a team save with an idempotency key", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ action: "save_team", status: "ok" }), {
        status: 200,
      }),
    );

    await saveTeam({ teamName: "Team A", campus: "HN" });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("http://localhost:3001/api/v1/team-management/teams");
    expect(init).toMatchObject({ method: "POST" });
    expect(JSON.parse(init.body)).toMatchObject({
      team_name: "Team A",
      campus: "HN",
      team_type: "Sales",
      is_active: true,
      idempotency_key: expect.any(String),
    });
  });

  it("exposes the upstream error as a team management error", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          error: { code: "FORBIDDEN", message: "Không có quyền" },
        }),
        { status: 403 },
      ),
    );

    await expect(getTeamManagementWorkspace()).rejects.toEqual(
      expect.objectContaining<Partial<TeamManagementApiError>>({
        status: 403,
        code: "FORBIDDEN",
      }),
    );
  });
});
