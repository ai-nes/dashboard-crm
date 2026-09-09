import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const dialogSource = readFileSync(
  new URL("./quick-create-lead-dialog.tsx", import.meta.url),
  "utf8",
);

describe("quick create Lead dialog composition", () => {
  it("uses the shared Dialog as the only modal overlay", () => {
    expect(dialogSource).not.toContain(
      'from "@/components/tailgrids/core/overlay"',
    );
    expect(dialogSource).toContain("isOpen={isOpen}");
    expect(dialogSource).toContain("onOpenChange={handleOpenChange}");
  });
});
