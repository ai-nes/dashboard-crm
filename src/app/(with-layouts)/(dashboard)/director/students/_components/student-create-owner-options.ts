export interface StudentCreateOwnerOption {
  id: string;
  label: string;
}

export type StudentOwnerReadScope = "assigned" | "team" | "all" | string;

export function studentCreateCurrentUserId(
  user: { crm_user_id?: string; user?: string } | null | undefined,
): string | undefined {
  return user?.crm_user_id ?? user?.user;
}

export function studentCreateOwnerOptions(
  options: StudentCreateOwnerOption[],
  currentUserId: string | undefined,
  readScope: StudentOwnerReadScope | undefined,
  assignmentScope: StudentOwnerReadScope | undefined = readScope,
): StudentCreateOwnerOption[] {
  if (assignmentScope !== "assigned" || !currentUserId) return options;
  return options.filter((option) => option.id === currentUserId);
}

export function studentCreateDefaultOwner(
  currentUserId: string | undefined,
  readScope: StudentOwnerReadScope | undefined,
  assignmentScope: StudentOwnerReadScope | undefined = readScope,
): string {
  return assignmentScope === "assigned" ? (currentUserId ?? "") : "";
}

export function studentCreateOwnerValue(
  selectedOwner: string,
  isOpen: boolean,
  defaultOwner: string,
): string {
  return selectedOwner || (isOpen ? defaultOwner : "");
}
