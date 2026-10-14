import { describe, expect, it } from "vitest";

import { isActionTypeSaveDisabled } from "./action-type-dialog-model";

describe("NBA action-type save state", () => {
  it("ignores the unused detail query while creating a group", () => {
    expect(
      isActionTypeSaveDisabled({
        isNew: true,
        isDetailPending: true,
        isSaving: false,
      }),
    ).toBe(false);
  });

  it("still waits for an existing record and an active save", () => {
    expect(
      isActionTypeSaveDisabled({
        isNew: false,
        isDetailPending: true,
        isSaving: false,
      }),
    ).toBe(true);
    expect(
      isActionTypeSaveDisabled({
        isNew: true,
        isDetailPending: false,
        isSaving: true,
      }),
    ).toBe(true);
  });
});
