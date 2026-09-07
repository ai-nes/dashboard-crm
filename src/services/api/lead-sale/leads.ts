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
  campaign?: string;
  order?: "asc" | "desc";
}

export interface LeadListMeta {
  total: number;
  totalAll: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  admissionYear: number | null;
  query: string;
  status: string | null;
  statusOptions: LeadStatusOption[];
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

export interface LeadApiRequestOptions {
  baseUrl?: string;
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
const DETAIL_METHOD = "crm.api.lead.get_lead";
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
  return parts
    .slice(-2)
    .map((part) => part[0]?.toLocaleUpperCase("vi-VN") ?? "")
    .join("") || "L";
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
  const createdAt = firstText([
    row.createdAt,
    row.created_at,
    row.creation,
  ]);
  const owner = firstText(
    [row.ownerStaff, row.owner_staff, row.assignedTo, row.assigned_to, row.owner],
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
    statusCode: firstText([
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
    lifecycleStatus: firstText([
      row.lifecycleStatus,
      row.lifecycle_status,
      row.enrollmentStatus,
      row.enrollment_status,
    ]) || null,
    lifecycleStatusCode: firstText([
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
    modifiedAt: firstText([
      row.modifiedAt,
      row.modified_at,
      row.modified,
    ]) || null,
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
        nullableText(payload.modifiedAt ?? payload.modified_at ?? payload.modified),
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
): Promise<Record<string, string>> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (!options.baseUrl && typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieHeader = frappeCookieHeader((await cookies()).toString());
      if (cookieHeader) headers.Cookie = cookieHeader;
    } catch {
      // Contract tests and non-request contexts do not have Next headers.
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
  const searchParams = new URLSearchParams({ name: leadId });
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
