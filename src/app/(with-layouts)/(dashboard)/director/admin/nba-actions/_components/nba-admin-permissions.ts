import { getCrmDoctypePermissions } from "@/components/common/auth/permissions";
import type { CurrentUser } from "@/services/api/auth";

export function getNbaAdminPermissions(user: CurrentUser | null | undefined) {
  return {
    actions: getCrmDoctypePermissions(user, "CRM Action"),
    actionTypes: getCrmDoctypePermissions(user, "CRM Action Type"),
    timingPolicies: getCrmDoctypePermissions(user, "CRM Timing Policy"),
  };
}
