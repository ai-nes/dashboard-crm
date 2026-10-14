import { describe, expect, it } from "vitest";

import {
  crmDateTimeToApi,
  crmTaskDateKey,
  crmTaskDateForInput,
  crmTaskDateTimeToTimestamp,
  crmTaskDateTimeParts,
} from "./crm-task-date-time";

describe("CRM task date and time", () => {
  it("serializes Vietnamese dates with an explicit +07:00 offset", () => {
    expect(crmDateTimeToApi("13/10/2026", "23:59")).toBe(
      "2026-10-13T23:59:00+07:00",
    );
  });

  it("renders stored UTC instants in the CRM timezone", () => {
    expect(crmTaskDateTimeParts("2026-10-13T16:59:00.000Z")).toEqual({
      date: "13/10/2026",
      time: "23:59",
    });
  });

  it("provides the ISO date expected by DatePickerField", () => {
    expect(crmTaskDateForInput("2026-10-13T16:59:00.000Z")).toBe(
      "2026-10-13",
    );
    expect(crmTaskDateForInput("13/10/2026")).toBe("2026-10-13");
  });

  it("compares CRM-local deadlines as +07 instants regardless of browser timezone", () => {
    expect(crmTaskDateTimeToTimestamp("2026-10-12", "15:00")).toBe(
      Date.parse("2026-10-12T08:00:00.000Z"),
    );
    expect(crmTaskDateKey("2026-10-12T16:59:00.000Z")).toBe("2026-10-12");
  });
});
