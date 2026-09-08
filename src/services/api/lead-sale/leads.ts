import { getCsrfToken } from "../auth";

export type LeadStatus = string;

export interface LeadStatusOption {
  value: string;
  label: string;
}

export type LeadResolution =
  | "MATCHED"
  | "CREATED"
  | "DUPLICATE"
  | "INVALID"
  | "SPAM"
  | "FAILED";

export type LeadResolutionFilter = "PENDING" | LeadResolution;

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
  studentId: string;
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
  source: string;
};

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
const UPDATE_METHOD = "crm.api.lead.update_lead";
const DELETE_METHOD = "crm.api.lead.delete_lead";
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
    studentId: firstText(
      [row.studentId, row.student_id, row.student, row.matched_student],
      id,
    ),
    initials: firstText([row.initials], initials(name)),
    name,
    phone: firstText([row.phone]),
    school: firstText([row.school, row.highSchool, row.high_school]),
    status: firstText([
      row.status,
      row.processingStatus,
      row.processing_status,
      row.leadStatus,
      row.lead_status,
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
        row.enrollmentStatus,
        row.enrollment_status,
      ]) || null,
    lifecycleStatusCode:
      firstText([
        row.lifecycleStatusCode,
        row.lifecycle_status_code,
        row.enrollmentStatus,
        row.enrollment_status,
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
  return {
    code:
      text(error?.code) ||
      (status === 401
        ? "UNAUTHENTICATED"
        : status === 403
          ? "FORBIDDEN"
          : `HTTP_${status}`),
    message:
      text(error?.message) ||
      text(message?.message) ||
      text(root?.message) ||
      text(root?.exception) ||
      `Không thể tải dữ liệu Lead (${status}).`,
  };
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

function normalizeProcessScanResponse(
  value: unknown,
): LeadProcessScanResponse {
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
    admissionYear: nullableText(payload.admissionYear ?? payload.admission_year),
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
  const status = String(request.status ?? "").trim().toUpperCase();
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
