import type { CrmRuleStatus } from "@/services/api/rules-config";

export function canEditRulesInVersion(status?: CrmRuleStatus): boolean {
  return status === "draft" || status === "active";
}

export function canEditRuleInVersion(
  versionStatus: CrmRuleStatus | undefined,
  ruleStatus: CrmRuleStatus | undefined,
  isCreate: boolean,
): boolean {
  return canEditRulesInVersion(versionStatus) && (isCreate || ruleStatus === versionStatus);
}
