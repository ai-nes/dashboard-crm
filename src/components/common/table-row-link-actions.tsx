"use client";

import { useAuth } from "@/components/common/auth/auth-provider";
import { canReadCrmPath } from "@/components/common/auth/permissions";
import { canAccessDashboardPath } from "@/components/common/auth/rbac";
import { TableRowActions } from "./table-row-actions";

/** Matches the existing CrmPermissionLink policy for record navigation. */
export function TableRowLinkActions({
  label,
  href,
}: {
  label: string;
  href: string;
}) {
  const { user, isLoading } = useAuth();
  const path = href.split(/[?#]/, 1)[0];
  if (
    isLoading ||
    !canReadCrmPath(href, user) ||
    !canAccessDashboardPath(path, user?.roles, user?.crm_capabilities)
  )
    return null;
  return (
    <TableRowActions
      label={label}
      actions={[{ id: "view", label: "Xem chi tiết", href }]}
    />
  );
}
