import { describe, expect, it } from "vitest";

import { ACTION_TYPES } from "@/services/api/director-next-best-action";

import { CARD_SPECS } from "./card-specs";
import {
  ACTION_CARD_REGISTRY,
  GenericActionCard,
  resolveActionCard,
} from "./registry";

describe("action card registry", () => {
  it("has exactly one card per contract action type", () => {
    expect(Object.keys(ACTION_CARD_REGISTRY).sort()).toEqual(
      [...ACTION_TYPES].sort(),
    );
  });

  it("resolves every known type to its own component", () => {
    for (const type of ACTION_TYPES) {
      expect(resolveActionCard(type)).toBe(ACTION_CARD_REGISTRY[type]);
    }
  });

  it("falls back to the generic card for unknown / missing types", () => {
    expect(resolveActionCard("NOT_A_TYPE")).toBe(GenericActionCard);
    expect(resolveActionCard(null)).toBe(GenericActionCard);
    expect(resolveActionCard(undefined)).toBe(GenericActionCard);
  });

  it("defines a field spec for every action type", () => {
    for (const type of ACTION_TYPES) {
      expect(CARD_SPECS[type].length).toBeGreaterThan(0);
    }
  });
});
