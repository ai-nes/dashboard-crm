import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { TableRowActions } from "./table-row-actions";

const callbacks = vi.hoisted(() => new Map<string, () => void>());
vi.mock("@/components/tailgrids/core/dropdown", () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuTrigger: ({ children, ...props }: { children: ReactNode }) => (
    <button {...props}>{children}</button>
  ),
  DropdownMenuContent: ({ children }: { children: ReactNode }) => (
    <div role="menu">{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    href,
    onAction,
    "aria-label": label,
    isDisabled,
  }: {
    children: ReactNode;
    href?: string;
    onAction?: () => void;
    "aria-label"?: string;
    isDisabled?: boolean;
  }) => {
    if (label && onAction) callbacks.set(label, onAction);
    return href ? (
      <a href={href} aria-label={label}>
        {children}
      </a>
    ) : (
      <button aria-label={label} disabled={isDisabled}>
        {children}
      </button>
    );
  },
}));

describe("Shared table row actions", () => {
  it("renders a vertical menu with real navigation and deferred actions", () => {
    const onDelete = vi.fn();
    const html = renderToStaticMarkup(
      <TableRowActions
        label="Lead LD-001"
        actions={[
          { id: "view", label: "Xem chi tiết", href: "/leads/LD-001" },
          { id: "delete", label: "Xóa", onAction: onDelete, variant: "danger" },
        ]}
      />,
    );
    expect(html).toContain('aria-label="Thao tác Lead LD-001"');
    expect(html).toContain('href="/leads/LD-001"');
    expect(onDelete).not.toHaveBeenCalled();
    callbacks.get("Xóa Lead LD-001")?.();
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it("hides denied and unsupported actions", () => {
    const html = renderToStaticMarkup(
      <TableRowActions
        label="bản ghi"
        actions={[
          { id: "view", label: "Xem", href: "/records/1" },
          { id: "edit", label: "Sửa", onAction: vi.fn(), isVisible: false },
          { id: "delete", label: "Xóa" },
        ]}
      />,
    );
    expect(html).toContain("Xem");
    expect(html).not.toContain("Sửa");
    expect(html).not.toContain("Xóa");
  });

  it("renders no trigger when no actions are available", () => {
    expect(
      renderToStaticMarkup(<TableRowActions label="bản ghi" actions={[]} />),
    ).toBe("");
    expect(
      renderToStaticMarkup(
        <TableRowActions
          label="bản ghi"
          actions={[
            { id: "delete", label: "Xóa", onAction: vi.fn(), isVisible: false },
          ]}
        />,
      ),
    ).toBe("");
  });

  it("keeps an applicable pending action disabled", () => {
    const html = renderToStaticMarkup(
      <TableRowActions
        label="bản ghi"
        actions={[
          { id: "delete", label: "Xóa", onAction: vi.fn(), isDisabled: true },
        ]}
      />,
    );
    expect(html).toContain('aria-label="Xóa bản ghi" disabled=""');
  });

  it("stops clicks and keyboard events from activating the containing row", () => {
    const menu = TableRowActions({
      label: "bản ghi",
      actions: [{ id: "view", label: "Xem", href: "/record" }],
    });
    const click = { stopPropagation: vi.fn() };
    const keyboard = { stopPropagation: vi.fn() };
    menu?.props.onClick(click);
    menu?.props.onKeyDown(keyboard);
    expect(click.stopPropagation).toHaveBeenCalledOnce();
    expect(keyboard.stopPropagation).toHaveBeenCalledOnce();
  });
});
