import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createNbaAction,
  deleteNbaAction,
  getNbaAction,
  listNbaActionTypes,
  listNbaActions,
  listNbaTimeSlots,
  updateNbaAction,
} from "./index";
import {
  normalizeNbaActionTypesResponse,
  normalizeNbaActionsResponse,
  normalizeNbaTimeSlotsResponse,
} from "./normalizers";

const API = "http://localhost:3001";
const fetchMock = vi.fn();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CRM_API_URL", API);
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe("NBA action API normalizers", () => {
  it("normalizes the action list and JSON time slots", () => {
    expect(
      normalizeNbaActionsResponse({
        message: {
          total: 1,
          start: 0,
          page_length: 20,
          actions: [
            {
              name: "CALL",
              display_name: "Gọi điện",
              action_type: "CONTACT",
              purpose: "Liên hệ với học sinh.",
              default_channel: "CALL",
              allowed_actors: ["Sale", "Lead Sale"],
              requires_approval: 0,
              auto_execute: 0,
              execution_type: "MANUAL",
              ai_allowed: 0,
              sort_order: 10,
              modified: "2026-09-04 08:00:00",
              allowed_time_slots: '["6-12", "18-24"]',
              enabled: 1,
            },
          ],
        },
      }),
    ).toEqual({
      total: 1,
      start: 0,
      pageLength: 20,
      actions: [
        {
          name: "CALL",
          code: "CALL",
          displayName: "Gọi điện",
          actionType: "CONTACT",
          description: null,
          purpose: "Liên hệ với học sinh.",
          defaultChannel: "CALL",
          allowedActors: ["Sale", "Lead Sale"],
          allowedTimeSlots: ["6-12", "18-24"],
          requiresApproval: false,
          autoExecute: false,
          executionType: "MANUAL",
          aiAllowed: false,
          enabled: true,
          sortOrder: 10,
          modified: "2026-09-04 08:00:00",
        },
      ],
    });
  });

  it("normalizes action types and the server-defined time slot list", () => {
    expect(
      normalizeNbaActionTypesResponse({
        message: {
          total: 1,
          action_types: [
            {
              name: "CONTACT",
              display_name: "Liên hệ",
              enabled: true,
            },
          ],
        },
      }),
    ).toMatchObject({
      total: 1,
      actionTypes: [
        {
          name: "CONTACT",
          actionType: "CONTACT",
          displayName: "Liên hệ",
          enabled: true,
        },
      ],
    });

    expect(
      normalizeNbaTimeSlotsResponse({
        message: { time_slots: ["0-6", "6-12", "invalid"] },
      }),
    ).toEqual({ timeSlots: ["0-6", "6-12"] });
  });
});

describe("NBA action API contract", () => {
  const actionRow = {
    name: "SEND_EMAIL",
    code: "SEND_EMAIL",
    display_name: "Gửi Email",
    action_type: "CONTACT",
    default_channel: "EMAIL",
    allowed_actors: ["Sale"],
    allowed_time_slots: [],
    enabled: 1,
  };

  it("sends allowed time slots as an array", async () => {
    fetchMock.mockResolvedValue(
      json({
        name: "CALL",
        action: {
          ...actionRow,
          name: "CALL",
          allowed_time_slots: '["6-12", "12-18"]',
        },
      }),
    );

    await updateNbaAction({
      name: "CALL",
      allowedTimeSlots: ["6-12", "12-18"],
    });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/api/v1/nba/actions/CALL`);
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body)).toEqual({
      allowed_time_slots: ["6-12", "12-18"],
    });
  });

  it("creates, reads and deletes an action", async () => {
    fetchMock
      .mockResolvedValueOnce(json(actionRow, 201))
      .mockResolvedValueOnce(json(actionRow))
      .mockResolvedValueOnce(json({ deleted: "SEND_EMAIL" }));

    await createNbaAction({
      code: "SEND_EMAIL",
      displayName: "Gửi Email",
      actionType: "CONTACT",
      defaultChannel: "EMAIL",
      allowedActors: ["Sale"],
      allowedTimeSlots: [],
      requiresApproval: false,
      autoExecute: false,
      executionType: "MANUAL",
      aiAllowed: false,
      enabled: true,
      sortOrder: 20,
    });
    await getNbaAction("SEND_EMAIL");
    await deleteNbaAction("SEND_EMAIL");

    const [create, get, remove] = fetchMock.mock.calls;
    expect(create![0]).toBe(`${API}/api/v1/nba/actions`);
    expect(create![1].method).toBe("POST");
    expect(JSON.parse(create![1].body)).toMatchObject({
      code: "SEND_EMAIL",
      allowed_actors: ["Sale"],
      allowed_time_slots: [],
    });
    expect(get![0]).toBe(`${API}/api/v1/nba/actions/SEND_EMAIL`);
    expect(remove![0]).toBe(`${API}/api/v1/nba/actions/SEND_EMAIL`);
    expect(remove![1].method).toBe("DELETE");
  });

  it("lists actions with the filters", async () => {
    fetchMock.mockResolvedValue(
      json({ total: 1, start: 0, page_length: 20, actions: [actionRow] }),
    );

    const result = await listNbaActions({
      actionType: "CONTACT",
      channel: "EMAIL",
      enabled: true,
      search: "mail",
    });

    const url = new URL(fetchMock.mock.calls[0]![0]);
    expect(url.pathname).toBe("/api/v1/nba/actions");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      action_type: "CONTACT",
      default_channel: "EMAIL",
      enabled: "1",
      search: "mail",
      start: "0",
      page_length: "20",
    });
    expect(result.actions[0]).toMatchObject({ code: "SEND_EMAIL" });
  });

  it("loads action types and time slots", async () => {
    fetchMock
      .mockResolvedValueOnce(
        json({
          total: 1,
          action_types: [
            { name: "CONTACT", display_name: "Liên hệ", enabled: true },
          ],
        }),
      )
      .mockResolvedValueOnce(json({ time_slots: ["0-6", "6-12"] }));

    await expect(listNbaActionTypes()).resolves.toMatchObject({
      actionTypes: [{ actionType: "CONTACT" }],
    });
    await expect(listNbaTimeSlots()).resolves.toEqual({
      timeSlots: ["0-6", "6-12"],
    });
    expect(fetchMock.mock.calls[0]![0]).toContain("/api/v1/nba/action-types");
    expect(fetchMock.mock.calls[1]![0]).toBe(`${API}/api/v1/nba/time-slots`);
  });

  it("surfaces an API error with its status and code", async () => {
    fetchMock.mockResolvedValue(
      json({ error: { code: "FORBIDDEN", message: "Không có quyền." } }, 403),
    );

    await expect(deleteNbaAction("CALL")).rejects.toMatchObject({
      name: "NbaActionsApiError",
      status: 403,
      code: "FORBIDDEN",
    });
  });
});
