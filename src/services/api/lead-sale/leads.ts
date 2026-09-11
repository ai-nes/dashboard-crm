import { getCsrfToken } from "../auth";

export type LeadStatus = string;

export interface LeadStatusOption {
  value: string;
  label: string;
}

export type LeadResolution =
  | "PENDING"
  | "MATCHED"
  | "CREATED"
  | "DUPLICATE"
  | "INVALID"
  | "SPAM"
  | "FAILED";

export type LeadResolutionFilter = LeadResolution;

export type LeadProcessStatus =
  | "NEW"
  | "PROCESSING"
  | "PROCESSED"
  | "ASSIGNED"
  | "CLOSED";

export type LeadProcessResolution = "PENDING" | LeadResolution;

export interface LeadListItem {
  id: string;
  leadCode: string;
  studentCode: string | null;
  studentId: string | null;
  initials: string;
  name: string;
  phone: string;
  school: string;
  status: LeadStatus;
  statusCode?: string | null;
  processingStatus?: string | null;
  result: LeadResolution | "";
  source: string;
  owner: string;
  ownerStaff?: string | null;
  owningTeam?: string | null;
  ownershipRevision?: number | null;
  contactNoAnswer: number;
  contactSuccess: number;
  createdAt?: string | null;
}

export type ConversionPotential =
  | "Cao"
  | "Trung bình"
  | "Thấp"
  | "Chưa xác định";

export type FptAspiration = string;

export interface LeadDetail extends LeadListItem {
  lifecycleStatus?: string | null;
  lifecycleStatusCode?: string | null;
  email: string;
  secondaryEmail: string;
  province: string;
  ward: string;
  interestedMajor: string;
  adChannel: string;
  segments: string[];
  enrollmentYear: number | null;
  conversionPotential: ConversionPotential | null;
  branch: string;
  tags: string[];
  fptAspiration: FptAspiration;
  eventsParticipated: string[];
  description: string;
  ownerStaff?: string | null;
  owningTeam?: string | null;
  ownershipRevision?: number | null;
  modifiedAt?: string | null;
}

export type LeadLogEntryType = "note" | "activity";

export interface LeadLogEntry {
  id: string;
  type: LeadLogEntryType;
  title: string;
  author: string;
  date: string;
  content: string;
  eventType?: string | null;
  category?: string | null;
  fieldname?: string | null;
  fieldLabel?: string | null;
  oldValue?: unknown | null;
  newValue?: unknown | null;
  reason?: string | null;
  source?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface LeadListParams {
  admissionYear?: number;
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
  resolution?: LeadResolutionFilter | string;
  campaign?: string;
  order?: "asc" | "desc";
}

export interface LeadListMeta {
  total: number;
  totalAll: number;
  /** Leads still waiting for the "Xử lý Lead" step, across the whole year. */
  pendingNew: number;
  /** Processed leads with no owner yet, i.e. what "Phân công Lead" would pick up. */
  readyToAssign: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  admissionYear: number | null;
  query: string;
  status: string | null;
  statusOptions: LeadStatusOption[];
  resolution: string | null;
  resolutionOptions: LeadStatusOption[];
  stats?: LeadCampaignStats;
  asOf?: string | null;
}

export interface LeadCampaignStats {
  total: number;
  inProgress: number;
  closed: number;
  conversionRate: number;
}

export interface LeadListResponse {
  data: LeadListItem[];
  meta: LeadListMeta;
}

export interface LeadDetailResponse {
  lead: LeadDetail;
  log: LeadLogEntry[];
  meta: { asOf?: string | null };
}

export interface LeadProcessRequest {
  lead: string;
  resolution?: LeadResolution;
  reason?: string;
}

export interface LeadStatusUpdateRequest {
  lead: string;
  status: LeadProcessStatus;
  reason?: string;
}

export interface LeadReopenRequest {
  lead: string;
  reason?: string;
}

export interface LeadProcessResponse {
  status: LeadProcessStatus;
  resolution: LeadProcessResolution;
  lead: string;
  targetStudent: string | null;
  validation: Record<string, boolean>;
}

export interface LeadConversionResponse {
  status: LeadProcessStatus;
  resolution: LeadProcessResolution;
  lead: string;
  student: string;
  studentStage: string;
}

export interface LeadAssignmentCapacity {
  active: number;
  limit: number | null;
  remaining: number | null;
}

export interface LeadAssignmentTarget {
  id: string;
  displayName: string;
  teamId: string;
  teamName: string;
  function: string;
  capacity: LeadAssignmentCapacity;
  effectiveActive: number;
}

export interface LeadAssignmentTargetsResponse {
  lead: string;
  province: string;
  ownershipRevision: number;
  targets: LeadAssignmentTarget[];
}

export interface LeadAssignmentRequest {
  lead: string;
  ownerStaff: string;
  targetTeamId: string;
  expectedRevision: number;
  reason?: string;
  idempotencyKey?: string;
  correlationId?: string;
}

export interface LeadAssignmentResponse {
  status: "ASSIGNED";
  resolution: "PENDING";
  lead: string;
  ownership: {
    ownerStaff: string | null;
    owningTeam: string | null;
    revision: number;
  };
}

export interface LeadProcessScanRequest {
  admissionYear?: number | string | null;
  limit?: number;
}

export interface LeadProcessScanSummary {
  scanned: number;
  processed: number;
  closed: number;
  skipped: number;
  failed: number;
}

export interface LeadProcessScanResponse {
  summary: LeadProcessScanSummary;
  admissionYear: string | null;
}

export interface LeadApiRequestOptions {
  baseUrl?: string;
}

export type LeadUpdateFieldValue = string | null;

export type LeadUpdateFields = Partial<{
  student_name: LeadUpdateFieldValue;
  phone: LeadUpdateFieldValue;
  email: LeadUpdateFieldValue;
  other_email: LeadUpdateFieldValue;
  province: LeadUpdateFieldValue;
  ward: LeadUpdateFieldValue;
  high_school: LeadUpdateFieldValue;
  major: LeadUpdateFieldValue;
  aspiration: LeadUpdateFieldValue;
  admission_year: LeadUpdateFieldValue;
  branch: LeadUpdateFieldValue;
  source: LeadUpdateFieldValue;
  advertising_channel: LeadUpdateFieldValue;
  conversion_potential: LeadUpdateFieldValue;
  segments: LeadUpdateFieldValue;
  notes: LeadUpdateFieldValue;
}>;

export type LeadCreateFields = LeadUpdateFields & {
  student_name: string;
  phone: string;
  province: string;
  campaign: string;
};

export interface LeadImportRowError {
  row: number;
  code: string;
  message: string;
}

export interface LeadImportMapping {
  sourceIndex: number;
  targetField: string | null;
  enabled: boolean;
}

export interface LeadImportFieldDefinition {
  key: string;
  label: string;
  required: boolean;
  valueType: string;
}

export interface LeadImportHeader {
  sourceIndex: number;
  label: string;
  inferredField: string | null;
  enabled: boolean;
}

export interface LeadImportSampleRow {
  row: number;
  values: (string | null)[];
}

export interface LeadImportIgnoredColumn {
  sourceIndex: number;
  label: string;
}

export interface LeadImportInspectResponse {
  filename: string;
  fieldCatalog: LeadImportFieldDefinition[];
  headers: LeadImportHeader[];
  sampleRows: LeadImportSampleRow[];
  requiredFields: string[];
}

export interface LeadImportPreviewRow {
  row: number;
  fields: Record<string, unknown>;
  errors: LeadImportRowError[];
}

export interface LeadImportPreviewResponse {
  filename: string;
  total: number;
  valid: number;
  failed: number;
  rows: LeadImportPreviewRow[];
  errors: LeadImportRowError[];
  mappedFields: string[];
  ignoredColumns: LeadImportIgnoredColumn[];
}

export interface LeadImportResponse {
  filename: string;
  total: number;
  created: number;
  failed: number;
  students: Record<string, unknown>[];
  errors: LeadImportRowError[];
}

export interface LeadDeleteResponse {
  deleted: string;
}

export class LeadApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "LeadApiError";
  }
}

const LIST_METHOD = "crm.api.director_leads.get_director_leads";
const DETAIL_METHOD = "crm.api.director_leads.get_director_lead";
const CREATE_METHOD = "crm.api.lead.create_lead";
const INSPECT_IMPORT_METHOD = "crm.api.lead_mapping.inspect_lead_import";
const PREVIEW_IMPORT_METHOD = "crm.api.lead_mapping.preview_lead_import";
const IMPORT_METHOD = "crm.api.lead_mapping.import_leads";
const UPDATE_METHOD = "crm.api.lead.update_lead";
const DELETE_METHOD = "crm.api.lead.delete_lead";
const CONVERT_METHOD = "crm.api.lead_processing.convert_to_student";
const ASSIGNMENT_TARGETS_METHOD =
  "crm.api.lead_processing.list_lead_assignment_targets";
const ASSIGN_METHOD = "crm.api.lead_processing.assign_lead";
const PROCESS_METHOD = "crm.api.lead_processing.process_lead";
const PROCESS_SCAN_METHOD = "crm.api.lead_processing.process_new_leads";
const STATUS_UPDATE_METHOD = "crm.api.lead_processing.update_processing_status";
const REOPEN_METHOD = "crm.api.lead_processing.reopen_lead";
const LEAD_PROCESS_STATUSES = new Set<LeadProcessStatus>([
  "NEW",
  "PROCESSING",
  "PROCESSED",
  "ASSIGNED",
  "CLOSED",
]);
const LEAD_PROCESS_RESOLUTIONS = new Set<LeadProcessResolution>([
  "PENDING",
  "MATCHED",
  "CREATED",
  "DUPLICATE",
  "INVALID",
  "SPAM",
  "FAILED",
]);
const LEAD_RESOLUTION_CODES = new Set<LeadResolution>([
  "PENDING",
  "MATCHED",
  "CREATED",
  "DUPLICATE",
  "INVALID",
  "SPAM",
  "FAILED",
]);

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function nullableText(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

function firstText(values: unknown[], fallback = ""): string {
  for (const value of values) {
    const candidate = nullableText(value);
    if (candidate) return candidate;
  }
  return fallback;
}

function count(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : 0;
}

function normalizeResolution(value: unknown): LeadResolution | "" {
  const candidate = text(value).toUpperCase();
  return LEAD_RESOLUTION_CODES.has(candidate as LeadResolution)
    ? (candidate as LeadResolution)
    : "";
}

function normalizeProcessResponse(value: unknown): LeadProcessResponse {
  const payload = asRecord(unwrapMessage(value));
  const status = text(payload?.status).toUpperCase() as LeadProcessStatus;
  const resolution = text(
    payload?.resolution,
    "PENDING",
  ).toUpperCase() as LeadProcessResolution;
  if (
    !payload ||
    !LEAD_PROCESS_STATUSES.has(status) ||
    !LEAD_PROCESS_RESOLUTIONS.has(resolution)
  ) {
    throw new Error("Invalid Lead processing response");
  }

  const rawValidation = asRecord(payload.validation) ?? {};
  return {
    status,
    resolution,
    lead: firstText([payload.lead]),
    targetStudent:
      firstText([payload.targetStudent, payload.target_student]) || null,
    validation: Object.fromEntries(
      Object.entries(rawValidation).map(([key, item]) => [key, Boolean(item)]),
    ),
  };
}

function normalizeConversionResponse(value: unknown): LeadConversionResponse {
  const payload = asRecord(unwrapMessage(value));
  const conversion = asRecord(payload?.conversion);
  const status = text(payload?.status).toUpperCase() as LeadProcessStatus;
  const resolution = text(
    payload?.resolution,
    "CREATED",
  ).toUpperCase() as LeadProcessResolution;
  const student = firstText([
    payload?.student,
    payload?.targetStudent,
    payload?.target_student,
    conversion?.student,
    conversion?.studentId,
    conversion?.student_id,
    conversion?.targetStudent,
    conversion?.target_student,
  ]);

  if (
    !payload ||
    !LEAD_PROCESS_STATUSES.has(status) ||
    !LEAD_PROCESS_RESOLUTIONS.has(resolution) ||
    !student
  ) {
    throw new Error("Invalid Lead conversion response");
  }

  return {
    status,
    resolution,
    lead: firstText([payload.lead]),
    student,
    studentStage: firstText(
      [
        payload.studentStage,
        payload.student_stage,
        conversion?.studentStage,
        conversion?.student_stage,
      ],
      "New",
    ),
  };
}

function normalizeAssignmentTarget(
  value: unknown,
): LeadAssignmentTarget | null {
  const row = asRecord(value) ?? {};
  const id = firstText([row.id, row.staff]);
  const teamId = firstText([row.teamId, row.team_id, row.team]);
  if (!id || !teamId) return null;

  const capacity = asRecord(row.capacity) ?? {};
  return {
    id,
    displayName: firstText([row.displayName, row.staffName, row.staff_name], id),
    teamId,
    teamName: firstText([row.teamName, row.team_name], teamId),
    function: firstText([row.function], "Sale"),
    capacity: {
      active: count(capacity.active),
      limit: integerOrNull(capacity.limit),
      remaining: integerOrNull(capacity.remaining),
    },
    effectiveActive: count(row.effectiveActive ?? row.effective_active),
  };
}

function normalizeAssignmentTargets(
  value: unknown,
): LeadAssignmentTargetsResponse {
  const payload = asRecord(unwrapMessage(value));
  const rawTargets = Array.isArray(payload?.targets) ? payload.targets : [];
  const targets = rawTargets
    .map(normalizeAssignmentTarget)
    .filter((target): target is LeadAssignmentTarget => target !== null);
  if (!payload || !Array.isArray(payload.targets)) {
    throw new Error("Invalid Lead assignment targets response");
  }
  return {
    lead: firstText([payload.lead]),
    province: firstText([payload.province]),
    ownershipRevision:
      integerOrNull(payload.ownershipRevision ?? payload.ownership_revision) ??
      0,
    targets,
  };
}

function normalizeAssignmentResponse(value: unknown): LeadAssignmentResponse {
  const payload = asRecord(unwrapMessage(value));
  const ownership = asRecord(payload?.ownership) ?? {};
  if (
    !payload ||
    text(payload.status).toUpperCase() !== "ASSIGNED" ||
    text(payload.resolution, "PENDING").toUpperCase() !== "PENDING" ||
    !firstText([payload.lead])
  ) {
    throw new Error("Invalid Lead assignment response");
  }
  return {
    status: "ASSIGNED",
    resolution: "PENDING",
    lead: firstText([payload.lead]),
    ownership: {
      ownerStaff:
        firstText([ownership.ownerStaff, ownership.owner_staff]) || null,
      owningTeam:
        firstText([ownership.owningTeam, ownership.owning_team]) || null,
      revision: integerOrNull(ownership.revision) ?? 0,
    },
  };
}

function unwrapMessage(value: unknown): unknown {
  const root = asRecord(value);
  return root?.message !== undefined ? root.message : value;
}

function stringArray(value: unknown): string[] {
  let parsed = value;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return [];
    }
  }
  return Array.isArray(parsed)
    ? parsed.filter((item): item is string => typeof item === "string")
    : [];
}

function integerOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.floor(value);
  }
  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    return Number.parseInt(value, 10);
  }
  return null;
}

function initials(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  return (
    parts
      .slice(-2)
      .map((part) => part[0]?.toLocaleUpperCase("vi-VN") ?? "")
      .join("") || "L"
  );
}

function normalizeConversionPotential(
  value: unknown,
): ConversionPotential | null {
  const candidate = nullableText(value)?.toLocaleLowerCase("vi-VN");
  if (!candidate) return null;
  if (candidate === "cao" || candidate === "high") return "Cao";
  if (candidate === "trung bình" || candidate === "medium") {
    return "Trung bình";
  }
  if (candidate === "thấp" || candidate === "low") return "Thấp";
  if (candidate === "chưa xác định" || candidate === "unknown") {
    return "Chưa xác định";
  }
  return null;
}

function normalizeListItem(value: unknown): LeadListItem {
  const row = asRecord(value) ?? {};
  const id = firstText([row.id, row.name]);
  const name = firstText([row.studentName, row.student_name, row.name], id);
  const processingStatus = firstText([
    row.processingStatus,
    row.processing_status,
  ]);
  const createdAt = firstText([row.createdAt, row.created_at, row.creation]);
  const owner = firstText(
    [
      row.ownerStaff,
      row.owner_staff,
      row.assignedTo,
      row.assigned_to,
      row.owner,
    ],
    "Chưa phân công",
  );
  return {
    id,
    leadCode: firstText([row.leadCode, row.lead_code]),
    studentCode: firstText([row.studentCode, row.student_code]) || null,
    studentId:
      firstText([
        row.studentId,
        row.student_id,
        row.convertedStudent,
        row.converted_student,
        row.matchedStudent,
        row.matched_student,
        row.student,
      ]) || null,
    initials: firstText([row.initials], initials(name)),
    name,
    phone: firstText([row.phone]),
    school: firstText([row.school, row.highSchool, row.high_school]),
    status: firstText([
      row.status,
      row.processingStatus,
      row.processing_status,
      row.leadStatus,
    ]),
    statusCode:
      firstText([
        row.statusCode,
        row.status_code,
        row.processingStatus,
        row.processing_status,
      ]) || null,
    ...(processingStatus ? { processingStatus } : {}),
    result: normalizeResolution(row.result ?? row.resolution),
    source: firstText([row.source]),
    owner,
    ownerStaff:
      firstText([row.ownerStaff, row.owner_staff, row.assignedTo, row.assigned_to]) ||
      null,
    owningTeam:
      firstText([row.owningTeam, row.owning_team]) || null,
    ownershipRevision: integerOrNull(
      row.ownershipRevision ?? row.ownership_revision,
    ),
    contactNoAnswer: count(
      row.contactNoAnswer ?? row.contact_no_answer ?? row.no_answer_calls,
    ),
    contactSuccess: count(
      row.contactSuccess ?? row.contact_success ?? row.success_calls,
    ),
    ...(createdAt ? { createdAt } : {}),
  };
}

function normalizeMeta(value: unknown): LeadListMeta {
  const meta = asRecord(value) ?? {};
  const admissionYear = meta.admissionYear ?? meta.admission_year;
  const parsedAdmissionYear =
    typeof admissionYear === "number" && Number.isFinite(admissionYear)
      ? Math.floor(admissionYear)
      : null;
  const rawOptions = meta.statusOptions ?? meta.status_options;
  const options: unknown[] = Array.isArray(rawOptions) ? rawOptions : [];
  const rawResolutionOptions =
    meta.resolutionOptions ?? meta.resolution_options;
  const resolutionOptions: unknown[] = Array.isArray(rawResolutionOptions)
    ? rawResolutionOptions
    : [];
  const rawStats = asRecord(meta.stats);
  const stats = rawStats
    ? {
        total: count(rawStats.total),
        inProgress: count(rawStats.inProgress ?? rawStats.in_progress),
        closed: count(rawStats.closed),
        conversionRate: count(
          rawStats.conversionRate ?? rawStats.conversion_rate,
        ),
      }
    : undefined;

  return {
    total: count(meta.total),
    totalAll: count(meta.totalAll ?? meta.total_all),
    pendingNew: count(meta.pendingNew ?? meta.pending_new),
    readyToAssign: count(meta.readyToAssign ?? meta.ready_to_assign),
    page: count(meta.page) || 1,
    pageSize: count(meta.pageSize ?? meta.page_size) || 20,
    totalPages: count(meta.totalPages ?? meta.total_pages) || 1,
    hasNextPage: Boolean(meta.hasNextPage ?? meta.has_next_page),
    admissionYear: parsedAdmissionYear,
    query: text(meta.query),
    status: nullableText(meta.status),
    statusOptions: options
      .map((option): LeadStatusOption | null => {
        const row = asRecord(option) ?? {};
        const value = text(row.value);
        const label = text(row.label, value);
        return value ? { value, label } : null;
      })
      .filter((option): option is LeadStatusOption => option !== null),
    resolution: nullableText(meta.resolution),
    resolutionOptions: resolutionOptions
      .map((option): LeadStatusOption | null => {
        const row = asRecord(option) ?? {};
        const value = text(row.value);
        const label = text(row.label, value);
        return value ? { value, label } : null;
      })
      .filter((option): option is LeadStatusOption => option !== null),
    ...(stats ? { stats } : {}),
    asOf: nullableText(meta.asOf ?? meta.as_of),
  };
}

export function normalizeLeadList(value: unknown): LeadListResponse {
  const payload = asRecord(unwrapMessage(value));
  if (!payload || !Array.isArray(payload.data) || !asRecord(payload.meta)) {
    throw new Error("Invalid Lead list response");
  }
  return {
    data: payload.data.map(normalizeListItem),
    meta: normalizeMeta(payload.meta),
  };
}

function normalizeDetail(value: unknown): LeadDetail {
  const row = asRecord(value) ?? {};
  const enrollmentYear =
    row.enrollmentYear ?? row.enrollment_year ?? row.admission_year;

  return {
    ...normalizeListItem(row),
    lifecycleStatus:
      firstText([
        row.lifecycleStatus,
        row.lifecycle_status,
        row.studentStage,
        row.student_stage,
      ]) || null,
    lifecycleStatusCode:
      firstText([
        row.lifecycleStatusCode,
        row.lifecycle_status_code,
        row.studentStage,
        row.student_stage,
      ]) || null,
    email: firstText([row.email]),
    secondaryEmail: firstText([
      row.secondaryEmail,
      row.secondary_email,
      row.other_email,
    ]),
    province: firstText([row.province]),
    ward: firstText([row.ward]),
    interestedMajor: firstText([
      row.interestedMajor,
      row.interested_major,
      row.major,
    ]),
    adChannel: firstText([
      row.adChannel,
      row.ad_channel,
      row.advertising_channel,
    ]),
    segments: stringArray(row.segments),
    enrollmentYear: integerOrNull(enrollmentYear),
    conversionPotential: normalizeConversionPotential(
      row.conversionPotential ?? row.conversion_potential,
    ),
    branch: firstText([row.branch]),
    tags: stringArray(row.tags),
    fptAspiration: firstText([
      row.fptAspiration,
      row.fpt_aspiration,
      row.aspiration,
    ]),
    eventsParticipated: stringArray(
      row.eventsParticipated ?? row.events_participated,
    ),
    description: firstText([row.description, row.notes]),
    ownerStaff:
      firstText([
        row.ownerStaff,
        row.owner_staff,
        row.assignedTo,
        row.assigned_to,
      ]) || null,
    owningTeam: firstText([row.owningTeam, row.owning_team]) || null,
    ownershipRevision:
      integerOrNull(row.ownershipRevision ?? row.ownership_revision) ?? 0,
    modifiedAt:
      firstText([row.modifiedAt, row.modified_at, row.modified]) || null,
  };
}

function normalizeLogEntry(value: unknown): LeadLogEntry {
  const row = asRecord(value) ?? {};
  const type = row.type === "note" ? "note" : "activity";
  return {
    id: text(row.id),
    type,
    title: text(row.title),
    author: text(row.author),
    date: text(row.date),
    content: text(row.content),
    eventType: nullableText(row.eventType ?? row.event_type),
    category: nullableText(row.category),
    fieldname: nullableText(row.fieldname ?? row.field_name),
    fieldLabel: nullableText(row.fieldLabel ?? row.field_label),
    oldValue: row.oldValue ?? row.old_value ?? null,
    newValue: row.newValue ?? row.new_value ?? null,
    reason: nullableText(row.reason),
    source: nullableText(row.source),
    metadata: asRecord(row.metadata),
  };
}

export function normalizeLeadDetail(value: unknown): LeadDetailResponse {
  const payload = asRecord(unwrapMessage(value));
  if (!payload) {
    throw new Error("Invalid Lead detail response");
  }

  const legacyLead = asRecord(payload.lead);
  if (legacyLead && Array.isArray(payload.log)) {
    const meta = asRecord(payload.meta) ?? {};
    return {
      lead: normalizeDetail(legacyLead),
      log: payload.log.map(normalizeLogEntry),
      meta: { asOf: nullableText(meta.asOf ?? meta.as_of) },
    };
  }

  if (!firstText([payload.name, payload.id])) {
    throw new Error("Invalid Lead detail response");
  }

  const meta = asRecord(payload.meta) ?? {};
  return {
    lead: normalizeDetail(payload),
    log: [],
    meta: {
      asOf:
        nullableText(meta.asOf ?? meta.as_of) ??
        nullableText(
          payload.modifiedAt ?? payload.modified_at ?? payload.modified,
        ),
    },
  };
}

function resolveBaseUrl(options: LeadApiRequestOptions): string {
  return (options.baseUrl ?? process.env.NEXT_PUBLIC_FRAPPE_URL ?? "").replace(
    /\/+$/,
    "",
  );
}

function frappeCookieHeader(cookieHeader: string): string {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.split("=", 1)[0] === "sid")
    .join("; ");
}

async function requestHeaders(
  options: LeadApiRequestOptions,
  includeJsonContentType = false,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(includeJsonContentType ? { "Content-Type": "application/json" } : {}),
  };
  if (!options.baseUrl && typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieHeader = frappeCookieHeader((await cookies()).toString());
      if (cookieHeader) headers.Cookie = cookieHeader;
    } catch {
      // Contract tests and non-request contexts do not have Next headers.
    }
  }
  if (typeof window !== "undefined" && includeJsonContentType) {
    const csrfToken = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("csrf_token="))
      ?.split("=")
      .slice(1)
      .join("=");
    if (csrfToken) {
      headers["X-Frappe-CSRF-Token"] = decodeURIComponent(csrfToken);
    } else {
      try {
        const sessionCsrfToken = await getCsrfToken(resolveBaseUrl(options));
        if (sessionCsrfToken) {
          headers["X-Frappe-CSRF-Token"] = sessionCsrfToken;
        }
      } catch {
        // The write request returns the authoritative CSRF error if needed.
      }
    }
  }
  return headers;
}

function errorDetails(
  value: unknown,
  status: number,
): { code: string; message: string } {
  const root = asRecord(value);
  const message = asRecord(root?.message);
  const error = asRecord(root?.error) ?? asRecord(message?.error);
  const serverMessage = parseFrappeServerMessage(root?._server_messages);
  const serverCode = serverMessage.match(/^([A-Z][A-Z0-9_]+):\s/)?.[1];
  return {
    code:
      text(error?.code) ||
      serverCode ||
      (status === 401
        ? "UNAUTHENTICATED"
        : status === 403
          ? "FORBIDDEN"
          : `HTTP_${status}`),
    message:
      text(error?.message) ||
      text(message?.message) ||
      serverMessage ||
      text(root?.message) ||
      text(root?.exception) ||
      `Không thể tải dữ liệu Lead (${status}).`,
  };
}

function parseFrappeServerMessage(value: unknown): string {
  if (typeof value !== "string") return "";

  try {
    const messages = JSON.parse(value);
    if (!Array.isArray(messages)) return "";
    const message = messages.find(
      (item): item is Record<string, unknown> =>
        item && typeof item === "object" && typeof item.message === "string",
    )?.message;
    return typeof message === "string"
      ? message.replace(/<[^>]*>/g, "").trim()
      : "";
  } catch {
    return "";
  }
}

async function request(
  method: string,
  params: URLSearchParams,
  options: LeadApiRequestOptions,
): Promise<unknown> {
  const baseUrl = resolveBaseUrl(options);
  if (!baseUrl) {
    throw new LeadApiError(
      503,
      "LEAD_API_UNAVAILABLE",
      "Chưa cấu hình địa chỉ Frappe CRM API.",
    );
  }

  const query = params.toString();
  const url = `${baseUrl}/api/method/${method}${query ? `?${query}` : ""}`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: await requestHeaders(options),
      ...(typeof window !== "undefined"
        ? { credentials: "include" as RequestCredentials }
        : {}),
      cache: "no-store",
    });
  } catch {
    throw new LeadApiError(
      503,
      "LEAD_API_UNAVAILABLE",
      "Không thể kết nối đến máy chủ Lead.",
    );
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = errorDetails(payload, response.status);
    throw new LeadApiError(response.status, details.code, details.message);
  }
  return payload;
}

async function mutationRequest(
  method: string,
  httpMethod: "DELETE" | "POST",
  body: Record<string, unknown>,
  options: LeadApiRequestOptions,
): Promise<unknown> {
  const baseUrl = resolveBaseUrl(options);
  if (!baseUrl) {
    throw new LeadApiError(
      503,
      "LEAD_API_UNAVAILABLE",
      "Chưa cấu hình địa chỉ Frappe CRM API.",
    );
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/method/${method}`, {
      method: httpMethod,
      headers: await requestHeaders(options, true),
      ...(typeof window !== "undefined"
        ? { credentials: "include" as RequestCredentials }
        : {}),
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new LeadApiError(
      503,
      "LEAD_API_UNAVAILABLE",
      "Không thể kết nối đến máy chủ Lead.",
    );
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = errorDetails(payload, response.status);
    throw new LeadApiError(response.status, details.code, details.message);
  }
  return payload;
}

async function fileMutationRequest(
  method: string,
  body: FormData,
  options: LeadApiRequestOptions,
): Promise<unknown> {
  const baseUrl = resolveBaseUrl(options);
  if (!baseUrl) {
    throw new LeadApiError(
      503,
      "LEAD_API_UNAVAILABLE",
      "Chưa cấu hình địa chỉ Frappe CRM API.",
    );
  }

  let response: Response;
  try {
    const headers = await requestHeaders(options, true);
    delete headers["Content-Type"];
    response = await fetch(`${baseUrl}/api/method/${method}`, {
      method: "POST",
      headers,
      ...(typeof window !== "undefined"
        ? { credentials: "include" as RequestCredentials }
        : {}),
      body,
      cache: "no-store",
    });
  } catch {
    throw new LeadApiError(
      503,
      "LEAD_API_UNAVAILABLE",
      "Không thể kết nối đến máy chủ Lead.",
    );
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = errorDetails(payload, response.status);
    throw new LeadApiError(response.status, details.code, details.message);
  }
  return payload;
}

function normalizeImportError(
  value: unknown,
  fallbackRow = 0,
): LeadImportRowError {
  const item = asRecord(value) ?? {};
  return {
    row: count(item.row) || fallbackRow,
    code: text(item.code, "IMPORT_ROW_FAILED"),
    message: text(item.message, "Dòng import không hợp lệ."),
  };
}

function normalizeLeadImportInspect(
  value: unknown,
): LeadImportInspectResponse {
  const payload = asRecord(unwrapMessage(value));
  const fieldCatalog = Array.isArray(payload?.fieldCatalog)
    ? payload.fieldCatalog
        .map((item): LeadImportFieldDefinition | null => {
          const row = asRecord(item) ?? {};
          const key = text(row.key);
          return key
            ? {
                key,
                label: text(row.label, key),
                required: Boolean(row.required),
                valueType: text(row.valueType ?? row.value_type, "text"),
              }
            : null;
        })
        .filter((item): item is LeadImportFieldDefinition => item !== null)
    : [];
  const headers = Array.isArray(payload?.headers)
    ? payload.headers
        .map((item): LeadImportHeader | null => {
          const row = asRecord(item) ?? {};
          const sourceIndex = count(row.sourceIndex ?? row.source_index);
          return typeof row.label === "string"
            ? {
                sourceIndex,
                label: row.label,
                inferredField: nullableText(
                  row.inferredField ?? row.inferred_field,
                ),
                enabled: Boolean(row.enabled),
              }
            : null;
        })
        .filter((item): item is LeadImportHeader => item !== null)
    : [];
  const rawSampleRows: unknown[] = Array.isArray(payload?.sampleRows)
    ? payload.sampleRows
    : Array.isArray(payload?.sample_rows)
      ? payload.sample_rows
      : [];
  const sampleRows = rawSampleRows
    .map((item): LeadImportSampleRow | null => {
      const row = asRecord(item) ?? {};
      const values = Array.isArray(row.values)
        ? row.values.map((value) =>
            value === null || value === undefined ? null : String(value),
          )
        : [];
      return row.row
        ? { row: count(row.row), values }
        : null;
    })
    .filter((item): item is LeadImportSampleRow => item !== null);
  const rawRequiredFields: unknown[] = Array.isArray(payload?.requiredFields)
    ? payload.requiredFields
    : Array.isArray(payload?.required_fields)
      ? payload.required_fields
      : [];
  const requiredFields = rawRequiredFields.filter(
    (item): item is string => typeof item === "string",
  );
  if (
    !payload ||
    typeof payload.filename !== "string" ||
    fieldCatalog.length === 0 ||
    headers.length === 0 ||
    !Array.isArray(payload.sampleRows) && !Array.isArray(payload.sample_rows) ||
    requiredFields.length === 0
  ) {
    throw new Error("Invalid Lead import inspect response");
  }
  return { filename: payload.filename, fieldCatalog, headers, sampleRows, requiredFields };
}

function normalizeLeadImportPreview(value: unknown): LeadImportPreviewResponse {
  const payload = asRecord(unwrapMessage(value));
  const rawRows = Array.isArray(payload?.rows) ? payload.rows : [];
  const rows = rawRows.map((item) => {
    const row = asRecord(item) ?? {};
    const rowNumber = count(row.row);
    const fields = asRecord(row.fields) ?? {};
    const rawErrors = Array.isArray(row.errors) ? row.errors : [];
    return {
      row: rowNumber,
      fields,
      errors: rawErrors.map((error) => normalizeImportError(error, rowNumber)),
    };
  });
  const rawErrors = Array.isArray(payload?.errors) ? payload.errors : [];
  if (
    !payload ||
    typeof payload.filename !== "string" ||
    typeof payload.total !== "number" ||
    typeof payload.valid !== "number" ||
    typeof payload.failed !== "number" ||
    rows.some((row) => !row.row)
  ) {
    throw new Error("Invalid Lead import preview response");
  }
  return {
    filename: payload.filename,
    total: count(payload.total),
    valid: count(payload.valid),
    failed: count(payload.failed),
    rows,
    errors: rawErrors.map((error) => normalizeImportError(error)),
    mappedFields: (Array.isArray(payload.mappedFields)
      ? payload.mappedFields
      : Array.isArray(payload.mapped_fields)
        ? payload.mapped_fields
        : []
    ).filter((item): item is string => typeof item === "string"),
    ignoredColumns: (Array.isArray(payload.ignoredColumns)
      ? payload.ignoredColumns
      : Array.isArray(payload.ignored_columns)
        ? payload.ignored_columns
        : []
    )
      .map((item): LeadImportIgnoredColumn | null => {
        const row = asRecord(item) ?? {};
        return typeof row.label === "string"
          ? {
              sourceIndex: count(row.sourceIndex ?? row.source_index),
              label: row.label,
            }
          : null;
      })
      .filter((item): item is LeadImportIgnoredColumn => item !== null),
  };
}

function normalizeLeadImportResponse(value: unknown): LeadImportResponse {
  const payload = asRecord(unwrapMessage(value));
  const rawErrors = Array.isArray(payload?.errors) ? payload.errors : [];
  const students = Array.isArray(payload?.students)
    ? payload.students.filter((student): student is Record<string, unknown> =>
        Boolean(asRecord(student)),
      )
    : [];
  if (
    !payload ||
    typeof payload.filename !== "string" ||
    typeof payload.total !== "number" ||
    typeof payload.created !== "number" ||
    typeof payload.failed !== "number"
  ) {
    throw new Error("Invalid Lead import response");
  }
  return {
    filename: payload.filename,
    total: count(payload.total),
    created: count(payload.created),
    failed: count(payload.failed),
    students,
    errors: rawErrors.map((error) => normalizeImportError(error)),
  };
}

export async function getLeadList(
  params: LeadListParams = {},
  options: LeadApiRequestOptions = {},
): Promise<LeadListResponse> {
  const searchParams = new URLSearchParams();
  if (params.admissionYear !== undefined)
    searchParams.set("admissionYear", String(params.admissionYear));
  if (params.page !== undefined) searchParams.set("page", String(params.page));
  if (params.pageSize !== undefined)
    searchParams.set("pageSize", String(params.pageSize));
  if (params.q) searchParams.set("q", params.q);
  if (params.status && params.status !== "all")
    searchParams.set("status", params.status);
  if (params.resolution && params.resolution !== "all")
    searchParams.set("resolution", params.resolution);
  if (params.campaign && params.campaign !== "all")
    searchParams.set("campaign", params.campaign);
  if (params.order) searchParams.set("order", params.order);

  const payload = await request(LIST_METHOD, searchParams, options);
  try {
    return normalizeLeadList(payload);
  } catch {
    throw new LeadApiError(
      502,
      "INVALID_LEAD_LIST_RESPONSE",
      "Phản hồi danh sách Lead không hợp lệ.",
    );
  }
}

export async function getLeadDetail(
  leadId: string,
  options: LeadApiRequestOptions = {},
): Promise<LeadDetailResponse | null> {
  const searchParams = new URLSearchParams({ lead_id: leadId });
  try {
    const payload = await request(DETAIL_METHOD, searchParams, options);
    return normalizeLeadDetail(payload);
  } catch (error) {
    if (
      error instanceof LeadApiError &&
      error.status === 404 &&
      (error.code === "LEAD_NOT_FOUND" || error.code.startsWith("HTTP_"))
    ) {
      return null;
    }
    if (error instanceof LeadApiError) throw error;
    throw new LeadApiError(
      502,
      "INVALID_LEAD_DETAIL_RESPONSE",
      "Phản hồi chi tiết Lead không hợp lệ.",
    );
  }
}

export async function getLeadAssignmentTargets(
  leadId: string,
  options: LeadApiRequestOptions = {},
): Promise<LeadAssignmentTargetsResponse> {
  const normalizedLeadId = leadId.trim();
  if (!normalizedLeadId) {
    throw new LeadApiError(
      400,
      "INVALID_LEAD_NAME",
      "Thiếu mã Lead cần tải danh sách phân công.",
    );
  }

  try {
    const payload = await request(
      ASSIGNMENT_TARGETS_METHOD,
      new URLSearchParams({ lead: normalizedLeadId }),
      options,
    );
    return normalizeAssignmentTargets(payload);
  } catch (error) {
    if (error instanceof LeadApiError) throw error;
    throw new LeadApiError(
      502,
      "INVALID_LEAD_ASSIGNMENT_TARGETS_RESPONSE",
      "Danh sách Sale/CTV phân công Lead không hợp lệ.",
    );
  }
}

export async function createLead(
  fields: LeadCreateFields,
  options: LeadApiRequestOptions = {},
): Promise<LeadDetailResponse> {
  if (!fields || !fields.student_name?.trim()) {
    throw new LeadApiError(
      400,
      "INVALID_FIELDS",
      "Họ và tên Lead không được để trống.",
    );
  }

  const payload = await mutationRequest(
    CREATE_METHOD,
    "POST",
    { fields },
    options,
  );
  try {
    return normalizeLeadDetail(payload);
  } catch {
    throw new LeadApiError(
      502,
      "INVALID_LEAD_CREATE_RESPONSE",
      "Phản hồi tạo Lead không hợp lệ.",
    );
  }
}

export async function inspectLeadImport(
  file: File,
  options: LeadApiRequestOptions = {},
): Promise<LeadImportInspectResponse> {
  if (!file || !file.name) {
    throw new LeadApiError(400, "INVALID_FILE", "Vui lòng chọn file import.");
  }

  const body = new FormData();
  body.append("file", file, file.name);
  const payload = await fileMutationRequest(INSPECT_IMPORT_METHOD, body, options);
  try {
    return normalizeLeadImportInspect(payload);
  } catch {
    throw new LeadApiError(
      502,
      "INVALID_LEAD_IMPORT_INSPECT_RESPONSE",
      "Phản hồi kiểm tra file import không hợp lệ.",
    );
  }
}

export async function previewLeadImport(
  file: File,
  campaignCode?: string,
  mappingOrOptions: LeadImportMapping[] | LeadApiRequestOptions = {},
  options: LeadApiRequestOptions = {},
): Promise<LeadImportPreviewResponse> {
  if (!file || !file.name) {
    throw new LeadApiError(400, "INVALID_FILE", "Vui lòng chọn file import.");
  }

  const body = new FormData();
  body.append("file", file, file.name);
  const normalizedCampaignCode = campaignCode?.trim();
  if (normalizedCampaignCode) {
    body.append("campaign_code", normalizedCampaignCode);
  }
  const mapping = Array.isArray(mappingOrOptions) ? mappingOrOptions : undefined;
  const requestOptions = Array.isArray(mappingOrOptions)
    ? options
    : mappingOrOptions;
  if (mapping) {
    body.append("column_mapping", JSON.stringify(mapping));
  }
  const payload = await fileMutationRequest(
    PREVIEW_IMPORT_METHOD,
    body,
    requestOptions,
  );
  try {
    return normalizeLeadImportPreview(payload);
  } catch {
    throw new LeadApiError(
      502,
      "INVALID_LEAD_IMPORT_PREVIEW_RESPONSE",
      "Phản hồi xem trước file import không hợp lệ.",
    );
  }
}

export async function importLeadFile(
  file: File,
  campaignCode: string,
  mapping: LeadImportMapping[],
  options: LeadApiRequestOptions = {},
): Promise<LeadImportResponse> {
  if (!file || !file.name) {
    throw new LeadApiError(400, "INVALID_FILE", "Vui lòng chọn file import.");
  }
  const normalizedCampaignCode = campaignCode.trim();
  if (!normalizedCampaignCode) {
    throw new LeadApiError(
      400,
      "CAMPAIGN_REQUIRED",
      "Vui lòng chọn campaign trước khi nhập Lead.",
    );
  }
  if (!Array.isArray(mapping) || mapping.length === 0) {
    throw new LeadApiError(
      400,
      "INVALID_COLUMN_MAPPING",
      "Chưa có mapping cột để nhập Lead.",
    );
  }

  const body = new FormData();
  body.append("file", file, file.name);
  body.append("campaign_code", normalizedCampaignCode);
  body.append("import_mode", "quick_create");
  body.append("column_mapping", JSON.stringify(mapping));
  const payload = await fileMutationRequest(IMPORT_METHOD, body, options);
  try {
    return normalizeLeadImportResponse(payload);
  } catch {
    throw new LeadApiError(
      502,
      "INVALID_LEAD_IMPORT_RESPONSE",
      "Phản hồi nhập Lead không hợp lệ.",
    );
  }
}

export async function importLeadRows(
  rows: Record<string, unknown>[],
  filename: string,
  campaignCode: string,
  options: LeadApiRequestOptions = {},
): Promise<LeadImportResponse> {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new LeadApiError(
      400,
      "INVALID_IMPORT_ROWS",
      "Không có dòng Lead hợp lệ để nhập.",
    );
  }
  const normalizedCampaignCode = campaignCode.trim();
  if (!normalizedCampaignCode) {
    throw new LeadApiError(
      400,
      "CAMPAIGN_REQUIRED",
      "Vui lòng chọn campaign trước khi nhập Lead.",
    );
  }

  const payload = await mutationRequest(
    IMPORT_METHOD,
    "POST",
    {
      rows,
      filename,
      import_mode: "quick_create",
      campaign_code: normalizedCampaignCode,
    },
    options,
  );
  try {
    return normalizeLeadImportResponse(payload);
  } catch {
    throw new LeadApiError(
      502,
      "INVALID_LEAD_IMPORT_RESPONSE",
      "Phản hồi nhập Lead không hợp lệ.",
    );
  }
}

export async function updateLead(
  leadId: string,
  fields: LeadUpdateFields,
  options: LeadApiRequestOptions = {},
): Promise<LeadDetailResponse> {
  const normalizedLeadId = leadId.trim();
  if (!normalizedLeadId) {
    throw new LeadApiError(
      400,
      "INVALID_LEAD_NAME",
      "Thiếu mã Lead cần cập nhật.",
    );
  }
  if (!fields || Object.keys(fields).length === 0) {
    throw new LeadApiError(
      400,
      "INVALID_FIELDS",
      "Vui lòng thay đổi ít nhất một trường.",
    );
  }

  const payload = await mutationRequest(
    UPDATE_METHOD,
    "POST",
    { name: normalizedLeadId, fields },
    options,
  );
  try {
    return normalizeLeadDetail(payload);
  } catch {
    throw new LeadApiError(
      502,
      "INVALID_LEAD_UPDATE_RESPONSE",
      "Phản hồi cập nhật Lead không hợp lệ.",
    );
  }
}

function createAssignmentIdempotencyKey(lead: string): string {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `lead-detail-assignment:${lead}:${suffix}`;
}

export async function assignLeadToStaff(
  request: LeadAssignmentRequest,
  options: LeadApiRequestOptions = {},
): Promise<LeadAssignmentResponse> {
  const lead = request.lead.trim();
  const ownerStaff = request.ownerStaff.trim();
  const targetTeamId = request.targetTeamId.trim();
  if (!lead || !ownerStaff || !targetTeamId) {
    throw new LeadApiError(
      400,
      "INVALID_ASSIGNMENT_TARGET",
      "Vui lòng chọn Sale/CTV và Team để phân công Lead.",
    );
  }
  if (!Number.isSafeInteger(request.expectedRevision) || request.expectedRevision < 0) {
    throw new LeadApiError(
      400,
      "INVALID_OWNERSHIP_REVISION",
      "Thông tin phân công đã cũ, vui lòng tải lại Lead.",
    );
  }

  const body: Record<string, unknown> = {
    lead,
    owner_staff: ownerStaff,
    target_team_id: targetTeamId,
    reason:
      request.reason?.trim() || "Phân công thủ công từ màn hình chi tiết Lead.",
    idempotency_key:
      request.idempotencyKey?.trim() || createAssignmentIdempotencyKey(lead),
    expected_revision: request.expectedRevision,
  };
  if (request.correlationId?.trim()) {
    body.correlation_id = request.correlationId.trim();
  }

  const payload = await mutationRequest(ASSIGN_METHOD, "POST", body, options);
  try {
    return normalizeAssignmentResponse(payload);
  } catch {
    throw new LeadApiError(
      502,
      "INVALID_LEAD_ASSIGNMENT_RESPONSE",
      "Phản hồi phân công Lead không hợp lệ.",
    );
  }
}

export async function convertLeadToStudent(
  leadId: string,
  options: LeadApiRequestOptions = {},
): Promise<LeadConversionResponse> {
  const normalizedLeadId = leadId.trim();
  if (!normalizedLeadId) {
    throw new LeadApiError(
      400,
      "INVALID_LEAD_NAME",
      "Thiếu mã Lead cần chuyển đổi.",
    );
  }

  const payload = await mutationRequest(
    CONVERT_METHOD,
    "POST",
    { lead: normalizedLeadId },
    options,
  );
  try {
    return normalizeConversionResponse(payload);
  } catch {
    throw new LeadApiError(
      502,
      "INVALID_LEAD_CONVERSION_RESPONSE",
      "Phản hồi chuyển Lead thành Student không hợp lệ.",
    );
  }
}

export async function processLead(
  request: LeadProcessRequest,
  options: LeadApiRequestOptions = {},
): Promise<LeadProcessResponse> {
  const lead = request.lead.trim();
  const requestedResolution = request.resolution as string | undefined;
  if (!lead) {
    throw new LeadApiError(
      400,
      "INVALID_LEAD_NAME",
      "Thiếu mã Lead cần xử lý.",
    );
  }
  if (requestedResolution === "PENDING") {
    throw new LeadApiError(
      400,
      "INVALID_LEAD_RESOLUTION",
      "Không truyền PENDING khi gọi API xử lý Lead.",
    );
  }

  const body: Record<string, unknown> = { lead };
  if (request.resolution) body.resolution = request.resolution;
  if (request.reason?.trim()) body.reason = request.reason.trim();

  const payload = await mutationRequest(PROCESS_METHOD, "POST", body, options);
  try {
    return normalizeProcessResponse(payload);
  } catch {
    throw new LeadApiError(
      502,
      "INVALID_LEAD_PROCESS_RESPONSE",
      "Phản hồi xử lý Lead không hợp lệ.",
    );
  }
}

function normalizeProcessScanResponse(value: unknown): LeadProcessScanResponse {
  const payload = asRecord(unwrapMessage(value));
  const summary = asRecord(payload?.summary);
  if (!payload || !summary) {
    throw new Error("Invalid Lead processing scan response");
  }

  return {
    summary: {
      scanned: count(summary.scanned),
      processed: count(summary.processed),
      closed: count(summary.closed),
      skipped: count(summary.skipped),
      failed: count(summary.failed),
    },
    admissionYear: nullableText(
      payload.admissionYear ?? payload.admission_year,
    ),
  };
}

export async function processNewLeads(
  request: LeadProcessScanRequest = {},
  options: LeadApiRequestOptions = {},
): Promise<LeadProcessScanResponse> {
  const admissionYear = String(request.admissionYear ?? "").trim();
  if (admissionYear && !/^\d{4}$/.test(admissionYear)) {
    throw new LeadApiError(
      400,
      "INVALID_ADMISSION_YEAR",
      "Kỳ tuyển sinh phải là năm gồm bốn chữ số.",
    );
  }

  const body: Record<string, unknown> = {};
  if (admissionYear) body.admission_year = admissionYear;
  if (typeof request.limit === "number") body.limit = request.limit;

  const payload = await mutationRequest(
    PROCESS_SCAN_METHOD,
    "POST",
    body,
    options,
  );
  try {
    return normalizeProcessScanResponse(payload);
  } catch {
    throw new LeadApiError(
      502,
      "INVALID_LEAD_PROCESS_SCAN_RESPONSE",
      "Phản hồi xử lý Lead hàng loạt không hợp lệ.",
    );
  }
}

export async function updateLeadProcessingStatus(
  request: LeadStatusUpdateRequest,
  options: LeadApiRequestOptions = {},
): Promise<LeadProcessResponse> {
  const lead = request.lead.trim();
  const status = String(request.status ?? "")
    .trim()
    .toUpperCase();
  if (!lead) {
    throw new LeadApiError(
      400,
      "INVALID_LEAD_NAME",
      "Thiếu mã Lead cần cập nhật.",
    );
  }
  if (!LEAD_PROCESS_STATUSES.has(status as LeadProcessStatus)) {
    throw new LeadApiError(
      400,
      "INVALID_LEAD_STATUS",
      "Trạng thái xử lý Lead không hợp lệ.",
    );
  }

  const body: Record<string, unknown> = { lead, status };
  if (request.reason?.trim()) body.reason = request.reason.trim();

  const payload = await mutationRequest(
    STATUS_UPDATE_METHOD,
    "POST",
    body,
    options,
  );
  try {
    return normalizeProcessResponse(payload);
  } catch {
    throw new LeadApiError(
      502,
      "INVALID_LEAD_STATUS_UPDATE_RESPONSE",
      "Phản hồi cập nhật trạng thái Lead không hợp lệ.",
    );
  }
}

export async function reopenLead(
  request: LeadReopenRequest,
  options: LeadApiRequestOptions = {},
): Promise<LeadProcessResponse> {
  const lead = request.lead.trim();
  if (!lead) {
    throw new LeadApiError(
      400,
      "INVALID_LEAD_NAME",
      "Thiếu mã Lead cần mở lại.",
    );
  }

  const body: Record<string, unknown> = { lead };
  if (request.reason?.trim()) body.reason = request.reason.trim();

  const payload = await mutationRequest(REOPEN_METHOD, "POST", body, options);
  try {
    return normalizeProcessResponse(payload);
  } catch {
    throw new LeadApiError(
      502,
      "INVALID_LEAD_REOPEN_RESPONSE",
      "Phản hồi mở lại Lead không hợp lệ.",
    );
  }
}

export async function deleteLead(
  leadId: string,
  options: LeadApiRequestOptions = {},
): Promise<LeadDeleteResponse> {
  const normalizedLeadId = leadId.trim();
  if (!normalizedLeadId) {
    throw new LeadApiError(400, "INVALID_LEAD_NAME", "Thiếu mã Lead cần xóa.");
  }

  const payload = await mutationRequest(
    DELETE_METHOD,
    "DELETE",
    { name: normalizedLeadId },
    options,
  );
  const message = asRecord(unwrapMessage(payload));
  if (message && message.deleted === normalizedLeadId) {
    return { deleted: normalizedLeadId };
  }
  throw new LeadApiError(
    502,
    "INVALID_LEAD_DELETE_RESPONSE",
    "Phản hồi xóa Lead không hợp lệ.",
  );
}
