import { getEffectiveDashboardRoles } from "@/components/common/auth/rbac";
import type { CurrentUser } from "@/services/api/auth";

/** Honors effective DocPerms and the current scoring policy editor gate. */
export function canEditScoreTemplates(user: CurrentUser | null): boolean {
  if (!user) return false;
  if (user.user === "Administrator") return true;
  const permission = user.crm_doctype_permissions?.["CRM Score Template"];
  if (permission) return permission.write;
  return Boolean(
    user &&
    (user.user === "Administrator" ||
      getEffectiveDashboardRoles(user.roles).includes("System Manager") ||
      user.crm_profile === "admissions_director"),
  );
}
