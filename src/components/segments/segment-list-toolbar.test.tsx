import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import type { Table } from "@tanstack/react-table";
import { describe, expect, it, vi } from "vitest";

import type { SegmentListItem } from "./segment-list-types";
import { SegmentListToolbar } from "./segment-list-toolbar";

vi.mock("react-aria-components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-aria-components")>();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  );
  return {
    ...actual,
    Tab: Wrapper,
    TabList: Wrapper,
    TabPanel: Wrapper,
    Tabs: Wrapper,
  };
});

describe("SegmentListToolbar server-paginated counts", () => {
  it("keeps the all-status count separate from the selected status total", () => {
    const table = {
      options: { data: [] },
      getColumn: () => undefined,
    } as unknown as Table<SegmentListItem>;
    const markup = renderToStaticMarkup(
      <SegmentListToolbar
        table={table}
        serverPagination={{
          search: "",
          status: "archive",
          total: 5,
          totalAll: 12,
          onSearchChange: vi.fn(),
          onStatusChange: vi.fn(),
        }}
      >
        <div>5 archived rows</div>
      </SegmentListToolbar>,
    );

    expect(markup).toContain("Tất cả");
    expect(markup).toContain(">12</span>");
    expect(markup).toContain("Lưu trữ");
    expect(markup).toContain(">5</span>");
    expect(markup).toContain("5 archived rows");
  });
});
