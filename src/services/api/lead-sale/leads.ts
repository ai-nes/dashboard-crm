import { NestApiError } from "../nest/nest-client";
import {
  nestAssignLead,
  nestAssignmentTargets,
  nestConvertLead,
  nestCreateLead,
  nestDeleteLead,
  nestImportLeadFile,
  nestImportLeadRows,
  nestInspectLeadImport,
  nestPreviewLeadImport,
  nestLeadDetail,
  nestLeadList,
  nestPreviewNewLeads,
  nestProcessLead,
  nestProcessNewLeads,
  nestReopenLead,
  nestSetLeadStatus,
  nestUpdateLead,
  type NestNewLeadScan,
} from "./leads-nest";

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
  order?: "asc" | "desc";
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

export interface LeadProcessingPreviewItem {
  lead: string;
  leadCode: string | null;
  studentName: string;
  phone: string;
  province: string;
  highSchool: string;
  status: LeadProcessStatus | null;
  resolution: LeadProcessResolution | null;
  processingOutcome: LeadResolution | null;
  targetStudent: string | null;
  duplicateOf: string | null;
  duplicateType: string | null;
  reason: string | null;
  errorCode: string | null;
}

export interface LeadProcessingPreviewSummary {
  scanned: number;
  readyToAssign: number;
  matchedStudent: number;
  duplicates: number;
  invalid: number;
  needsReview: number;
}

export interface LeadProcessingPreviewResponse {
  summary: LeadProcessingPreviewSummary;
  items: LeadProcessingPreviewItem[];
  admissionYear: string | null;
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
  processingOutcome: LeadResolution | null;
  targetStudent: string | null;
  duplicateOf: string | null;
  duplicateType: string | null;
  reason: string | null;
  errorCode: string | null;
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

/**
 * Run a Nest call, normalize its payload, and surface failures as `LeadApiError`.
 * A payload the normalizer rejects becomes a 502 so screens get a typed error.
 */
async function viaNest<T>(
  call: () => Promise<unknown>,
  normalize: (payload: unknown) => T,
): Promise<T> {
  let payload: unknown;
  try {
    payload = await call();
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new LeadApiError(error.status, error.code, error.message);
    }
    throw error;
  }
  try {
    return normalize(payload);
  } catch {
    throw new LeadApiError(
      502,
      "INVALID_LEAD_RESPONSE",
      "Phản hồi từ máy chủ Lead không hợp lệ.",
    );
  }
}

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
  const payload = asRecord(value);
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
  const payload = asRecord(value);
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
    displayName: firstText(
      [row.displayName, row.staffName, row.staff_name],
      id,
    ),
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
  const payload = asRecord(value);
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
  const payload = asRecord(value);
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
      firstText([
        row.ownerStaff,
        row.owner_staff,
        row.assignedTo,
        row.assigned_to,
      ]) || null,
    owningTeam: firstText([row.owningTeam, row.owning_team]) || null,
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
  const order =
    meta.order === "asc" || meta.order === "desc" ? meta.order : undefined;

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
    ...(order ? { order } : {}),
    ...(stats ? { stats } : {}),
    asOf: nullableText(meta.asOf ?? meta.as_of),
  };
}

export function normalizeLeadList(value: unknown): LeadListResponse {
  const payload = asRecord(value);
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
  const payload = asRecord(value);
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

function normalizeLeadImportInspect(value: unknown): LeadImportInspectResponse {
  const payload = asRecord(value);
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
      return row.row ? { row: count(row.row), values } : null;
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
    (!Array.isArray(payload.sampleRows) &&
      !Array.isArray(payload.sample_rows)) ||
    requiredFields.length === 0
  ) {
    throw new Error("Invalid Lead import inspect response");
  }
  return {
    filename: payload.filename,
    fieldCatalog,
    headers,
    sampleRows,
    requiredFields,
  };
}

function normalizeLeadImportPreview(value: unknown): LeadImportPreviewResponse {
  const payload = asRecord(value);
  const rawRows = Array.isArray(payload?.rows) ? payload.rows : [];
  const rows = rawRows.map((item) => {
    const row = asRecord(item) ?? {};
    const rowNumber = count(row.row);
    const fields = asRecord(row.fields) ?? {};
    const rawErrors = Array.isArray(row.errors) ? row.errors : [];
    const errors = rawErrors.map((error) =>
      normalizeImportError(error, rowNumber),
    );
    const duplicateError = errors.find((error) =>
      error.code.toUpperCase().startsWith("DUPLICATE"),
    );
    const processingOutcome =
      normalizeResolution(row.processingOutcome ?? row.processing_outcome) ||
      (duplicateError ? "DUPLICATE" : "");
    return {
      row: rowNumber,
      fields,
      errors,
      processingOutcome: processingOutcome || null,
      targetStudent: firstText([row.targetStudent, row.target_student]) || null,
      duplicateOf: firstText([row.duplicateOf, row.duplicate_of]) || null,
      duplicateType: firstText([row.duplicateType, row.duplicate_type]) || null,
      reason: firstText([row.reason, duplicateError?.message]) || null,
      errorCode: firstText([row.errorCode, row.error_code]) || null,
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
  const payload = asRecord(value);
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
): Promise<LeadListResponse> {
  return viaNest(() => nestLeadList(params), normalizeLeadList);
}

export async function getLeadDetail(
  leadId: string,
): Promise<LeadDetailResponse | null> {
  try {
    return await viaNest(() => nestLeadDetail(leadId), normalizeLeadDetail);
  } catch (error) {
    if (error instanceof LeadApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getLeadAssignmentTargets(
  leadId: string,
): Promise<LeadAssignmentTargetsResponse> {
  const normalizedLeadId = leadId.trim();
  if (!normalizedLeadId) {
    throw new LeadApiError(
      400,
      "INVALID_LEAD_NAME",
      "Thiếu mã Lead cần tải danh sách phân công.",
    );
  }
  return viaNest(
    () => nestAssignmentTargets(normalizedLeadId),
    normalizeAssignmentTargets,
  );
}

export async function createLead(
  fields: LeadCreateFields,
): Promise<LeadDetailResponse> {
  if (!fields || !fields.student_name?.trim()) {
    throw new LeadApiError(
      400,
      "INVALID_FIELDS",
      "Họ và tên Lead không được để trống.",
    );
  }
  return viaNest(() => nestCreateLead(fields), normalizeLeadDetail);
}

export async function inspectLeadImport(
  file: File,
): Promise<LeadImportInspectResponse> {
  if (!file || !file.name) {
    throw new LeadApiError(400, "INVALID_FILE", "Vui lòng chọn file import.");
  }
  return viaNest(() => nestInspectLeadImport(file), normalizeLeadImportInspect);
}

export async function previewLeadImport(
  file: File,
  campaignCode?: string,
  mapping?: LeadImportMapping[],
): Promise<LeadImportPreviewResponse> {
  if (!file || !file.name) {
    throw new LeadApiError(400, "INVALID_FILE", "Vui lòng chọn file import.");
  }
  return viaNest(
    () => nestPreviewLeadImport(file, campaignCode?.trim(), mapping),
    normalizeLeadImportPreview,
  );
}

export async function importLeadFile(
  file: File,
  campaignCode: string,
  mapping: LeadImportMapping[],
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
  return viaNest(
    () => nestImportLeadFile(file, normalizedCampaignCode, mapping),
    normalizeLeadImportResponse,
  );
}

export async function importLeadRows(
  rows: Record<string, unknown>[],
  filename: string,
  campaignCode: string,
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
  return viaNest(
    () => nestImportLeadRows(rows, filename, normalizedCampaignCode),
    normalizeLeadImportResponse,
  );
}

export async function updateLead(
  leadId: string,
  fields: LeadUpdateFields,
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
  return viaNest(
    () => nestUpdateLead(normalizedLeadId, fields),
    normalizeLeadDetail,
  );
}

export async function assignLeadToStaff(
  request: LeadAssignmentRequest,
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
  if (
    !Number.isSafeInteger(request.expectedRevision) ||
    request.expectedRevision < 0
  ) {
    throw new LeadApiError(
      400,
      "INVALID_OWNERSHIP_REVISION",
      "Thông tin phân công đã cũ, vui lòng tải lại Lead.",
    );
  }
  return viaNest(
    () =>
      nestAssignLead({
        lead,
        ownerStaff,
        targetTeamId,
        expectedRevision: request.expectedRevision,
        reason: request.reason?.trim(),
      }),
    normalizeAssignmentResponse,
  );
}

export async function convertLeadToStudent(
  leadId: string,
): Promise<LeadConversionResponse> {
  const normalizedLeadId = leadId.trim();
  if (!normalizedLeadId) {
    throw new LeadApiError(
      400,
      "INVALID_LEAD_NAME",
      "Thiếu mã Lead cần chuyển đổi.",
    );
  }
  return viaNest(
    () => nestConvertLead(normalizedLeadId),
    normalizeConversionResponse,
  );
}

export async function processLead(
  request: LeadProcessRequest,
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
  return viaNest(() => nestProcessLead(lead), normalizeProcessResponse);
}

function normalizeProcessScanResponse(value: unknown): LeadProcessScanResponse {
  const payload = asRecord(value);
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

function normalizeProcessingPreviewItem(
  value: unknown,
): LeadProcessingPreviewItem {
  const row = asRecord(value) ?? {};
  const statusValue = text(row.status).toUpperCase();
  const resolutionValue = text(row.resolution).toUpperCase();
  const outcomeValue = text(
    row.processingOutcome ?? row.processing_outcome,
  ).toUpperCase();
  const status = LEAD_PROCESS_STATUSES.has(statusValue as LeadProcessStatus)
    ? (statusValue as LeadProcessStatus)
    : null;
  const resolution = LEAD_PROCESS_RESOLUTIONS.has(
    resolutionValue as LeadProcessResolution,
  )
    ? (resolutionValue as LeadProcessResolution)
    : null;
  const processingOutcome = LEAD_RESOLUTION_CODES.has(
    outcomeValue as LeadResolution,
  )
    ? (outcomeValue as LeadResolution)
    : null;

  return {
    lead: firstText([row.lead, row.name, row.id]),
    leadCode: nullableText(row.leadCode ?? row.lead_code),
    studentName: firstText(
      [row.studentName, row.student_name],
      "Chưa có họ tên",
    ),
    phone: firstText([row.phone]),
    province: firstText([row.province]),
    highSchool: firstText([row.highSchool, row.high_school]),
    status,
    resolution,
    processingOutcome,
    targetStudent: firstText([row.targetStudent, row.target_student]) || null,
    duplicateOf: firstText([row.duplicateOf, row.duplicate_of]) || null,
    duplicateType: firstText([row.duplicateType, row.duplicate_type]) || null,
    reason: firstText([row.reason]) || null,
    errorCode: firstText([row.errorCode, row.error_code]) || null,
  };
}

function normalizeProcessingPreview(
  value: unknown,
): LeadProcessingPreviewResponse {
  const payload = asRecord(value);
  const summary = asRecord(payload?.summary);
  const rawItems = Array.isArray(payload?.items) ? payload.items : [];
  if (!payload || !summary || !Array.isArray(payload.items)) {
    throw new Error("Invalid Lead processing preview response");
  }

  return {
    summary: {
      scanned: count(summary.scanned),
      readyToAssign: count(summary.readyToAssign ?? summary.ready_to_assign),
      matchedStudent: count(summary.matchedStudent ?? summary.matched_student),
      duplicates: count(summary.duplicates),
      invalid: count(summary.invalid),
      needsReview: count(summary.needsReview ?? summary.needs_review),
    },
    items: rawItems.map(normalizeProcessingPreviewItem),
    admissionYear: nullableText(
      payload.admissionYear ?? payload.admission_year,
    ),
  };
}

/** Validate the admission year and shape the bulk-processing request. */
function toNewLeadScan(request: LeadProcessScanRequest): NestNewLeadScan {
  const admissionYear = String(request.admissionYear ?? "").trim();
  if (admissionYear && !/^\d{4}$/.test(admissionYear)) {
    throw new LeadApiError(
      400,
      "INVALID_ADMISSION_YEAR",
      "Kỳ tuyển sinh phải là năm gồm bốn chữ số.",
    );
  }
  return {
    ...(admissionYear ? { admissionYear: Number(admissionYear) } : {}),
    ...(typeof request.limit === "number" ? { limit: request.limit } : {}),
  };
}

export async function previewNewLeads(
  request: LeadProcessScanRequest = {},
): Promise<LeadProcessingPreviewResponse> {
  const scan = toNewLeadScan(request);
  return viaNest(() => nestPreviewNewLeads(scan), normalizeProcessingPreview);
}

export async function processNewLeads(
  request: LeadProcessScanRequest = {},
): Promise<LeadProcessScanResponse> {
  const scan = toNewLeadScan(request);
  return viaNest(() => nestProcessNewLeads(scan), normalizeProcessScanResponse);
}

export async function updateLeadProcessingStatus(
  request: LeadStatusUpdateRequest,
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
  return viaNest(
    () => nestSetLeadStatus(lead, status, request.reason?.trim()),
    normalizeProcessResponse,
  );
}

export async function reopenLead(
  request: LeadReopenRequest,
): Promise<LeadProcessResponse> {
  const lead = request.lead.trim();
  if (!lead) {
    throw new LeadApiError(
      400,
      "INVALID_LEAD_NAME",
      "Thiếu mã Lead cần mở lại.",
    );
  }
  return viaNest(
    () => nestReopenLead(lead, request.reason?.trim()),
    normalizeProcessResponse,
  );
}

export async function deleteLead(leadId: string): Promise<LeadDeleteResponse> {
  const normalizedLeadId = leadId.trim();
  if (!normalizedLeadId) {
    throw new LeadApiError(400, "INVALID_LEAD_NAME", "Thiếu mã Lead cần xóa.");
  }
  await viaNest(
    () => nestDeleteLead(normalizedLeadId),
    () => null,
  );
  return { deleted: normalizedLeadId };
}
