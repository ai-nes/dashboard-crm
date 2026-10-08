import { NestApiError } from "./nest/nest-client";
import { NOT_HANDLED } from "./nest/nest-handler";
import { nestAdminCatalogRequest } from "./nest/nest-admin-catalog-router";

export class AdminCatalogApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "AdminCatalogApiError";
  }
}
export interface AdmissionYear {
  name: string;
  year_name: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  modified?: string;
}

export interface AcademicYearLine {
  name?: string;
  line_kind: "tuition" | "scholarship" | "quota";
  major: string;
  campus: string;
  amount?: number;
  note?: string;
  scholarship_name?: string;
  criteria?: string;
  quota?: number;
}

export interface AcademicYearConfig {
  name: string;
  admission_year: string;
  config_name?: string;
  notes?: string;
  lines: AcademicYearLine[];
  modified?: string;
}

export interface AdmissionOffering {
  name: string;
  offering_key?: string;
  admission_year: string;
  campus: string;
  major: string;
  admission_method: string;
  quota: number;
  effective_from: string;
  effective_until: string;
  status: "Draft" | "Pending Approval" | "Active" | "Closed" | "Retired";
  policy_version?: string;
  approved_by?: string;
  approved_at?: string;
  modified?: string;
}

export interface ScoreRule {
  rule_kind?: ScoreRuleKind;
  signal?: string;
  base_points?: number;
  max_points?: number;
  is_active?: boolean;
  penalty_amount?: number;
  cooldown_days?: number;
  max_penalties?: number;
  max_days?: number;
  multiplier?: number;
  tier_label?: string;
}

export type ScoreRuleKind = "positive" | "negative" | "time_decay";

export interface ScoreSignal {
  name: string;
  signal_key: string;
  label: string;
  category: string;
  signal_type: string;
  is_active: boolean;
  description?: string;
}

export interface ScoreTemplate {
  name: string;
  template_name: string;
  status: "Draft" | "Active" | "Inactive";
  start_time?: string;
  end_time?: string;
  policy_revision?: number;
  policy_hash?: string;
  fit_weight?: number;
  engagement_weight?: number;
  intent_weight?: number;
  rules?: ScoreRule[];
  modified?: string;
}

export interface CampaignChannelType {
  code: string;
  display_name: string;
  is_online: boolean;
  is_offline: boolean;
  enabled: boolean;
  sort_order: number;
  description?: string;
  modes?: string[];
}

export type GovernedDoctype = "CRM Campus" | "CRM Lead Source" | "CRM Platform";

export interface GovernedRecord {
  name: string;
  approval_state?: string;
  owner_role?: string;
  version?: number;
  effective_date?: string;
  campus_name?: string;
  campus_code?: string;
  city?: string;
  province?: string;
  address?: string;
  phone?: string;
  source_name?: string;
  is_digital?: boolean;
  channel_family?: string;
  details?: string;
  platform_name?: string;
  lead_source?: string;
  sub_channel?: string;
  channel_url?: string;
}

export interface PendingGovernedChange {
  name: string;
  reference_docname: string;
  status: string;
  action: string;
  new_value?: string;
  reason?: string;
  required_approver_roles?: string;
  approved_by_roles?: string;
  proposed_by?: string;
  target_version?: number;
}

type ListParams = {
  search?: string;
  status?: string;
  start?: number;
  pageLength?: number;
};

type ScoreSignalListParams = Pick<
  ListParams,
  "search" | "start" | "pageLength"
> & {
  activeOnly?: boolean;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

function bool(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true";
}

function number(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function normalize<T>(value: unknown): T {
  return value as T;
}

/** Runs one admin catalog operation through the Nest adapter. */
async function run<T>(
  method: string,
  params: Record<string, string | undefined>,
  body?: Record<string, unknown>,
): Promise<T> {
  try {
    const result = await nestAdminCatalogRequest(method, params, body);
    if (result === NOT_HANDLED) {
      throw new AdminCatalogApiError(
        501,
        "FEATURE_NOT_MIGRATED",
        "Chức năng này chưa có trên máy chủ CRM.",
      );
    }
    return normalize<T>(result);
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new AdminCatalogApiError(error.status, error.code, error.message);
    }
    throw error;
  }
}

function call<T>(method: string, query?: URLSearchParams) {
  return run<T>(method, Object.fromEntries(query ?? []));
}

function post<T>(method: string, data: Record<string, unknown>) {
  return run<T>(method, {}, data);
}
function listParams(params: ListParams): URLSearchParams {
  const result = new URLSearchParams();
  if (params.search?.trim()) result.set("search", params.search.trim());
  if (params.status) result.set("status", params.status);
  if (params.start !== undefined) result.set("start", String(params.start));
  if (params.pageLength !== undefined)
    result.set("page_length", String(params.pageLength));
  return result;
}

export async function listAdmissionYears(
  params: ListParams = {},
): Promise<{ years: AdmissionYear[]; total: number }> {
  const result = await call<Record<string, unknown>>(
    "crm.api.admin_catalog.list_admission_years",
    listParams(params),
  );
  return {
    years: normalize<AdmissionYear[]>(result.years ?? []),
    total: Number(result.total ?? 0),
  };
}

export function createAdmissionYear(data: Partial<AdmissionYear>) {
  return post<AdmissionYear>("crm.api.admin_catalog.create_admission_year", {
    data,
  });
}

export function updateAdmissionYear(
  name: string,
  data: Partial<AdmissionYear>,
  expectedModified?: string,
) {
  return post<AdmissionYear>("crm.api.admin_catalog.update_admission_year", {
    name,
    data,
    expected_modified: expectedModified,
  });
}

export function deleteAdmissionYear(name: string, expectedModified?: string) {
  return post<{ deleted: string }>(
    "crm.api.admin_catalog.delete_admission_year",
    { name, expected_modified: expectedModified },
  );
}

export async function listAcademicYearConfigs(
  params: ListParams = {},
): Promise<{ configs: AcademicYearConfig[]; total: number }> {
  const result = await call<Record<string, unknown>>(
    "crm.api.admin_catalog.list_academic_year_configs",
    listParams(params),
  );
  return {
    configs: normalize<AcademicYearConfig[]>(result.configs ?? []),
    total: Number(result.total ?? 0),
  };
}

export function createAcademicYearConfig(data: Partial<AcademicYearConfig>) {
  return post<AcademicYearConfig>(
    "crm.api.admin_catalog.create_academic_year_config",
    { data },
  );
}

export function updateAcademicYearConfig(
  name: string,
  data: Partial<AcademicYearConfig>,
  expectedModified?: string,
) {
  return post<AcademicYearConfig>(
    "crm.api.admin_catalog.update_academic_year_config",
    { name, data, expected_modified: expectedModified },
  );
}

export function deleteAcademicYearConfig(
  name: string,
  expectedModified?: string,
) {
  return post<{ deleted: string }>(
    "crm.api.admin_catalog.delete_academic_year_config",
    { name, expected_modified: expectedModified },
  );
}

export async function listAdmissionOfferings(
  params: ListParams = {},
): Promise<{ offerings: AdmissionOffering[]; total: number }> {
  const result = await call<Record<string, unknown>>(
    "crm.api.admin_catalog.list_admission_offerings",
    listParams(params),
  );
  return {
    offerings: normalize<AdmissionOffering[]>(result.offerings ?? []),
    total: Number(result.total ?? 0),
  };
}

export function createAdmissionOffering(data: Partial<AdmissionOffering>) {
  return post<AdmissionOffering>(
    "crm.api.admin_catalog.create_admission_offering",
    { data },
  );
}

export function updateAdmissionOffering(
  name: string,
  data: Partial<AdmissionOffering>,
  expectedModified?: string,
) {
  return post<AdmissionOffering>(
    "crm.api.admin_catalog.update_admission_offering",
    { name, data, expected_modified: expectedModified },
  );
}

export function transitionAdmissionOffering(
  name: string,
  status: AdmissionOffering["status"],
  expectedModified?: string,
  idempotencyKey?: string,
) {
  return post<AdmissionOffering>(
    "crm.api.admin_catalog.transition_admission_offering",
    {
      name,
      status,
      expected_modified: expectedModified,
      idempotency_key: idempotencyKey,
    },
  );
}

export function deleteAdmissionOffering(
  name: string,
  expectedModified?: string,
) {
  return post<{ deleted: string }>(
    "crm.api.admin_catalog.delete_admission_offering",
    { name, expected_modified: expectedModified },
  );
}

export async function listScoreTemplates(
  params: Pick<ListParams, "search" | "start" | "pageLength"> = {},
): Promise<{ templates: ScoreTemplate[]; total: number }> {
  const result = await call<Record<string, unknown>>(
    "crm.api.admin_catalog.list_score_templates",
    listParams(params),
  );
  return {
    templates: normalize<ScoreTemplate[]>(result.templates ?? []),
    total: Number(result.total ?? 0),
  };
}

export function getScoreTemplate(name: string) {
  return call<ScoreTemplate>(
    "crm.api.admin_catalog.get_score_template",
    new URLSearchParams({ name }),
  );
}

export async function listScoreSignals(
  params: ScoreSignalListParams = {},
): Promise<{ signals: ScoreSignal[]; total: number }> {
  const query = listParams(params);
  if (params.activeOnly !== undefined) {
    query.set("active_only", String(params.activeOnly));
  }
  const result = await call<Record<string, unknown>>(
    "crm.api.admin_catalog.list_score_signals",
    query,
  );
  const signals = normalize<unknown[]>(result.signals ?? []).map((value) => {
    const signal = asRecord(value);
    const name = text(signal.name) ?? "";
    return {
      name,
      signal_key: text(signal.signal_key) ?? name,
      label: text(signal.label) ?? name,
      category: text(signal.category) ?? "",
      signal_type: text(signal.signal_type) ?? "",
      is_active: bool(signal.is_active),
      description: text(signal.description),
    };
  });
  return { signals, total: Number(result.total ?? 0) };
}

export function createScoreTemplate(data: Partial<ScoreTemplate>) {
  return post<ScoreTemplate>("crm.api.admin_catalog.create_score_template", {
    data,
  });
}

export function updateScoreTemplate(
  name: string,
  data: Partial<ScoreTemplate>,
  expectedModified?: string,
) {
  return post<ScoreTemplate>("crm.api.admin_catalog.update_score_template", {
    name,
    data,
    expected_modified: expectedModified,
  });
}

export function deleteScoreTemplate(name: string, expectedModified?: string) {
  return post<{ deleted: string }>(
    "crm.api.admin_catalog.delete_score_template",
    { name, expected_modified: expectedModified },
  );
}

export async function listCampaignChannelTypes(
  params: ListParams = {},
): Promise<{ channel_types: CampaignChannelType[]; total: number }> {
  const result = await call<Record<string, unknown>>(
    "crm.api.campaign_channel_type.list_campaign_channel_types",
    listParams({ ...params, pageLength: params.pageLength ?? 50 }),
  );
  return {
    channel_types: normalize<CampaignChannelType[]>(result.channel_types ?? []),
    total: Number(result.total ?? 0),
  };
}

export function createCampaignChannelType(data: Partial<CampaignChannelType>) {
  return post<CampaignChannelType>(
    "crm.api.campaign_channel_type.create_campaign_channel_type",
    { data },
  );
}

export function updateCampaignChannelType(
  name: string,
  data: Partial<CampaignChannelType>,
) {
  return post<CampaignChannelType>(
    "crm.api.campaign_channel_type.update_campaign_channel_type",
    { name, data },
  );
}

export function deleteCampaignChannelType(name: string) {
  return post<{ deleted: string }>(
    "crm.api.campaign_channel_type.delete_campaign_channel_type",
    { name },
  );
}

export async function listGovernedValues(
  doctype: GovernedDoctype,
  params: ListParams = {},
): Promise<{ records: GovernedRecord[]; total: number }> {
  const result = await call<Record<string, unknown>>(
    "crm.api.admin_catalog.list_governed_values",
    new URLSearchParams({ doctype, ...Object.fromEntries(listParams(params)) }),
  );
  return {
    records: normalize<GovernedRecord[]>(result.records ?? []),
    total: Number(result.total ?? 0),
  };
}

export function createGovernedValue(
  doctype: GovernedDoctype,
  data: Record<string, unknown>,
) {
  return post<{ record: GovernedRecord; status: string }>(
    "crm.api.admin_catalog.create_governed_value",
    { doctype, data },
  );
}

export function proposeGovernedChange(input: {
  doctype: GovernedDoctype;
  docname: string;
  action: "Retire" | "Reactivate" | "Supersede";
  reason: string;
  newValue?: string;
  expectedVersion?: number;
}) {
  return post<{ change: string }>(
    "crm.api.admin_catalog.propose_governed_change",
    {
      doctype: input.doctype,
      docname: input.docname,
      action: input.action,
      reason: input.reason,
      new_value: input.newValue,
      expected_version: input.expectedVersion,
    },
  );
}

export function listGovernedChanges(doctype: GovernedDoctype) {
  return call<{ changes: PendingGovernedChange[] }>(
    "crm.api.admin_catalog.list_governed_changes",
    new URLSearchParams({ doctype }),
  );
}

export function approveGovernedChange(changeLogName: string) {
  return post<{ status: string }>(
    "crm.api.admin_catalog.approve_governed_change",
    { change_log_name: changeLogName },
  );
}

export function normalizeCatalogError(
  error: unknown,
  fallback: string,
): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export const adminCatalogInternals = { asRecord, text, bool, number };
