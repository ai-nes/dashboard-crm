import { describe, expect, it } from "vitest";

import { getDefaultInteractionTab } from "./student-interactions-tabs";

describe("student interaction tab", () => {
  it("opens the calls tab when calls are available", () => {
    expect(
      getDefaultInteractionTab([
        {
          id: "CALL-1",
          time: "2026-09-09 · 20:30",
          direction: "inbound",
          outcome: "connected",
          callerName: "Phụ huynh",
          receiverName: "Tư vấn viên",
        },
      ]),
    ).toBe("calls");
  });

  it("keeps Zalo as the empty-interaction fallback", () => {
    expect(getDefaultInteractionTab([])).toBe("zalo");
  });
});
