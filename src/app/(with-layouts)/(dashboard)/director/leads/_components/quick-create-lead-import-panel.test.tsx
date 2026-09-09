import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const panelSource = readFileSync(
  new URL("./quick-create-lead-import-panel.tsx", import.meta.url),
  "utf8",
);
const importDialogSource = readFileSync(
  new URL("./lead-import-dialog.tsx", import.meta.url),
  "utf8",
);
const mappingPreviewSource = readFileSync(
  new URL("./lead-import-mapping-preview.tsx", import.meta.url),
  "utf8",
);

describe("quick create Lead import campaign contract", () => {
  it("exposes campaign selection and submits the original file with mapping", () => {
    expect(panelSource).toContain("CreateDialogSelect");
    expect(panelSource).toMatch(/campaignOptions|campaigns/);
    expect(panelSource).toContain("campaignCode");
    expect(panelSource).toContain("inspectLeadImport");
    expect(panelSource).toMatch(
      /previewLeadImport\(\s*file,\s*(?:campaignCode|campaignCode \|\| undefined)/,
    );
    expect(panelSource).toContain("LeadImportMappingPreview");
    expect(panelSource).toMatch(/onImport\(\s*file,\s*campaignCode,\s*mapping/);
    expect(panelSource).not.toContain("const validRows");
  });

  it("keeps campaign and mapping context out of browser-normalized rows", () => {
    expect(panelSource).toContain("onImport(file, campaignCode, mapping)");
    expect(panelSource).not.toContain("Object.fromEntries");
    expect(panelSource).not.toContain("const validRows");
  });

  it("derives required mapping gates from the backend inspect contract", () => {
    expect(panelSource).toContain("inspection?.requiredFields");
    expect(panelSource).toContain("requiredImportFields.every");
    expect(panelSource).not.toContain("REQUIRED_IMPORT_FIELDS");
  });

  it("renders a local projected preview from the current mapping", () => {
    expect(panelSource).toContain("requiredFields={inspection.requiredFields}");
    expect(mappingPreviewSource).toContain("Xem trước dữ liệu theo target CRM");
    expect(mappingPreviewSource).toContain("projectedColumns");
    expect(mappingPreviewSource).toContain("aria-live=\"polite\"");
  });

  it("fetches all visible campaigns and allows only ACTIVE or CLOSED", () => {
    expect(importDialogSource).toContain("useLeadSaleCampaignsQuery");
    expect(importDialogSource).toMatch(
      /useLeadSaleCampaignsQuery\(\s*\{\s*\}\s*\)/,
    );
    expect(importDialogSource).not.toMatch(
      /useLeadSaleCampaignsQuery\(\s*\{\s*leadOnly\s*:\s*true/,
    );
    expect(importDialogSource).toContain("ACTIVE");
    expect(importDialogSource).toContain("CLOSED");
    expect(importDialogSource).toMatch(/toUpperCase\(\)/);
    expect(importDialogSource).toMatch(
      /stableCode[\s\S]*title|title[\s\S]*stableCode/,
    );
    expect(importDialogSource).toMatch(/campaigns\s*\.\s*(?:map|filter)/);
  });

  it("renders accessible loading, error/retry, and filtered-empty states", () => {
    expect(importDialogSource).toMatch(/campaignsQuery\.isPending/);
    expect(importDialogSource).toMatch(/campaignsQuery\.isError/);
    expect(importDialogSource).toMatch(/campaignsQuery\.refetch/);
    expect(importDialogSource).toMatch(/role=\"status\"/);
    expect(importDialogSource).toMatch(/role=\"alert\"/);
    expect(importDialogSource).toMatch(
      /campaignOptions\.length|availableCampaigns\.length|filteredCampaigns\.length/,
    );
    expect(importDialogSource).toMatch(/campaign/i);
  });

  it("allows file preview before campaign selection", () => {
    const fileHandlerStart = panelSource.indexOf("handleSelectedFile");
    const previewCall = panelSource.indexOf(
      "inspectLeadImport(",
      fileHandlerStart,
    );
    const nextHandler = panelSource.indexOf("const handleNext");

    expect(fileHandlerStart).toBeGreaterThanOrEqual(0);
    expect(previewCall).toBeGreaterThan(fileHandlerStart);
    expect(previewCall).toBeLessThan(nextHandler);
    expect(panelSource.slice(fileHandlerStart, nextHandler)).not.toMatch(
      /!campaignCode/,
    );
  });

  it("clears inspecting state when a file selection is reset", () => {
    expect(panelSource).toContain("setIsInspecting(false)");
    expect(panelSource).toMatch(
      /setFilename\(""\);\s*setIsInspecting\(false\);\s*setCurrentStep\(0\)/,
    );
  });

  it("keeps the selected file visible when inspect fails", () => {
    const catchStart = panelSource.indexOf("} catch (requestError)");
    const finallyStart = panelSource.indexOf("} finally", catchStart);
    const catchSource = panelSource.slice(catchStart, finallyStart);

    expect(catchSource).not.toContain('setFile(null)');
    expect(catchSource).not.toContain('setFilename("")');
    expect(catchSource).toContain("setError(");
  });

  it("uses one outer multi-step dialog owner without a nested form", () => {
    expect(importDialogSource).toContain("MultiStepDialog");
    expect(panelSource).not.toMatch(/<form[\s>]/);
  });

  it("validates campaign and required mappings before mapped preview", () => {
    const nextStart = panelSource.indexOf("const handleNext");
    const nextSource = panelSource.slice(nextStart);
    const campaignGuardOffset = nextSource.search(
      /if\s*\(\s*!campaignCode(?:\.trim\(\))?\s*\)/,
    );
    const mappingGuard = panelSource.indexOf("!hasCompleteMapping", nextStart);
    const previewCall = panelSource.indexOf("previewLeadImport(", nextStart);
    const campaignGuard =
      campaignGuardOffset < 0 ? -1 : nextStart + campaignGuardOffset;

    expect(campaignGuard).toBeGreaterThan(nextStart);
    expect(campaignGuard).toBeLessThan(mappingGuard);
    expect(mappingGuard).toBeLessThan(previewCall);
  });
});
