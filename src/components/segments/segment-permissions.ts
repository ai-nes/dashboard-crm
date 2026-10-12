import { getCrmDoctypePermissions } from "@/components/common/auth/permissions";
import type { CurrentUser } from "@/services/api/auth";

import type { SegmentListItem } from "./segment-list-types";

export function canCreateSegment(user: CurrentUser | null | undefined) {
  return (
    user?.crm_is_administrator === true &&
    getCrmDoctypePermissions(user, "CRM Segment").canCreate
  );
}

export function canReadSegments(user: CurrentUser | null | undefined) {
  return getCrmDoctypePermissions(user, "CRM Segment").canRead;
}

export function canManageSegment(
  user: CurrentUser | null | undefined,
  _segment: Pick<SegmentListItem, "ownerUserId">,
  action: "update" | "delete",
) {
  const permissions = getCrmDoctypePermissions(user, "CRM Segment");
  const hasActionGrant =
    action === "update" ? permissions.canUpdate : permissions.canDelete;
  const hasRowAuthority = user?.crm_is_administrator === true;

  return hasActionGrant && hasRowAuthority;
}
