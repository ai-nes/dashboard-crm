import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { MajorCatalogPermissions } from "./student-configuration-permissions";
import { MajorCatalogManagement } from "./major-catalog-management";

const state = vi.hoisted(() => ({
  group: {
    id: "6d8c0d1a-4053-4aa4-9329-8e1185cd7d35",
    code: "MG-SCIENCE",
    name: "Khoa học",
    description: "Các ngành khoa học",
    enabled: true,
    sortOrder: 1,
  },
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

vi.mock("@/hooks/use-major-catalog-queries", () => ({
  useDeleteMajorGroupMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteMajorMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useMajorGroupsQuery: () => ({
    data: { groups: [state.group], total: 1 },
    isPending: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  }),
  useMajorsQuery: () => ({
    data: { majors: [], total: 0 },
    isPending: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  }),
  useUpdateMajorGroupMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("@/components/common/admin/admin-table", () => ({
  AdminTablePagination: () => null,
}));
vi.mock("@/components/common/admin/admin-search-input", () => ({
  AdminSearchInput: () => <input />,
}));
vi.mock("@/components/common/delete-record-dialog", () => ({
  DeleteRecordDialog: () => null,
}));
vi.mock("@/components/tailgrids/core/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));
vi.mock("@/components/tailgrids/core/button", () => ({
  Button: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));
vi.mock("@/components/tailgrids/core/select", () => {
  const Wrapper = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  return {
    Select: Wrapper,
    SelectContent: Wrapper,
    SelectIndicator: () => null,
    SelectItem: Wrapper,
    SelectTrigger: Wrapper,
    SelectValue: () => null,
  };
});
vi.mock("@/components/tailgrids/core/table", () => {
  const Wrapper = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  return {
    TableBody: Wrapper,
    TableCell: Wrapper,
    TableHead: Wrapper,
    TableHeader: Wrapper,
    TableRoot: Wrapper,
    TableRow: Wrapper,
  };
});
vi.mock("./admission-catalog-panel", () => ({
  AdmissionCatalogPanel: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
}));
vi.mock("./catalog-ordering-panel", () => ({ CatalogOrderingPanel: () => null }));
vi.mock("./major-editor-dialog", () => ({ MajorEditorDialog: () => null }));
vi.mock("./major-group-editor-dialog", () => ({ MajorGroupEditorDialog: () => null }));

const permissions = {
  majorGroups: { canCreate: false, canRead: true, canUpdate: false, canDelete: false },
  majors: { canCreate: false, canRead: false, canUpdate: false, canDelete: false },
} as unknown as MajorCatalogPermissions;

describe("Major Group detail links", () => {
  it("uses the group's business code in the detail URL", () => {
    const markup = renderToStaticMarkup(
      <MajorCatalogManagement permissions={permissions} />,
    );

    expect(markup).toContain('href="/director/admin/majors/MG-SCIENCE"');
  });
});
