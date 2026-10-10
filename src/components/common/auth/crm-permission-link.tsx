"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useAuth } from "./auth-provider";
import { canReadCrmPath } from "./permissions";
import { canAccessDashboardPath } from "./rbac";

function permissionHref(href: ComponentProps<typeof Link>["href"]): string {
  if (typeof href === "string") return href;
  const query =
    typeof href.query === "string"
      ? href.query
      : new URLSearchParams(
          Object.entries(href.query ?? {}).flatMap(([key, value]) =>
            value == null
              ? []
              : (Array.isArray(value) ? value : [value]).map((item) => [
                  key,
                  String(item),
                ]),
          ),
        ).toString();
  return `${href.pathname ?? "/"}${query ? `?${query}` : ""}`;
}

export function CrmPermissionLink(props: ComponentProps<typeof Link>) {
  const { user } = useAuth();
  const href = permissionHref(props.href);
  const path = href.split(/[?#]/, 1)[0];
  if (
    !canReadCrmPath(href, user) ||
    !canAccessDashboardPath(path, user?.roles, user?.crm_capabilities)
  ) {
    return null;
  }
  return <Link {...props} />;
}
