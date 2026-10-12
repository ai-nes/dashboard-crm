import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StudentExportDialog from "./student-export-dialog";

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
      label: "Mã học sinh",
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
    <StudentExportDialog
      isOpen
      canExport
      onOpenChange={vi.fn()}
      scopeKey="actor"
      initialFilters={{}}
    />,
  );
describe("Student export dialog catalog state", () => {
  beforeEach(() => {
    state.query = { data: catalog, isError: false, refetch: vi.fn() };
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
