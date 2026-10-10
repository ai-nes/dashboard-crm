import {
  getCrmDoctypePermissions,
  hasCrmCapability,
} from "@/components/common/auth/permissions";
import type { CurrentUser } from "@/services/api/auth";

import type { SegmentListItem } from "./segment-list-types";

export function canCreateSegment(user: CurrentUser | null | undefined) {
  return getCrmDoctypePermissions(user, "CRM Segment").canCreate;
}

export function canReadSegments(user: CurrentUser | null | undefined) {
  return getCrmDoctypePermissions(user, "CRM Segment").canRead;
}

export function canManageSegment(
  user: CurrentUser | null | undefined,
  segment: Pick<SegmentListItem, "ownerUserId">,
  action: "update" | "delete",
) {
  const permissions = getCrmDoctypePermissions(user, "CRM Segment");
  const hasActionGrant = action === "update"
    ? permissions.canUpdate
    : permissions.canDelete;
  const hasRowAuthority =
    user?.crm_is_administrator === true ||
    Boolean(user?.crm_user_id && segment.ownerUserId === user.crm_user_id) ||
    hasCrmCapability(user, "team.oversee");

  return hasActionGrant && hasRowAuthority;
}
