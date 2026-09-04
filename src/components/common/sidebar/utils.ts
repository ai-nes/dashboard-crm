import { NAV_DATA } from "./data";
import type { NavigationItem, NavigationSection } from "./data";
import { getEffectiveCrmRoles } from "../auth/rbac";

/**
 * Checks if the current pathname matches the target href, or if the pathname is a subpath of the target href.=
 */
export function isPathActive(href: string, pathname: string): boolean {
  if (!href) return false;

  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(href + "/");
}

function isNavigationItemActive(
  item: Pick<NavigationItem, "url" | "exact">,
  pathname: string,
): boolean {
  if (!item.url) return false;
  return item.exact ? pathname === item.url : isPathActive(item.url, pathname);
}

/**
 * Find the nav group whose child URLs include the current pathname.
 * Returns the group's `title` (used as the Disclosure `id`) or null.
 */
export function findActiveGroupKey(pathname: string): string | null {
  return findActiveGroupKeyInNavigation(pathname, NAV_DATA);
}

export function findActiveGroupKeyInNavigation(
  pathname: string,
  navigation: NavigationSection[],
): string | null {
  for (const section of navigation) {
    for (const item of section.items) {
      if (item.items && item.items.length > 0) {
        const hasMatch = item.items.some((child) =>
          isNavigationItemActive(child, pathname),
        );
        if (hasMatch) return item.title;
      }
    }
  }
  return null;
}

function hasRoleAccess(
  itemRoles: readonly string[],
  userRoles: readonly string[],
): boolean {
  return itemRoles.some((role) => userRoles.includes(role));
}

export function filterNavigationByRoles(
  navigation: NavigationSection[],
  userRoles: readonly string[],
): NavigationSection[] {
  const effectiveRoles = getEffectiveCrmRoles(userRoles);

  return navigation
    .map((section) => {
      const items = section.items
        .map((item) => {
          const childItems = item.items
            ? item.items.filter((child) =>
                hasRoleAccess(child.roles, effectiveRoles),
              )
            : undefined;
          const itemIsVisible =
            hasRoleAccess(item.roles, effectiveRoles) ||
            Boolean(childItems?.length);

          if (!itemIsVisible) return null;
          return { ...item, items: childItems };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      return { ...section, items };
    })
    .filter((section) => section.items.length > 0);
}
