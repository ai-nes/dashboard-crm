import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const dialogSource = readFileSync(
  new URL("./quick-create-lead-dialog.tsx", import.meta.url),
  "utf8",
);
const importPanelSource = readFileSync(
  new URL("./quick-create-lead-import-panel.tsx", import.meta.url),
  "utf8",
);
const importDialogSource = readFileSync(
  new URL("./lead-import-dialog.tsx", import.meta.url),
  "utf8",
);

describe("quick create Lead dialog composition", () => {
  it("uses the pulled Backdrop/Dialog modal composition", () => {
    expect(dialogSource).toContain(
      'from "@/components/tailgrids/core/overlay"',
    );
    expect(dialogSource).toContain("<Backdrop");
    expect(dialogSource).toContain("<Dialog");
    expect(dialogSource).toContain("isOpen={isOpen}");
    expect(dialogSource).toContain("onOpenChange={handleOpenChange}");
    expect(dialogSource).toContain("isDismissable={!isSubmitting}");
  });

  it("keeps file import in a separate dialog", () => {
    expect(dialogSource).not.toContain("TabRoot");
    expect(dialogSource).not.toContain("QuickCreateLeadImportPanel");
    expect(importDialogSource).toContain("<QuickCreateLeadImportPanel");
    expect(importDialogSource).toContain('ariaLabel="Import Lead từ file"');
    expect(importPanelSource).toContain("<DropZone");
    expect(importPanelSource).toContain("<FileTrigger");
    expect(importPanelSource).toContain("inspectLeadImport");
    expect(importPanelSource).toContain("previewLeadImport");
    expect(importPanelSource).toContain("<ValidationPreview");
  });
});
