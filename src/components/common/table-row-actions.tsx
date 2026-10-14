"use client";

import type { ReactNode } from "react";
import { Copy4, Eye, MenuKebab1, Pencil1, Trash1 } from "@tailgrids/icons";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/tailgrids/core/dropdown";

export interface TableRowAction {
  id: string;
  label: string;
  ariaLabel?: string;
  icon?: ReactNode;
  href?: string;
  onAction?: () => void;
  variant?: "default" | "danger";
  isVisible?: boolean;
  isDisabled?: boolean;
}

const actionIcons: Record<string, ReactNode> = {
  view: <Eye size={16} aria-hidden="true" />,
  edit: <Pencil1 size={16} aria-hidden="true" />,
  delete: <Trash1 size={16} aria-hidden="true" />,
  duplicate: <Copy4 size={16} aria-hidden="true" />,
};

/** Features supply authorized actions; the menu owns presentation only. */
export function TableRowActions({
  label,
  actions,
  isDisabled = false,
}: {
  label: string;
  actions: readonly TableRowAction[];
  isDisabled?: boolean;
}) {
  const available = actions.filter(
    (action) => action.isVisible !== false && (action.href || action.onAction),
  );
  if (available.length === 0) return null;

  return (
    <div
      className="flex justify-end"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Thao tác ${label}`}
          isDisabled={isDisabled}
          className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-background-gray-secondary_alt hover:text-text-primary focus-visible:ring-2 focus-visible:ring-button-primary-focus-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MenuKebab1 size={18} aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          placement="bottom end"
          style={{ zIndex: 50 }}
          className="min-w-44 p-1"
        >
          {available.map((action) => (
            <DropdownMenuItem
              key={action.id}
              id={action.id}
              href={action.href}
              onAction={action.onAction}
              aria-label={action.ariaLabel ?? `${action.label} ${label}`}
              textValue={action.label}
              isDisabled={action.isDisabled || isDisabled}
              className={`px-3 py-2 ${action.variant === "danger" ? "text-button-error-outline-text" : "text-text-primary"}`}
            >
              {action.icon ?? actionIcons[action.id]}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
