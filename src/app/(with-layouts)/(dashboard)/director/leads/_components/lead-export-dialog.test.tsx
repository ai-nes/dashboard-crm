import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LeadExportDialog from "./lead-export-dialog";

const state = vi.hoisted(() => ({ query: {} as Record<string, unknown> }));
vi.mock("@tanstack/react-query", () => ({
  useQuery: () => state.query,
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  useMutation: () => ({ isPending: false, mutate: vi.fn() }),
}));
vi.mock("@/components/common/multi-step-dialog", () => ({
  MultiStepDialog: ({
    currentStep,
    children,
    footer,
  }: {
    currentStep: number;
    children: React.ReactNode;
    footer: React.ReactNode;
  }) => (
    <section data-step={currentStep}>
      {children}
      {footer}
    </section>
  ),
}));
const catalog = {
  fields: [
    {
      id: "code",
      label: "Mã Lead",
      group: "Thông tin chính",
      type: "text",
      operators: ["contains"],
    },
  ],
  defaultColumnIds: ["code"],
  maxRows: 10000,
};
const render = () =>
  renderToStaticMarkup(
    <LeadExportDialog
      isOpen
      canExport
      onOpenChange={vi.fn()}
      scopeKey="actor"
      initialFilters={{
        status: "NEW",
        resolution: "PENDING",
        campaign: "Campaign A",
        admissionYear: "2026",
        q: "Nguyen",
      }}
    />,
  );
describe("Lead export dialog catalog state", () => {
  beforeEach(() => {
    state.query = { data: catalog, isError: false, refetch: vi.fn() };
  });
  it("shows inherited Lead list filters and uses the Lead catalog cache", () => {
    const html = render();
    expect(html).toContain("Kỳ tuyển sinh 2026");
    expect(html).toContain("Tình trạng NEW");
    expect(html).toContain("Kết quả PENDING");
    expect(html).toContain("Chiến dịch Campaign A");
    expect(html).toContain("Nguyen");
  });
  it("does not trust cached fields after catalog refresh returns403", () => {
    state.query = {
      data: catalog,
      isError: true,
      error: new Error("Không có quyền xuất"),
      refetch: vi.fn(),
    };
    const html = render();
    expect(html).toContain("Không có quyền xuất");
    expect(html).not.toContain("Tiếp: Chọn cột");
    expect(html).not.toContain("Tải file Excel");
  });
  it("uses the first zero-based step for loading and filter content", () => {
    expect(render()).toContain('data-step="0"');
    state.query = { data: undefined, isError: false };
    expect(render()).toContain('data-step="0"');
  });
});
