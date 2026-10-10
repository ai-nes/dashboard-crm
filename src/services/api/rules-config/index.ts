import {
  FEATURE_NOT_MIGRATED_CODE,
  FEATURE_NOT_MIGRATED_MESSAGE,
  NestApiError,
  nestRequest,
} from "../nest/nest-client";
import {
  normalizeFactCatalog,
  normalizeRule,
  normalizeRuleGroup,
  normalizeRuleVersion,
  normalizeRuleVersionDetail,
} from "./normalizers";
import type {
  ArchiveCrmRuleVersionPayload,
  CloneCrmRuleVersionPayload,
  CreateCrmRulePayload,
  CrmRule,
  CrmRuleCondition,
  CrmRuleConditionNode,
  CrmRuleFactCatalog,
  CrmRuleGroupSummary,
  CrmRuleGroupPayload,
  UpdateCrmRuleGroupPayload,
  DeleteCrmRuleGroupPayload,
  CrmRulePayload,
  CrmRuleVersion,
  CrmRuleVersionDetail,
  CrmRuleVersionPayload,
  DeleteCrmRulePayload,
  ListCrmRulesParams,
  ListCrmRulesResponse,
  ListCrmRuleVersionsParams,
  ListCrmRuleVersionsResponse,
  SetCrmRuleEnabledPayload,
  UpdateCrmRulePayload,
  UpdateCrmRuleVersionPayload,
} from "./types";

export type * from "./types";

const METHODS = {
  LIST_VERSIONS: "crm.api.rule_engine.list_rule_versions",
  GET_VERSION: "crm.api.rule_engine.get_rule_version",
  CREATE_VERSION: "crm.api.rule_engine.create_rule_version",
  UPDATE_VERSION: "crm.api.rule_engine.update_rule_version",
  CLONE_VERSION: "crm.api.rule_engine.clone_rule_version",
  LIST_GROUPS: "crm.api.rule_engine.list_rule_groups",
  CREATE_GROUP: "crm.api.rule_engine.create_rule_group",
  UPDATE_GROUP: "crm.api.rule_engine.update_rule_group",
  DELETE_GROUP: "crm.api.rule_engine.delete_rule_group",
  LIST_RULES: "crm.api.rule_engine.list_rules",
  GET_RULE: "crm.api.rule_engine.get_rule",
  CREATE_RULE: "crm.api.rule_engine.create_rule",
  UPDATE_RULE: "crm.api.rule_engine.update_rule",
  DELETE_RULE: "crm.api.rule_engine.delete_draft_rule",
  SET_RULE_ENABLED: "crm.api.rule_engine.set_rule_enabled",
  PUBLISH_VERSION: "crm.api.rule_engine.publish_rule_version",
  ARCHIVE_VERSION: "crm.api.rule_engine.archive_rule_version",
  LIST_FACT_CATALOG: "crm.api.rule_engine.list_fact_catalog",
} as const;

export class CrmRulesApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "CrmRulesApiError";
  }
}

type RequestMethod = "DELETE" | "GET" | "POST" | "PUT";
type QueryValue = string | number | boolean | undefined;

function restQuery(
  query: Record<string, QueryValue>,
): Record<string, string | number | undefined> {
  return Object.fromEntries(
    Object.entries(query).map(([key, value]) => [
      key,
      value === undefined ? undefined : String(value),
    ]),
  );
}

function restName(value: unknown, field: string): string {
  if (typeof value !== "string" || !value) {
    throw new CrmRulesApiError(
      400,
      "INVALID_RULE_INPUT",
      `${field} is required.`,
    );
  }
  return encodeURIComponent(value);
}

async function call<T>(
  method: string,
  requestMethod: RequestMethod,
  query: Record<string, QueryValue>,
  body?: Record<string, unknown>,
): Promise<T> {
  const versionFromQuery = query.version_name ?? query.versionName;
  const versionFromBody = body?.version_name ?? body?.versionName;
  const version = versionFromQuery ?? versionFromBody;
  const ruleFromBody = body?.name;
  let path: string;
  let methodOverride: "GET" | "POST" | "PATCH" | "DELETE" =
    requestMethod === "PUT" ? "PATCH" : requestMethod;
  let requestBody = body;
  let requestQuery = restQuery(query);

  switch (method) {
    case METHODS.LIST_VERSIONS:
      path = "/api/v1/rule-engine/versions";
      break;
    case METHODS.GET_VERSION:
      path = `/api/v1/rule-engine/versions/${restName(query.name, "name")}`;
      requestQuery = {};
      break;
    case METHODS.CREATE_VERSION:
      path = "/api/v1/rule-engine/versions";
      break;
    case METHODS.UPDATE_VERSION: {
      const name = restName(body?.name, "name");
      if (body?.status === "active") {
        path = `/api/v1/rule-engine/versions/${name}/publish`;
        methodOverride = "POST";
      } else if (body?.status === "archived") {
        path = `/api/v1/rule-engine/versions/${name}/archive`;
        methodOverride = "POST";
        requestBody = {
          ...body,
          reason: body.reason ?? body.change_note ?? "Archived from dashboard.",
        };
      } else {
        path = `/api/v1/rule-engine/versions/${name}`;
      }
      break;
    }
    case METHODS.CLONE_VERSION:
      path = `/api/v1/rule-engine/versions/${restName(body?.source_name ?? body?.sourceName, "source_name")}/clone`;
      break;
    case METHODS.LIST_GROUPS:
      path = `/api/v1/rule-engine/versions/${restName(version, "version_name")}/groups`;
      requestQuery = {};
      break;
    case METHODS.CREATE_GROUP:
      path = `/api/v1/rule-engine/versions/${restName(version, "version_name")}/groups`;
      break;
    case METHODS.UPDATE_GROUP:
      path = `/api/v1/rule-engine/versions/${restName(version, "version_name")}/groups/${restName(body?.code, "code")}`;
      break;
    case METHODS.DELETE_GROUP:
      path = `/api/v1/rule-engine/versions/${restName(version, "version_name")}/groups/${restName(body?.code, "code")}`;
      break;
    case METHODS.LIST_RULES:
      path = "/api/v1/rule-engine/rules";
      break;
    case METHODS.GET_RULE:
      path = `/api/v1/rule-engine/rules/${restName(query.name, "name")}`;
      requestQuery = query.version_name
        ? { versionId: String(query.version_name) }
        : {};
      break;
    case METHODS.CREATE_RULE:
      path = "/api/v1/rule-engine/rules";
      break;
    case METHODS.UPDATE_RULE:
      path = `/api/v1/rule-engine/rules/${restName(ruleFromBody, "name")}`;
      break;
    case METHODS.DELETE_RULE:
      path = `/api/v1/rule-engine/rules/${restName(ruleFromBody, "name")}`;
      break;
    case METHODS.SET_RULE_ENABLED:
      path = `/api/v1/rule-engine/rules/${restName(ruleFromBody, "name")}/enabled`;
      break;
    case METHODS.PUBLISH_VERSION:
      path = `/api/v1/rule-engine/versions/${restName(ruleFromBody ?? version, "name")}/publish`;
      methodOverride = "POST";
      break;
    case METHODS.ARCHIVE_VERSION:
      path = `/api/v1/rule-engine/versions/${restName(ruleFromBody ?? version, "name")}/archive`;
      methodOverride = "POST";
      break;
    case METHODS.LIST_FACT_CATALOG:
      path = "/api/v1/rule-engine/fact-catalog";
      requestQuery = {};
      break;
    default:
      throw new CrmRulesApiError(
        501,
        FEATURE_NOT_MIGRATED_CODE,
        FEATURE_NOT_MIGRATED_MESSAGE,
      );
  }

  try {
    return await nestRequest<T>(path, {
      method: methodOverride,
      query: requestQuery,
      ...(requestBody ? { body: requestBody } : {}),
    });
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new CrmRulesApiError(error.status, error.code, error.message);
    }
    throw error;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function pageLength(value: number | undefined, fallback = 50): number {
  return Math.min(value ?? fallback, 200);
}

function serializeConditionNode(
  node: CrmRuleConditionNode,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (node.fact !== undefined) result.fact = node.fact;
  if (node.op !== undefined) result.op = node.op;
  if (node.value !== undefined) result.value = node.value;
  if (node.factRef !== undefined) result.fact_ref = node.factRef;
  if (node.all) result.all = node.all.map(serializeConditionNode);
  if (node.any) result.any = node.any.map(serializeConditionNode);
  if (node.not) result.not = serializeConditionNode(node.not);
  return result;
}

function serializeCondition(
  condition: CrmRuleCondition,
): Record<string, unknown> {
  return serializeConditionNode(condition);
}

function ruleBody(payload: CrmRulePayload): Record<string, unknown> {
  return {
    rule_id: payload.ruleId,
    rule_group: payload.ruleGroup,
    rule_name: payload.ruleName,
    description: payload.description ?? "",
    feature_scope: payload.featureScope,
    rule_type: payload.ruleType,
    gate_outcome: payload.gateOutcome,
    priority: payload.priority,
    action: payload.action,
    target_actions: payload.targetActions,
    condition: serializeCondition(payload.condition),
    business_reason_template:
      payload.businessReasonTemplate ?? "{action} is governed by {rule_name}.",
    sales_next_step_template:
      payload.salesNextStepTemplate ?? "Chưa có bước tiếp theo được xác định.",
  };
}

export async function listCrmRuleVersions(
  params: ListCrmRuleVersionsParams = {},
): Promise<ListCrmRuleVersionsResponse> {
  const raw = await call<unknown>(METHODS.LIST_VERSIONS, "GET", {
    status: params.status,
    search: params.search,
    active_only: params.activeOnly,
    start: params.start ?? 0,
    page_length: pageLength(params.pageLength),
  });
  const payload = asRecord(raw);
  return {
    versions: Array.isArray(payload?.versions)
      ? payload.versions.map(normalizeRuleVersion)
      : [],
    total: Number(payload?.total ?? 0),
    start: Number(payload?.start ?? params.start ?? 0),
    pageLength: Number(payload?.page_length ?? params.pageLength ?? 50),
  };
}

export async function getCrmRuleVersion(
  name: string,
): Promise<CrmRuleVersionDetail> {
  return normalizeRuleVersionDetail(
    await call(METHODS.GET_VERSION, "GET", { name }),
  );
}

export async function createCrmRuleVersion(
  payload: CrmRuleVersionPayload,
): Promise<CrmRuleVersion> {
  return normalizeRuleVersion(
    await call(
      METHODS.CREATE_VERSION,
      "POST",
      {},
      {
        version_id: payload.versionId,
        version_name: payload.versionName,
        description: payload.description ?? "",
      },
    ),
  );
}

export async function updateCrmRuleVersion(
  payload: UpdateCrmRuleVersionPayload,
): Promise<CrmRuleVersion> {
  return normalizeRuleVersion(
    await call(
      METHODS.UPDATE_VERSION,
      "PUT",
      {},
      {
        name: payload.name,
        expected_revision: payload.expectedRevision,
        ...(payload.versionName !== undefined
          ? { version_name: payload.versionName }
          : {}),
        ...(payload.description !== undefined
          ? { description: payload.description }
          : {}),
        ...(payload.status !== undefined ? { status: payload.status } : {}),
        ...(payload.expectedSettingsRevision !== undefined
          ? { expected_settings_revision: payload.expectedSettingsRevision }
          : {}),
        ...(payload.changeNote !== undefined
          ? { change_note: payload.changeNote }
          : {}),
      },
    ),
  );
}

export async function cloneCrmRuleVersion(
  payload: CloneCrmRuleVersionPayload,
): Promise<CrmRuleVersion> {
  return normalizeRuleVersion(
    await call(
      METHODS.CLONE_VERSION,
      "POST",
      {},
      {
        source_name: payload.sourceName,
        version_id: payload.versionId,
        version_name: payload.versionName,
        description: payload.description,
      },
    ),
  );
}

export async function listCrmRuleGroups(
  versionName: string,
): Promise<CrmRuleGroupSummary[]> {
  const payload = asRecord(
    await call(METHODS.LIST_GROUPS, "GET", {
      version_name: versionName,
    }),
  );
  return Array.isArray(payload?.groups)
    ? payload.groups.map(normalizeRuleGroup)
    : [];
}

export async function createCrmRuleGroup(
  payload: CrmRuleGroupPayload,
): Promise<CrmRuleGroupSummary> {
  const raw = asRecord(
    await call(
      METHODS.CREATE_GROUP,
      "POST",
      {},
      {
        version_name: payload.versionName,
        expected_version_revision: payload.expectedVersionRevision,
        code: payload.code,
        label: payload.label ?? payload.code,
        enabled: payload.enabled ?? true,
        description: payload.description,
        sort_order: payload.sortOrder,
      },
    ),
  );
  return normalizeRuleGroup(raw?.group ?? raw);
}

export async function updateCrmRuleGroup(
  payload: UpdateCrmRuleGroupPayload,
): Promise<CrmRuleGroupSummary> {
  const raw = asRecord(
    await call(
      METHODS.UPDATE_GROUP,
      "PUT",
      {},
      {
        version_name: payload.versionName,
        expected_version_revision: payload.expectedVersionRevision,
        code: payload.code,
        label: payload.label,
        enabled: payload.enabled,
        description: payload.description,
        sort_order: payload.sortOrder,
      },
    ),
  );
  return normalizeRuleGroup(raw?.group ?? raw);
}

export async function deleteCrmRuleGroup(
  payload: DeleteCrmRuleGroupPayload,
): Promise<{ code: string; deleted: boolean }> {
  const raw = asRecord(
    await call(
      METHODS.DELETE_GROUP,
      "DELETE",
      {},
      {
        version_name: payload.versionName,
        expected_version_revision: payload.expectedVersionRevision,
        code: payload.code,
      },
    ),
  );
  return {
    code: String(raw?.code ?? payload.code),
    deleted: Boolean(raw?.deleted),
  };
}

export async function listCrmRules(
  params: ListCrmRulesParams = {},
): Promise<ListCrmRulesResponse> {
  const raw = await call<unknown>(METHODS.LIST_RULES, "GET", {
    version_name: params.versionName,
    rule_group: params.ruleGroup,
    search: params.search,
    feature_scope: params.featureScope,
    status: params.status,
    rule_type: params.ruleType,
    gate_outcome: params.gateOutcome,
    start: params.start ?? 0,
    page_length: pageLength(params.pageLength, 200),
  });
  const payload = asRecord(raw);
  return {
    rules: Array.isArray(payload?.rules)
      ? payload.rules.map(normalizeRule)
      : [],
    total: Number(payload?.total ?? 0),
    start: Number(payload?.start ?? params.start ?? 0),
    pageLength: Number(payload?.page_length ?? params.pageLength ?? 200),
  };
}

export async function getCrmRule(name: string): Promise<CrmRule> {
  return normalizeRule(await call(METHODS.GET_RULE, "GET", { name }));
}

export async function createCrmRule(
  payload: CreateCrmRulePayload,
): Promise<CrmRule> {
  return normalizeRule(
    await call(
      METHODS.CREATE_RULE,
      "POST",
      {},
      {
        version_name: payload.versionName,
        expected_version_revision: payload.expectedVersionRevision,
        ...ruleBody(payload),
      },
    ),
  );
}

export async function updateCrmRule(
  payload: UpdateCrmRulePayload,
): Promise<CrmRule> {
  return normalizeRule(
    await call(
      METHODS.UPDATE_RULE,
      "PUT",
      {},
      {
        name: payload.name,
        expected_version_revision: payload.expectedVersionRevision,
        ...ruleBody(payload),
      },
    ),
  );
}

export async function deleteCrmRule(
  payload: DeleteCrmRulePayload,
): Promise<{ name: string; deleted: boolean; versionId: string }> {
  const raw = asRecord(
    await call(
      METHODS.DELETE_RULE,
      "DELETE",
      {},
      {
        name: payload.name,
        expected_version_revision: payload.expectedVersionRevision,
      },
    ),
  );
  return {
    name: String(raw?.name ?? payload.name),
    deleted: Boolean(raw?.deleted),
    versionId: String(raw?.version_id ?? raw?.versionId ?? ""),
  };
}

export async function updateCrmRuleVersionStatus(
  payload: UpdateCrmRuleVersionPayload,
): Promise<CrmRuleVersion> {
  return normalizeRuleVersion(
    await call(
      METHODS.UPDATE_VERSION,
      "PUT",
      {},
      {
        name: payload.name,
        expected_revision: payload.expectedRevision,
        status: payload.status,
        expected_settings_revision: payload.expectedSettingsRevision,
        change_note: payload.changeNote,
      },
    ),
  );
}

export async function setCrmRuleEnabled(
  payload: SetCrmRuleEnabledPayload,
): Promise<CrmRule> {
  return normalizeRule(
    await call(
      METHODS.SET_RULE_ENABLED,
      "PUT",
      {},
      {
        name: payload.name,
        expected_version_revision: payload.expectedVersionRevision,
        enabled: payload.enabled,
      },
    ),
  );
}

export async function archiveCrmRuleVersion(
  payload: ArchiveCrmRuleVersionPayload,
): Promise<CrmRuleVersion> {
  return normalizeRuleVersion(
    await call(
      METHODS.ARCHIVE_VERSION,
      "POST",
      {},
      {
        name: payload.name,
        expected_revision: payload.expectedRevision,
        reason: payload.reason,
      },
    ),
  );
}

export async function listCrmFactCatalog(): Promise<CrmRuleFactCatalog> {
  return normalizeFactCatalog(await call(METHODS.LIST_FACT_CATALOG, "GET", {}));
}
