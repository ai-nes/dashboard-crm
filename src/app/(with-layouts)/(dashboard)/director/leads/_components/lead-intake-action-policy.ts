interface LeadAssignmentButtonVisibility {
  pathname: string;
  canManageLeadIntake: boolean;
  hasMeta: boolean;
  hasPendingNew: boolean;
}

export function shouldShowLeadAssignmentButton({
  pathname,
  canManageLeadIntake,
  hasMeta,
  hasPendingNew,
}: LeadAssignmentButtonVisibility): boolean {
  return (
    canManageLeadIntake &&
    hasMeta &&
    pathname === "/lead-sale/leads" &&
    !hasPendingNew
  );
}
