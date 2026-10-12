import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import LeadList from "./lead-list";
import type { LeadListItem } from "./types";

const actions = vi.hoisted(() => new Map<string, () => void>());

// Expose menu items for SSR assertions; this does not verify popover interaction.
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
    "aria-label": label,
    isDisabled,
    onAction,
  }: {
    children: ReactNode;
    href?: string;
    "aria-label"?: string;
    isDisabled?: boolean;
    onAction?: () => void;
  }) => {
    if (label && onAction) actions.set(label, onAction);
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

const lead: LeadListItem = {
  id: "lead-id",
  leadCode: "LD-001",
  studentCode: null,
  studentId: null,
  initials: "NT",
  name: "Nguyễn Test",
  phone: "0912345678",
  school: "School",
  status: "NEW",
  result: "PENDING",
  source: "Campaign",
  owner: "",
  contactNoAnswer: 0,
  contactSuccess: 0,
};
describe("Lead row delete action", () => {
  it("renders a delete action for an authorized row", () => {
    const onDeleteRequest = vi.fn();
    const html = renderToStaticMarkup(
      <QueryClientProvider client={new QueryClient()}>
        <LeadList
          leads={[lead]}
          canDeleteLead={() => true}
          onDeleteRequest={onDeleteRequest}
        />
      </QueryClientProvider>,
    );
    expect(html).toContain('aria-label="Thao tác Lead LD-001"');
    expect(html).toContain('aria-label="Xóa Lead LD-001"');
    expect(onDeleteRequest).not.toHaveBeenCalled();
    actions.get("Xóa Lead LD-001")?.();
    expect(onDeleteRequest).toHaveBeenCalledExactlyOnceWith(lead);
  });
  it("hides delete for denied rows", () => {
    const html = renderToStaticMarkup(
      <QueryClientProvider client={new QueryClient()}>
        <LeadList
          leads={[lead]}
          canDeleteLead={() => false}
          onDeleteRequest={() => {}}
        />
      </QueryClientProvider>,
    );
    expect(html).not.toContain('aria-label="Xóa Lead');
  });

  it("offers editing only for an authorized row and opens the existing editor", () => {
    const render = (canEdit: boolean) =>
      renderToStaticMarkup(
        <QueryClientProvider client={new QueryClient()}>
          <LeadList leads={[lead]} canEditLead={() => canEdit} />
        </QueryClientProvider>,
      );
    expect(render(true)).toContain('aria-label="Chỉnh sửa Lead LD-001"');
    expect(render(true)).toContain(
      'href="/director/leads/LD-001?edit=contact"',
    );
    expect(render(false)).not.toContain('aria-label="Chỉnh sửa Lead');
    expect(render(false)).toContain("Xem chi tiết");
  });

  it("does not offer deletion without a handler", () => {
    const html = renderToStaticMarkup(
      <QueryClientProvider client={new QueryClient()}>
        <LeadList leads={[lead]} canDeleteLead={() => true} />
      </QueryClientProvider>,
    );
    expect(html).not.toContain('aria-label="Xóa Lead');
  });

  it("keeps permitted deletion visible but disabled while deleting", () => {
    const html = renderToStaticMarkup(
      <QueryClientProvider client={new QueryClient()}>
        <LeadList
          leads={[lead]}
          canDeleteLead={() => true}
          onDeleteRequest={() => {}}
          isDeleting
        />
      </QueryClientProvider>,
    );
    expect(html).toContain('aria-label="Xóa Lead LD-001" disabled=""');
  });
});
