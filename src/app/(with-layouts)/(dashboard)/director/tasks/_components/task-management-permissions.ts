import { hasCrmCapability } from "@/components/common/auth/permissions";
import type { CurrentUser } from "@/services/api/auth";
import type { TaskManagementItem } from "@/services/api/tasks/types";

function normalizeIdentifier(value: string | undefined): string {
  return value?.trim().toLocaleLowerCase() ?? "";
}

/** Applies the CRM task ownership policy after the DocType grant is checked. */
export function canManageTaskRecord(
  user: CurrentUser | null | undefined,
  task: Pick<TaskManagementItem, "ownerId" | "assigneeId">,
): boolean {
  if (hasCrmCapability(user, "team.oversee")) return true;
  if (!user) return false;

  const userIdentifiers = new Set(
    [user.crm_user_id, user.user, user.email]
      .map(normalizeIdentifier)
      .filter(Boolean),
  );

  return [task.ownerId, task.assigneeId]
    .map(normalizeIdentifier)
    .some((identifier) => identifier.length > 0 && userIdentifiers.has(identifier));
}
