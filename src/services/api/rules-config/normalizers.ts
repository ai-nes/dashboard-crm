import type {
  CrmFactMetadata,
  CrmRule,
  CrmRuleCondition,
  CrmRuleGroupSummary,
  CrmRuleVersion,
  CrmRuleVersionDetail,
} from "./types";

type RecordValue = Record<string, unknown>;

function asRecord(value: unknown): RecordValue | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as RecordValue)
    : null;
}

function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function numberValue(value: unknown, fallback = 0): number {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function booleanValue(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") return value === "1" || value === "true";
  return fallback;
}

function enumValue<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
  return typeof value === "string" && options.includes(value as T) ? (value as T) : fallback;
}

function jsonValue(value: unknown, fallback: unknown): unknown {
  if (typeof value !== "string") return value ?? fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

const STATUSES = ["draft", "published", "archived"] as const;
const SCOPES = ["all", "intent", "student_360", "scoring", "nba", "copilot"] as const;
const TYPES = ["GUARDRAIL", "ELIGIBILITY", "PREREQUISITE", "MODIFIER", "RESOLUTION"] as const;
const OUTCOMES = ["PASS", "WAIT", "STOP"] as const;

export function unwrapMethodPayload(value: unknown): unknown {
  const root = asRecord(value);
  return root?.message ?? value;
}

export function normalizeCondition(value: unknown): CrmRuleCondition {
  const object = asRecord(jsonValue(value, {}));
  if (!object) return {};

  const condition: CrmRuleCondition = {};
  if (typeof object.fact === "string") condition.fact = object.fact;
  if (typeof object.fact_ref === "string" || typeof object.factRef === "string") {
    condition.factRef = stringValue(object.fact_ref ?? object.factRef);
  }
  if (typeof object.op === "string") condition.op = object.op as CrmRuleCondition["op"];
  if (object.value !== undefined) condition.value = object.value as CrmRuleCondition["value"];

  for (const key of ["all", "any"] as const) {
    if (Array.isArray(object[key])) {
      condition[key] = object[key].map(normalizeCondition);
    }
  }
  if (object.not !== undefined) condition.not = normalizeCondition(object.not);
  return condition;
}

export function normalizeRule(value: unknown): CrmRule {
  const object = asRecord(value);
  if (!object) throw new Error("CRM rule must be an object");
  const ruleId = stringValue(object.rule_id ?? object.ruleId ?? object.name);
  if (!ruleId) throw new Error("CRM rule id is missing");

  const targetActions = jsonValue(object.target_actions ?? object.targetActions, []);
  return {
    name: stringValue(object.name, ruleId),
    versionId: stringValue(object.version_id ?? object.versionId ?? object.rule_version),
    ruleVersion: stringValue(object.rule_version ?? object.versionId ?? object.version_id),
    ruleId,
    ruleGroup: stringValue(object.rule_group ?? object.ruleGroup),
    ruleName: stringValue(object.rule_name ?? object.ruleName, ruleId),
    description: nullableString(object.description),
    featureScope: enumValue(object.feature_scope ?? object.featureScope, SCOPES, "all"),
    ruleType: enumValue(object.rule_type ?? object.ruleType, TYPES, "GUARDRAIL"),
    gateOutcome: enumValue(object.gate_outcome ?? object.gateOutcome, OUTCOMES, "PASS"),
    priority: numberValue(object.priority),
    action: stringValue(object.action),
    targetActions: Array.isArray(targetActions)
      ? targetActions.filter((item): item is string => typeof item === "string")
      : [],
    condition: normalizeCondition(object.condition),
    status: enumValue(object.status, STATUSES, "draft"),
    enabled: booleanValue(object.enabled),
    revision: numberValue(object.revision),
    schemaVersion: stringValue(object.schema_version ?? object.schemaVersion, "crm-rule-v1"),
    publishedAt: nullableString(object.published_at ?? object.publishedAt),
    publishedBy: nullableString(object.published_by ?? object.publishedBy),
    archiveReason: nullableString(object.archive_reason ?? object.archiveReason),
    modified: nullableString(object.modified),
  };
}

export function normalizeRuleVersion(value: unknown): CrmRuleVersion {
  const object = asRecord(value);
  if (!object) throw new Error("CRM Rule Version must be an object");
  const versionId = stringValue(object.version_id ?? object.versionId ?? object.name);
  if (!versionId) throw new Error("CRM Rule Version id is missing");
  return {
    name: stringValue(object.name, versionId),
    creator: nullableString(object.owner ?? object.creator),
    versionId,
    versionName: stringValue(object.version_name ?? object.versionName, versionId),
    description: nullableString(object.description),
    status: enumValue(object.status, STATUSES, "draft"),
    isActive: booleanValue(object.is_active ?? object.isActive),
    revision: numberValue(object.revision),
    schemaVersion: stringValue(object.schema_version ?? object.schemaVersion, "crm-rule-v1"),
    rulesetRevision: nullableString(object.ruleset_revision ?? object.rulesetRevision),
    rulesetDigest: nullableString(object.ruleset_digest ?? object.rulesetDigest),
    publishedAt: nullableString(object.published_at ?? object.publishedAt),
    publishedBy: nullableString(object.published_by ?? object.publishedBy),
    archiveReason: nullableString(object.archive_reason ?? object.archiveReason),
    rulesCount: numberValue(object.rules_count ?? object.rulesCount),
    creation: nullableString(object.creation),
    modified: nullableString(object.modified),
  };
}

export function normalizeRuleGroup(value: unknown): CrmRuleGroupSummary {
  const object = asRecord(value);
  if (!object) throw new Error("CRM Rule Group must be an object");
  const groupId = stringValue(object.group_id ?? object.groupId);
  return {
    groupId,
    label: stringValue(object.label, groupId),
    count: numberValue(object.count),
  };
}

export function normalizeRuleVersionDetail(value: unknown): CrmRuleVersionDetail {
  const payload = asRecord(unwrapMethodPayload(value));
  const version = normalizeRuleVersion(payload);
  return {
    ...version,
    groups: Array.isArray(payload?.groups) ? payload.groups.map(normalizeRuleGroup) : [],
  };
}

export function normalizeFactCatalog(value: unknown): { schemaVersion: string; facts: CrmFactMetadata[] } {
  const payload = asRecord(unwrapMethodPayload(value));
  const facts = Array.isArray(payload?.facts) ? payload.facts : [];
  return {
    schemaVersion: stringValue(payload?.schema_version ?? payload?.schemaVersion, "crm-rule-v1"),
    facts: facts.flatMap((item) => {
      const object = asRecord(item);
      if (!object || typeof object.fact !== "string") return [];
      return [{
        fact: object.fact,
        type: enumValue(object.type, ["string", "number", "boolean", "datetime"] as const, "string"),
      }];
    }),
  };
}
