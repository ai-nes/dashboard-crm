import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ActionTypesTable from "./action-types-table";

const state = vi.hoisted(() => ({ enabled: undefined as boolean | undefined }));

vi.mock("@/hooks/use-nba-admin-queries", () => ({
  useNbaAdminActionTypesQuery: (_params: unknown, options?: { enabled?: boolean }) => {
    state.enabled = options?.enabled;
    return {
      data: {
        actionTypes: [
          {
            name: "action-type-1",
            actionType: "APPLICATION",
            displayName: "Hồ sơ",
            sortOrder: 1,
            enabled: true,
            modified: "2026-10-10T08:00:00Z",
          },
        ],
        total: 1,
      },
      isPending: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    };
  },
}));
vi.mock("./admin-table-toolbar", () => ({ default: () => null }));
vi.mock("../../nba-actions/_components/action-type-detail-dialog", () => ({
  default: () => null,
}));

function renderTable(
  permissions: {
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  },
) {
  return renderToStaticMarkup(<ActionTypesTable {...permissions} />);
}

describe("NBA action type UI permissions", () => {
  beforeEach(() => {
    state.enabled = undefined;
  });

  it("does not fetch or render action types without read permission", () => {
    const html = renderTable({
      canRead: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    });

    expect(state.enabled).toBe(false);
    expect(html).toContain("Bạn không có quyền xem nhóm hành động.");
    expect(html).not.toContain("APPLICATION");
  });

  it("shows view-only rows when reads are allowed and all mutations are denied", () => {
    const html = renderTable({
      canRead: true,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    });

    expect(state.enabled).toBe(true);
    expect(html).toContain("APPLICATION");
    expect(html).toContain("Xem nhóm Hồ sơ");
    expect(html).not.toContain("Tạo nhóm");
    expect(html).not.toContain("Chỉnh sửa nhóm Hồ sơ");
  });

  it("renders create and update affordances from their separate grants", () => {
    const html = renderTable({
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canDelete: false,
    });

    expect(html).toContain("Tạo nhóm");
    expect(html).toContain("Chỉnh sửa nhóm Hồ sơ");
  });
});
