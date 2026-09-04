import { describe, expect, it } from "vitest";

import {
  normalizeNbaActionTypesResponse,
  normalizeNbaActionsResponse,
  normalizeNbaTimeSlotsResponse,
} from "./normalizers";

describe("NBA action API normalizers", () => {
  it("normalizes the Frappe action list and JSON time slots", () => {
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
              default_channel: "Phone",
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
          defaultChannel: "Phone",
          allowedTimeSlots: ["6-12", "18-24"],
          enabled: true,
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
