import { describe, expect, it } from "vitest";

import type { InteractionSummary } from "@/services/api/interaction-intelligence";

import {
  getInteractionTypeLabel,
  getManualInteractionTypes,
  isCallInteraction,
  isOtherInteraction,
  isOtherInteractionType,
  isZaloInteraction,
} from "./student-interaction-utils";

function interaction(
  overrides: Partial<InteractionSummary> = {},
): InteractionSummary {
  return {
    id: "INTX-1",
    interaction_type: "NOTE",
    ...overrides,
  };
}

describe("student other interactions", () => {
  it("keeps calls and Zalo out of the Khác list", () => {
    expect(
      isOtherInteraction(interaction({ interaction_type: "PHONE_CALL" })),
    ).toBe(false);
    expect(
      isOtherInteraction(interaction({ interaction_type: "CONNECTED" })),
    ).toBe(false);
    expect(
      isOtherInteraction(interaction({ interaction_type: "MESSAGE" })),
    ).toBe(false);
    expect(
      isOtherInteraction(interaction({ interaction_type: "MESSAGE_CHATWOOT" })),
    ).toBe(false);
    expect(isOtherInteraction(interaction({ channel: "zalo" }))).toBe(false);
    expect(isOtherInteraction(interaction({ interaction_type: "NOTE" }))).toBe(
      true,
    );
  });

  it("recognizes the legacy call and Zalo records used by the detail view", () => {
    expect(
      isCallInteraction(interaction({ interaction_type: "COUNSELING" })),
    ).toBe(true);
    expect(isCallInteraction(interaction({ channel: "Call" }))).toBe(true);
    expect(
      isZaloInteraction(interaction({ interaction_type: "MESSAGE_CHATWOOT" })),
    ).toBe(true);
  });

  it.each(["ZALO_CHAT", "ZALO", "MESSAGE", "TIN_NHAN_CHATWOOT"])(
    "routes %s without a channel to Zalo, excluding Khác",
    (type) => {
      expect(isZaloInteraction(interaction({ interaction_type: type }))).toBe(
        true,
      );
      expect(isOtherInteractionType(type)).toBe(false);
    },
  );

  it.each(["CALL", "PHONE_CALL", "CONNECTED", "COUNSELING"])(
    "routes %s without a channel to calls, excluding Khác",
    (type) => {
      expect(isCallInteraction(interaction({ interaction_type: type }))).toBe(
        true,
      );
      expect(isOtherInteractionType(type)).toBe(false);
    },
  );

  it("offers canonical message and call choices once, with other types retained", () => {
    const types = ["ZALO_CHAT", "MESSAGE", "CALL", "PHONE_CALL", "NOTE"].map(
      (code) => ({
        code,
        display_name: code,
        enabled: true,
        sort_order: 0,
      }),
    );
    expect(getManualInteractionTypes(types).map((type) => type.code)).toEqual([
      "MESSAGE",
      "PHONE_CALL",
      "NOTE",
    ]);
  });

  it("only offers non-call and non-Zalo types for manual creation", () => {
    expect(isOtherInteractionType("PHONE_CALL")).toBe(false);
    expect(isOtherInteractionType("COUNSELING")).toBe(false);
    expect(isOtherInteractionType("MESSAGE")).toBe(false);
    expect(isOtherInteractionType("MESSAGE_CHATWOOT")).toBe(false);
    expect(isOtherInteractionType("EMAIL")).toBe(true);
    expect(isOtherInteractionType("NOTE")).toBe(true);
  });

  it("uses Vietnamese labels for legacy interaction types", () => {
    expect(
      getInteractionTypeLabel({
        code: "WEBINAR",
        display_name: "Webinar",
      }),
    ).toBe("Hội thảo trực tuyến");
    expect(
      getInteractionTypeLabel({
        code: "MAJOR_VIEW",
        display_name: "Major View",
      }),
    ).toBe("Xem ngành học");
    expect(
      getInteractionTypeLabel({
        code: "NOTE",
        display_name: "Ghi chú tư vấn",
      }),
    ).toBe("Ghi chú tư vấn");
  });
});
