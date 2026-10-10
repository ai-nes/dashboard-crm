import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getTeamManagementWorkspace,
  saveTeam,
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
