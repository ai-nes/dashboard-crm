import type { SessionUser } from "@/services/api/auth";

const UNASSIGNED_OWNER_LABELS = new Set([
  "-",
  "—",
  "chưa phân công",
  "chưa có người phụ trách",
  "chưa giao",
  "unassigned",
]);

export function normalizeStudentOwner(
  owner: string | null | undefined,
): string | undefined {
  const normalizedOwner = owner?.trim();
  if (!normalizedOwner) return undefined;

  return UNASSIGNED_OWNER_LABELS.has(normalizedOwner.toLocaleLowerCase("vi-VN"))
    ? undefined
    : normalizedOwner;
}

function matchesIdentifier(identifier: string, candidate: string): boolean {
  return (
    identifier.trim().toLocaleLowerCase("vi-VN") ===
    candidate.trim().toLocaleLowerCase("vi-VN")
  );
}

export function resolveStudentTaskAssignee(
  owner: string | null | undefined,
  assignees: SessionUser[],
  ownerId?: string | null,
): SessionUser | null {
  if (ownerId === null) return null;
  const normalizedOwnerId = ownerId?.trim();
  if (normalizedOwnerId) {
    return (
      assignees.find((candidate) =>
        [candidate.name, candidate.email].some((identifier) =>
          matchesIdentifier(identifier, normalizedOwnerId),
        ),
      ) ?? null
    );
  }
  const normalizedOwner = normalizeStudentOwner(owner);
  if (!normalizedOwner) return null;

  const matches = assignees.filter((candidate) =>
    [candidate.name, candidate.email, candidate.full_name].some((identifier) =>
      matchesIdentifier(identifier, normalizedOwner),
    ),
  );
  return matches.length === 1 ? matches[0] : null;
}

export function getTaskAssignmentMessage(
  owner: string | null | undefined,
  assignee: SessionUser | null,
  options: { isLoading?: boolean; hasError?: boolean } = {},
): string | null {
  if (!assignee && !normalizeStudentOwner(owner)) {
    return "Student chưa được giao cho Sale/CTV nên chưa thể tạo task.";
  }
  if (options.isLoading) {
    return "Đang xác định Sale/CTV phụ trách student...";
  }
  if (options.hasError || !assignee) {
    return "Không xác định được tài khoản Sale/CTV phụ trách. Vui lòng tải lại trước khi tạo task.";
  }
  return null;
}
