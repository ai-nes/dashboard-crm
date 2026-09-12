import type { CrmRuleStatus } from "@/services/api/rules-config";

const EDITABLE_STATUSES: CrmRuleStatus[] = ["draft", "testing", "archived", "active"];

export function getRuleVersionStatusOptions(status: CrmRuleStatus): CrmRuleStatus[] {
  return status === "active" ? ["active"] : [...EDITABLE_STATUSES];
}
