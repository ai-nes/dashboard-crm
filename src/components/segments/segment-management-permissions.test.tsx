import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { CurrentUser } from "@/services/api/auth";
import SegmentManagementPage from "@/app/(with-layouts)/(dashboard)/sale/next-best-action/_components/segment-management-page";
import { getSegmentListColumns } from "./segment-list-columns";
import { canManageSegment } from "./segment-permissions";
import { toSegmentListItem } from "./segment-list-types";

const state = vi.hoisted(() => ({ user: null as CurrentUser | null }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/lead-sale/segments",
}));
vi.mock("@/components/common/auth/auth-provider", () => ({
  useAuth: () => ({ user: state.user }),
}));
vi.mock("./segment-list", () => ({
  SegmentList: () => <p>Danh sách segments</p>,
}));
vi.mock("./segment-status-select", () => ({
  SegmentStatusSelect: () => <button>Đổi trạng thái</button>,
}));
vi.mock("@/components/common/table-row-actions", () => ({
  TableRowActions: ({
    actions,
  }: {
    actions: {
      id: string;
      label: string;
      href?: string;
      isVisible?: boolean;
    }[];
  }) => (
    <div>
      {actions
        .filter((action) => action.isVisible !== false)
        .map((action) => (
          <span key={action.id}>{action.label}</span>
        ))}
    </div>
  ),
}));

const segment = toSegmentListItem({
  name: "segment-id",
  segment_code: "SEG-261012-ABCDEF",
  title: "Tiềm năng cao",
  owner: "lead-sales-id",
  status: "draft",
  revision: 0,
});

function user(isAdministrator: boolean): CurrentUser {
  return {
    user: "lead@example.test",
    email: "lead@example.test",
    full_name: "Lead Sales",
    user_image: null,
    roles: ["Lead Sales"],
    crm_profile: "lead_sales",
    crm_role: "Lead Sales",
    crm_user_id: "lead-sales-id",
    crm_is_administrator: isAdministrator,
    crm_capabilities: ["team.oversee"],
    // Exercise stale metadata from a session opened before the backend fix.
    crm_doctype_permissions: {
      "CRM Segment": {
        read: true,
        create: true,
        write: true,
        delete: true,
        export: false,
      },
    },
  };
}

describe("Segment management actions", () => {
  it.each([false, true])(
    "renders create and row mutations only for an administrator (%s)",
    (isAdministrator) => {
      state.user = user(isAdministrator);
      const header = renderToStaticMarkup(
        <SegmentManagementPage createHref="/lead-sale/segments/create" />,
      );
      expect(header.includes("Tạo segment")).toBe(isAdministrator);
      expect(header).toContain("Danh sách segments");

      const columns = getSegmentListColumns({
        detailBaseHref: "/lead-sale/segments",
        canUpdate: (row) => canManageSegment(state.user, row, "update"),
        canDelete: (row) => canManageSegment(state.user, row, "delete"),
        onStatusChange: vi.fn(),
        onDelete: vi.fn(),
      });
      const renderCell = (key: string) => {
        const column = columns.find(
          (item) =>
            item.id === key ||
            ("accessorKey" in item && item.accessorKey === key),
        );
        const cell = column?.cell as (context: {
          row: { original: typeof segment };
        }) => ReactNode;
        return renderToStaticMarkup(
          <>{cell({ row: { original: segment } })}</>,
        );
      };
      const actions = renderCell("actions");
      expect(actions).toContain("Xem chi tiết");
      expect(actions.includes("Chỉnh sửa")).toBe(isAdministrator);
      expect(actions.includes("Xóa")).toBe(isAdministrator);
      expect(renderCell("status").includes("Đổi trạng thái")).toBe(
        isAdministrator,
      );
    },
  );
});
