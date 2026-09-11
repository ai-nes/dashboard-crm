import {
  normalizeFactCatalog,
  normalizeRule,
  normalizeRuleGroup,
  normalizeRuleVersion,
  normalizeRuleVersionDetail,
  unwrapMethodPayload,
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
  CrmRulePayload,
  CrmRuleVersion,
  CrmRuleVersionDetail,
  CrmRuleVersionPayload,
  DeleteCrmRulePayload,
  ListCrmRulesParams,
  ListCrmRulesResponse,
  ListCrmRuleVersionsParams,
  ListCrmRuleVersionsResponse,
  RequestOptions,
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
  LIST_RULES: "crm.api.rule_engine.list_rules",
  GET_RULE: "crm.api.rule_engine.get_rule",
  CREATE_RULE: "crm.api.rule_engine.create_rule",
  UPDATE_RULE: "crm.api.rule_engine.update_rule",
  DELETE_RULE: "crm.api.rule_engine.delete_draft_rule",
  PUBLISH_VERSION: "crm.api.rule_engine.publish_rule_version",
  ARCHIVE_VERSION: "crm.api.rule_engine.archive_rule_version",
  LIST_FACT_CATALOG: "crm.api.rule_engine.list_fact_catalog",
} as const;

export class CrmRulesApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
    this.name = "CrmRulesApiError";
  }
}

type RequestMethod = "DELETE" | "GET" | "POST" | "PUT";
type QueryValue = string | number | boolean | undefined;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function resolveBaseUrl(options: RequestOptions): string {
  const baseUrl = (options.baseUrl ?? process.env.NEXT_PUBLIC_FRAPPE_URL ?? "").replace(/\/+$/, "");
  if (!baseUrl) throw new CrmRulesApiError(0, "FRAPPE_URL_MISSING", "Chưa cấu hình địa chỉ Frappe CRM API.");
  return baseUrl;
}

function cookieHeader(value: string): string {
  return value
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.startsWith("sid="))
    .join("; ");
}

async function headers(options: RequestOptions, write: boolean): Promise<Record<string, string>> {
  const result: Record<string, string> = {
    Accept: "application/json",
    ...(write ? { "Content-Type": "application/json" } : {}),
    ...(options.headers ?? {}),
  };
  if (!options.baseUrl && typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const sid = cookieHeader((await cookies()).toString());
      if (sid) result.Cookie = sid;
    } catch {
      // Tests and non-request contexts do not have a Next request store.
    }
  }
  if (typeof window !== "undefined" && write) {
    const csrf = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("csrf_token="));
    if (csrf) result["X-Frappe-CSRF-Token"] = decodeURIComponent(csrf.split("=").slice(1).join("="));
  }
  return result;
}

function errorDetails(payload: unknown): { code?: string; message?: string } {
  const root = asRecord(payload);
  const message = asRecord(root?.message);
  const error = asRecord(root?.error) ?? asRecord(message?.error);
  const exception = typeof root?.exception === "string" ? root.exception : "";
  const serverMessage = typeof root?._server_messages === "string" ? root._server_messages : "";
  const stale = [exception, serverMessage].some((value) => value.includes("STALE_RULE_VERSION"));
  const code = stale ? "STALE_RULE_VERSION" : typeof error?.code === "string" ? error.code : typeof root?.exc_type === "string" ? root.exc_type : undefined;
  const extractedMessage = typeof error?.message === "string"
    ? error.message
    : typeof message?.message === "string"
      ? message.message
      : exception || (typeof root?.message === "string" ? root.message : undefined);
  return {
    code,
    message: extractedMessage,
  };
}

async function call<T>(
  method: string,
  requestMethod: RequestMethod,
  options: RequestOptions,
  query: Record<string, QueryValue> = {},
  body?: Record<string, unknown>,
): Promise<T> {
  const url = new URL(`${resolveBaseUrl(options)}/api/method/${method}`);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  });
  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: requestMethod,
      headers: await headers(options, requestMethod !== "GET"),
      ...(typeof window !== "undefined" ? { credentials: "include" as RequestCredentials } : {}),
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
    });
  } catch {
    throw new CrmRulesApiError(503, "CRM_RULES_API_UNAVAILABLE", "Không thể kết nối đến máy chủ Rule Engine.");
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = errorDetails(payload);
    const code = details.code ?? `HTTP_${response.status}`;
    throw new CrmRulesApiError(response.status, code, details.message ?? "Thao tác Rule thất bại.");
  }
  return unwrapMethodPayload(payload) as T;
}

function pageLength(value: number | undefined, fallback = 50): number {
  return Math.min(value ?? fallback, 200);
}

function serializeConditionNode(node: CrmRuleConditionNode): Record<string, unknown> {
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

function serializeCondition(condition: CrmRuleCondition): Record<string, unknown> {
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
  };
}

export async function listCrmRuleVersions(
  params: ListCrmRuleVersionsParams = {},
  options: RequestOptions = {},
): Promise<ListCrmRuleVersionsResponse> {
  const raw = await call<unknown>(METHODS.LIST_VERSIONS, "GET", options, {
    status: params.status,
    active_only: params.activeOnly,
    start: params.start ?? 0,
    page_length: pageLength(params.pageLength),
  });
  const payload = asRecord(raw);
  return {
    versions: Array.isArray(payload?.versions) ? payload.versions.map(normalizeRuleVersion) : [],
    total: Number(payload?.total ?? 0),
    start: Number(payload?.start ?? params.start ?? 0),
    pageLength: Number(payload?.page_length ?? params.pageLength ?? 50),
  };
}

export async function getCrmRuleVersion(name: string, options: RequestOptions = {}): Promise<CrmRuleVersionDetail> {
  return normalizeRuleVersionDetail(await call(METHODS.GET_VERSION, "GET", options, { name }));
}

export async function createCrmRuleVersion(
  payload: CrmRuleVersionPayload,
  options: RequestOptions = {},
): Promise<CrmRuleVersion> {
  return normalizeRuleVersion(await call(METHODS.CREATE_VERSION, "POST", options, {}, {
    version_id: payload.versionId,
    version_name: payload.versionName,
    description: payload.description ?? "",
  }));
}

export async function updateCrmRuleVersion(
  payload: UpdateCrmRuleVersionPayload,
  options: RequestOptions = {},
): Promise<CrmRuleVersion> {
  return normalizeRuleVersion(await call(METHODS.UPDATE_VERSION, "PUT", options, {}, {
    name: payload.name,
    expected_revision: payload.expectedRevision,
    ...(payload.versionName !== undefined ? { version_name: payload.versionName } : {}),
    ...(payload.description !== undefined ? { description: payload.description } : {}),
  }));
}

export async function cloneCrmRuleVersion(
  payload: CloneCrmRuleVersionPayload,
  options: RequestOptions = {},
): Promise<CrmRuleVersion> {
  return normalizeRuleVersion(await call(METHODS.CLONE_VERSION, "POST", options, {}, {
    source_name: payload.sourceName,
    version_id: payload.versionId,
    version_name: payload.versionName,
    description: payload.description,
  }));
}

export async function listCrmRuleGroups(versionName: string, options: RequestOptions = {}): Promise<CrmRuleGroupSummary[]> {
  const payload = asRecord(await call(METHODS.LIST_GROUPS, "GET", options, { version_name: versionName }));
  return Array.isArray(payload?.groups) ? payload.groups.map(normalizeRuleGroup) : [];
}

export async function listCrmRules(params: ListCrmRulesParams = {}, options: RequestOptions = {}): Promise<ListCrmRulesResponse> {
  const raw = await call<unknown>(METHODS.LIST_RULES, "GET", options, {
    version_name: params.versionName,
    rule_group: params.ruleGroup,
    search: params.search,
    feature_scope: params.featureScope,
    status: params.status,
    start: params.start ?? 0,
    page_length: pageLength(params.pageLength, 200),
  });
  const payload = asRecord(raw);
  return {
    rules: Array.isArray(payload?.rules) ? payload.rules.map(normalizeRule) : [],
    total: Number(payload?.total ?? 0),
    start: Number(payload?.start ?? params.start ?? 0),
    pageLength: Number(payload?.page_length ?? params.pageLength ?? 200),
  };
}

export async function getCrmRule(name: string, options: RequestOptions = {}): Promise<CrmRule> {
  return normalizeRule(await call(METHODS.GET_RULE, "GET", options, { name }));
}

export async function createCrmRule(payload: CreateCrmRulePayload, options: RequestOptions = {}): Promise<CrmRule> {
  return normalizeRule(await call(METHODS.CREATE_RULE, "POST", options, {}, {
    version_name: payload.versionName,
    expected_version_revision: payload.expectedVersionRevision,
    ...ruleBody(payload),
  }));
}

export async function updateCrmRule(payload: UpdateCrmRulePayload, options: RequestOptions = {}): Promise<CrmRule> {
  return normalizeRule(await call(METHODS.UPDATE_RULE, "PUT", options, {}, {
    name: payload.name,
    expected_version_revision: payload.expectedVersionRevision,
    ...ruleBody(payload),
  }));
}

export async function deleteCrmRule(payload: DeleteCrmRulePayload, options: RequestOptions = {}): Promise<{ name: string; deleted: boolean; versionId: string }> {
  const raw = asRecord(await call(METHODS.DELETE_RULE, "DELETE", options, {}, {
    name: payload.name,
    expected_version_revision: payload.expectedVersionRevision,
  }));
  return {
    name: String(raw?.name ?? payload.name),
    deleted: Boolean(raw?.deleted),
    versionId: String(raw?.version_id ?? raw?.versionId ?? ""),
  };
}

export async function publishCrmRuleVersion(name: string, expectedRevision: number, options: RequestOptions = {}): Promise<CrmRuleVersion> {
  return normalizeRuleVersion(await call(METHODS.PUBLISH_VERSION, "POST", options, {}, { name, expected_revision: expectedRevision }));
}

export async function archiveCrmRuleVersion(payload: ArchiveCrmRuleVersionPayload, options: RequestOptions = {}): Promise<CrmRuleVersion> {
  return normalizeRuleVersion(await call(METHODS.ARCHIVE_VERSION, "POST", options, {}, {
    name: payload.name,
    expected_revision: payload.expectedRevision,
    reason: payload.reason,
  }));
}

export async function listCrmFactCatalog(options: RequestOptions = {}): Promise<CrmRuleFactCatalog> {
  return normalizeFactCatalog(await call(METHODS.LIST_FACT_CATALOG, "GET", options));
}
