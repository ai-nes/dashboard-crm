export type CrmRuleStatus = "draft" | "testing" | "active" | "archived";
export type CrmRuleFeatureScope =
  | "all"
  | "conversation_analysis"
  | "student_360"
  | "school_360"
  | "nba"
  | "copilot";
export type CrmRuleType =
  | "GUARDRAIL"
  | "ELIGIBILITY"
  | "PREREQUISITE"
  | "MODIFIER"
  | "RESOLUTION";
export type CrmRuleGateOutcome =
  | "PASS"
  | "WAIT"
  | "STOP"
  | "DIRECT"
  | "ESCALATE";
export type CrmRuleOperator =
  | "eq"
  | "neq"
  | "in"
  | "not_in"
  | "exists"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "before"
  | "after"
  | "is_true"
  | "is_false";
export type CrmFactType = "string" | "number" | "boolean" | "datetime";
export type CrmRuleScalar = string | number | boolean;

export interface CrmRuleConditionLeaf {
  fact: string;
  op: CrmRuleOperator;
  value?: CrmRuleScalar | CrmRuleScalar[] | null;
  factRef?: string;
}

export interface CrmRuleCondition {
  all?: CrmRuleConditionNode[];
  any?: CrmRuleConditionNode[];
  not?: CrmRuleConditionNode;
  fact?: string;
  op?: CrmRuleOperator;
  value?: CrmRuleScalar | CrmRuleScalar[] | null;
  factRef?: string;
}

export type CrmRuleConditionNode = CrmRuleCondition;

export interface CrmFactMetadata {
  fact: string;
  type: CrmFactType;
}

export interface CrmRule {
  name: string;
  versionId: string;
  ruleVersion: string;
  ruleId: string;
  ruleGroup: string;
  ruleName: string;
  description: string | null;
  featureScope: CrmRuleFeatureScope;
  ruleType: CrmRuleType;
  gateOutcome: CrmRuleGateOutcome;
  priority: number;
  action: string;
  targetActions: string[];
  condition: CrmRuleCondition;
  businessReasonTemplate: string;
  salesNextStepTemplate: string;
  status: CrmRuleStatus;
  enabled: boolean;
  revision: number;
  schemaVersion: string;
  modified: string | null;
}

export interface CrmRuleVersion {
  name: string;
  creator: string | null;
  versionId: string;
  versionName: string;
  description: string | null;
  status: CrmRuleStatus;
  isActive: boolean;
  revision: number;
  schemaVersion: string;
  rulesetRevision: string | null;
  rulesetDigest: string | null;
  activatedAt: string | null;
  activatedBy: string | null;
  archivedAt: string | null;
  archivedBy: string | null;
  changeNote: string | null;
  settingsRevision: number;
  rulesCount: number;
  creation: string | null;
  modified: string | null;
}

export interface CrmRuleGroupSummary {
  groupId: string;
  label: string;
  count: number;
  enabled?: boolean;
  description?: string | null;
  sortOrder?: number;
}

export interface CrmRuleGroupPayload {
  versionName: string;
  expectedVersionRevision: number;
  code: string;
  label?: string;
  enabled?: boolean;
  description?: string;
  sortOrder?: number;
}

export interface UpdateCrmRuleGroupPayload extends CrmRuleGroupPayload {}

export interface DeleteCrmRuleGroupPayload {
  versionName: string;
  expectedVersionRevision: number;
  code: string;
}

export interface CrmRuleVersionDetail extends CrmRuleVersion {
  groups: CrmRuleGroupSummary[];
}

export interface ListCrmRuleVersionsParams {
  status?: CrmRuleStatus;
  search?: string;
  activeOnly?: boolean;
  start?: number;
  pageLength?: number;
}

export interface ListCrmRuleVersionsResponse {
  versions: CrmRuleVersion[];
  total: number;
  start: number;
  pageLength: number;
}

export interface CrmRuleVersionPayload {
  versionId: string;
  versionName: string;
  description?: string;
}

export interface UpdateCrmRuleVersionPayload {
  name: string;
  expectedRevision: number;
  versionName?: string;
  description?: string;
  status?: CrmRuleStatus;
  expectedSettingsRevision?: number;
  changeNote?: string;
}

export interface CloneCrmRuleVersionPayload {
  sourceName: string;
  versionId: string;
  versionName?: string;
  description?: string;
}

export interface ListCrmRulesParams {
  featureScope?: CrmRuleFeatureScope;
  status?: CrmRuleStatus;
  versionName?: string;
  ruleGroup?: string;
  ruleType?: CrmRuleType;
  gateOutcome?: CrmRuleGateOutcome;
  search?: string;
  start?: number;
  pageLength?: number;
}

export interface ListCrmRulesResponse {
  rules: CrmRule[];
  total: number;
  start: number;
  pageLength: number;
}

export interface CrmRulePayload {
  ruleId: string;
  ruleGroup: string;
  ruleName: string;
  description?: string;
  featureScope: CrmRuleFeatureScope;
  ruleType: CrmRuleType;
  gateOutcome: CrmRuleGateOutcome;
  priority: number;
  action: string;
  targetActions: string[];
  condition: CrmRuleCondition;
  businessReasonTemplate?: string;
  salesNextStepTemplate?: string;
}

export interface CreateCrmRulePayload extends CrmRulePayload {
  versionName: string;
  expectedVersionRevision: number;
}

export interface UpdateCrmRulePayload extends CrmRulePayload {
  name: string;
  expectedVersionRevision: number;
}

export interface DeleteCrmRulePayload {
  name: string;
  expectedVersionRevision: number;
}

export interface SetCrmRuleEnabledPayload {
  name: string;
  expectedVersionRevision: number;
  enabled: boolean;
}

export interface ArchiveCrmRuleVersionPayload {
  name: string;
  expectedRevision: number;
  reason: string;
}

export interface CrmRuleFactCatalog {
  schemaVersion: string;
  facts: CrmFactMetadata[];
}

export interface RequestOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}
