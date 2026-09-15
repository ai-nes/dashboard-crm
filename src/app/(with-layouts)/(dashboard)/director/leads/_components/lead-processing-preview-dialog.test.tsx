import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const dialogSource = readFileSync(
  new URL("./lead-processing-preview-dialog.tsx", import.meta.url),
  "utf8",
);
const dashboardSource = readFileSync(
  new URL("./leads-overview-dashboard.tsx", import.meta.url),
  "utf8",
);

describe("Lead processing preview contract", () => {
  it("shows duplicate outcomes as badges in a table", () => {
    expect(dialogSource).toContain("Kết quả xem trước xử lý Lead");
    expect(dialogSource).toContain('color="error">Trùng');
    expect(dialogSource).toContain('color="success">Không trùng');
    expect(dialogSource).toContain("Xác nhận xử lý");
    expect(dialogSource).not.toContain("Dòng cần kiểm tra");
  });

  it("previews before running the mutating processing command", () => {
    expect(dashboardSource).toContain("usePreviewNewLeadsMutation");
    expect(dashboardSource).toContain("previewNewLeadsMutation.mutateAsync");
    expect(dashboardSource).toContain("LeadProcessingPreviewDialog");
    expect(dashboardSource).toContain("processNewLeadsMutation.mutateAsync");
  });
});
