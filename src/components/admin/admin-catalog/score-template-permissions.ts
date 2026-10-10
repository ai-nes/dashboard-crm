import {
  getCrmDoctypePermissions,
  type CrmDoctypePermissions,
} from "@/components/common/auth/permissions";
import type { CurrentUser } from "@/services/api/auth";

/** Score-template access is based on Nest's effective document grants. */
export function getScoreTemplatePermissions(
  user: CurrentUser | null | undefined,
): CrmDoctypePermissions {
  return getCrmDoctypePermissions(user, "CRM Score Template");
}
