import type {
  PermissionProfile,
  PermissionFlag,
  PermissionProfileViewMode,
  UpdatePermissionProfilePayload,
} from "@/services/api/user-management";

export function permissionProfileUpdate(
  previous: PermissionProfile,
  next: PermissionProfile,
  viewMode: PermissionProfileViewMode,
): UpdatePermissionProfilePayload {
  const flags: PermissionFlag[] = [
    "read",
    "write",
    "create",
    "delete",
    "export",
  ];
  const previousRows = new Map(
    previous.applicableDoctypes.map((row) => [row.documentType, row]),
  );
  return {
    role: previous.role,
    rowScope: next.rowScope,
    deleteRequiresOwnership: next.deleteRequiresOwnership,
    applicableDoctypes: next.applicableDoctypes.filter((row) => {
      const before = previousRows.get(row.documentType);
      return !before || flags.some((flag) => row[flag] !== before[flag]);
    }),
    replaceApplicableDoctypes: false,
    viewMode,
  };
}
