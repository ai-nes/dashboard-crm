import type { CurrentUser, SessionUser } from "@/services/api/auth";

export function isCtvSaleUser(
  user: Pick<CurrentUser, "roles" | "crm_role" | "crm_profile"> | null | undefined,
): boolean {
  return Boolean(
    user?.roles.includes("CTV Sale") ||
      user?.crm_role === "CTV Sale" ||
      user?.crm_profile === "ctv_sale",
  );
}

export function filterAssigneesToCurrentUser(
  assignees: SessionUser[],
  currentUserIdentifiers: readonly (string | null | undefined)[],
): SessionUser[] {
  const normalizedIdentifiers = new Set(
    currentUserIdentifiers
      .filter((value): value is string => Boolean(value))
      .map((value) => value.trim().toLowerCase()),
  );

  return assignees.filter((user) =>
    [user.name, user.email].some((identifier) =>
      normalizedIdentifiers.has(identifier.trim().toLowerCase()),
    ),
  );
}
