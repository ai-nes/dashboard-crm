const METHODS = {
  catalogs: "crm.api.lead_assignment_batch.get_lead_assignment_catalogs",
  import: "crm.api.lead_assignment_batch.import_leads_to_assignment_batch",
  create: "crm.api.lead_assignment_batch.create_lead_assignment_batch",
  preview: "crm.api.lead_assignment_batch.preview_lead_assignment_batch",
  run: "crm.api.lead_assignment_batch.run_lead_assignment_batch",
  runUnassigned:
    "crm.api.lead_assignment_batch.run_unassigned_lead_assignment",
  retry: "crm.api.lead_assignment_batch.retry_lead_assignment_batch",
  detail: "crm.api.lead_assignment_batch.get_lead_assignment_batch",
  list: "crm.api.lead_assignment_batch.list_lead_assignment_batches",
} as const;

export type LeadAssignmentBatchStatus =
  | "draft"
  | "ready"
  | "running"
  | "completed"
  | "completed_with_errors"
  | "cancelled";

export type LeadAssignmentBatchItemStatus =
  | "pending"
  | "assigned"
  | "deferred"
  | "manual_review"
  | "failed"
  | "skipped";

export type LeadProcessingStatus =
  | "NEW"
  | "PROCESSING"
  | "PROCESSED"
  | "ASSIGNED"
  | "CLOSED";

export type LeadAssignmentResolution =
  | "PENDING"
  | "MATCHED"
  | "CREATED"
  | "DUPLICATE"
  | "INVALID"
  | "SPAM"
  | "FAILED";

export type LeadAssignmentCatalogOption = {
  id: string;
  label: string;
  code: string | null;
};

export type LeadAssignmentCatalogs = {
  provinces: LeadAssignmentCatalogOption[];
  sources: LeadAssignmentCatalogOption[];
  majors: LeadAssignmentCatalogOption[];
  highSchools: LeadAssignmentCatalogOption[];
  branches: LeadAssignmentCatalogOption[];
};

export type LeadAssignmentInputRow = {
  student_name: string;
  phone: string;
  id_number: string;
  province: string;
  high_school: string;
  major: string;
  source: string;
  email?: string;
  branch?: string;
};

export type LeadAssignmentBatchSummary = {
  total: number;
  valid: number;
  invalid: number;
  pending: number;
  assigned: number;
  deferred: number;
  manualReview: number;
  failed: number;
  skipped: number;
};

export type LeadAssignmentBatch = {
  id: string;
  batchName: string;
  description: string;
  status: LeadAssignmentBatchStatus;
  itemCount: number;
  summary: LeadAssignmentBatchSummary;
  createdAt: string;
  updatedAt: string;
  previewedAt: string | null;
  completedAt: string | null;
};

export type LeadAssignmentRoutingContext = {
  routingTier: string | number | null;
  zone: string | null;
  team: string | null;
  ownerStaff: string | null;
  activeLoad: number | null;
  capacityLimit: number | null;
  remainingCapacity: number | null;
  policyVersion: string | null;
  routingRequest: string | null;
};

export type LeadAssignmentBatchItem = LeadAssignmentRoutingContext & {
  id: string;
  leadId: string;
  studentName: string;
  phone: string | null;
  idNumber: string | null;
  email: string | null;
  province: string | null;
  highSchool: string | null;
  major: string | null;
  source: string | null;
  branch: string | null;
  status: LeadAssignmentBatchItemStatus;
  processingStatus: LeadProcessingStatus | null;
  resolution: LeadAssignmentResolution | null;
  convertedStudent: string | null;
  reason: string | null;
  errorCode: string | null;
  missingFields: string[];
};

export type LeadAssignmentPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
};

export type LeadAssignmentBatchListParams = {
  page?: number;
  pageSize?: number;
  status?: LeadAssignmentBatchStatus | "all";
  q?: string;
};

export type LeadAssignmentBatchCatalogParams = { province?: string };

export type LeadAssignmentBatchDetailResponse = {
  batch: LeadAssignmentBatch;
  items: LeadAssignmentBatchItem[];
  pagination: LeadAssignmentPagination;
};

export type LeadAssignmentBatchListResponse = {
  items: LeadAssignmentBatch[];
  pagination: LeadAssignmentPagination;
};

export type LeadAssignmentBatchMutationResponse = {
  batch: LeadAssignmentBatch;
  items: LeadAssignmentBatchItem[];
};

export type LeadAssignmentAutoRunResponse = {
  status: LeadAssignmentBatchStatus | "no_work";
  batch: LeadAssignmentBatch | null;
  items: LeadAssignmentBatchItem[];
  scanned: number;
  message: string | null;
};

export type ImportLeadAssignmentBatchRequest = {
  batchName: string;
  rows?: LeadAssignmentInputRow[];
  csvContent?: string;
  filename?: string;
  description?: string;
};

export type CreateLeadAssignmentBatchRequest = {
  batchName?: string;
  leadIds: string[];
  description?: string;
};

export type LeadAssignmentBatchActionRequest = { batchId: string };

export type RetryLeadAssignmentBatchRequest = {
  batchId: string;
  itemIds?: string[];
};

export type LeadAssignmentBatchRequestOptions = {
  baseUrl?: string;
  headers?: Record<string, string>;
  idempotencyKey?: string;
};

export class LeadAssignmentBatchApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "LeadAssignmentBatchApiError";
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function nullableText(value: unknown): string | null {
  return value === null || value === undefined ? null : text(value);
}

function count(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : fallback;
}

function nullableNumber(value: unknown): number | null {
  return value === null || value === undefined
    ? null
    : typeof value === "number" && Number.isFinite(value)
      ? value
      : null;
}

function nullableStringOrNumber(value: unknown): string | number | null {
  if (value === null || value === undefined) return null;
  return typeof value === "string" || typeof value === "number" ? value : null;
}

function unwrapMessage(value: unknown): unknown {
  const root = asRecord(value);
  return root?.message !== undefined ? root.message : value;
}

function oneOf<T extends string>(
  value: unknown,
  values: readonly T[],
  fallback: T,
): T {
  return typeof value === "string" && values.includes(value as T)
    ? (value as T)
    : fallback;
}

function options(value: unknown): LeadAssignmentCatalogOption[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const source = asRecord(item) ?? {};
    return {
      id: text(source.id ?? source.value),
      label: text(source.label ?? source.name ?? source.value),
      code: nullableText(source.code),
    };
  });
}

function normalizeSummary(value: unknown): LeadAssignmentBatchSummary {
  const source = asRecord(value) ?? {};
  const byStatus = asRecord(source.byStatus ?? source.by_status) ?? {};
  const total = count(
    source.total ??
      source.itemCount ??
      source.item_count ??
      source.total_count ??
      source.received,
  );
  const pending = count(
    source.pending ?? source.pending_count ?? byStatus.pending,
  );
  const assigned = count(
    source.assigned ?? source.assigned_count ?? byStatus.assigned,
  );
  const deferred = count(
    source.deferred ?? source.deferred_count ?? byStatus.deferred,
  );
  const manualReview = count(
    source.manualReview ??
      source.manual_review ??
      source.manual_review_count ??
      byStatus.manual_review,
  );
  const failed = count(source.failed ?? source.failed_count ?? byStatus.failed);
  const skipped = count(
    source.skipped ?? source.skipped_count ?? byStatus.skipped,
  );
  const pendingWithFallback =
    pending ||
    Math.max(0, total - assigned - deferred - manualReview - failed - skipped);
  const invalid = count(
    source.invalid ?? source.invalidCount ?? source.invalid_count,
    manualReview,
  );
  const valid = count(
    source.valid ?? source.validCount ?? source.valid_count,
    Math.max(0, total - invalid),
  );
  return {
    total,
    valid,
    invalid,
    pending: pendingWithFallback,
    assigned,
    deferred,
    manualReview,
    failed,
    skipped,
  };
}

function normalizeBatch(value: unknown): LeadAssignmentBatch {
  const source = asRecord(value) ?? {};
  const summary = normalizeSummary(
    source.summary ?? source.counts ?? source.stats,
  );
  return {
    id: text(
      source.id ?? source.batchId ?? source.batch_id ?? source.name,
      "unknown",
    ),
    batchName: text(
      source.batchName ?? source.batch_name ?? source.name,
      "Batch chưa đặt tên",
    ),
    description: text(source.description),
    status: oneOf(
      source.status,
      [
        "draft",
        "ready",
        "running",
        "completed",
        "completed_with_errors",
        "cancelled",
      ] as const,
      "draft",
    ),
    itemCount: count(
      source.itemCount ??
        source.item_count ??
        source.total_count ??
        source.count,
      summary.total,
    ),
    summary,
    createdAt: text(
      source.createdAt ?? source.created_at ?? source.creation,
      "—",
    ),
    updatedAt: text(
      source.updatedAt ?? source.updated_at ?? source.modified,
      "—",
    ),
    previewedAt: nullableText(source.previewedAt ?? source.previewed_at),
    completedAt: nullableText(source.completedAt ?? source.completed_at),
  };
}

const processingStatuses: readonly LeadProcessingStatus[] = [
  "NEW",
  "PROCESSING",
  "PROCESSED",
  "ASSIGNED",
  "CLOSED",
];
const resolutions: readonly LeadAssignmentResolution[] = [
  "PENDING",
  "MATCHED",
  "CREATED",
  "DUPLICATE",
  "INVALID",
  "SPAM",
  "FAILED",
];

function normalizeItem(value: unknown, index: number): LeadAssignmentBatchItem {
  const source = asRecord(value) ?? {};
  const id = text(
    source.id ??
      source.itemId ??
      source.item_id ??
      source.batchItemId ??
      source.batch_item_id ??
      source.leadId ??
      source.lead_id ??
      source.lead,
    `item-${index + 1}`,
  );
  const team = asRecord(source.team);
  return {
    id,
    leadId: text(source.leadId ?? source.lead_id ?? source.lead, id),
    studentName: text(
      source.studentName ?? source.student_name ?? source.name,
      "Chưa có tên Lead",
    ),
    phone: nullableText(source.phone),
    idNumber: nullableText(source.idNumber ?? source.id_number),
    email: nullableText(source.email),
    province: nullableText(source.province),
    highSchool: nullableText(
      source.highSchool ?? source.high_school ?? source.school,
    ),
    major: nullableText(source.major ?? source.interest),
    source: nullableText(source.source),
    branch: nullableText(source.branch),
    status: oneOf(
      source.status,
      [
        "pending",
        "assigned",
        "deferred",
        "manual_review",
        "failed",
        "skipped",
      ] as const,
      "pending",
    ),
    processingStatus: processingStatuses.includes(
      source.processingStatus as LeadProcessingStatus,
    )
      ? (source.processingStatus as LeadProcessingStatus)
      : processingStatuses.includes(
            source.processing_status as LeadProcessingStatus,
          )
        ? (source.processing_status as LeadProcessingStatus)
        : null,
    resolution: resolutions.includes(
      source.resolution as LeadAssignmentResolution,
    )
      ? (source.resolution as LeadAssignmentResolution)
      : null,
    convertedStudent: nullableText(
      source.convertedStudent ?? source.converted_student,
    ),
    routingTier: nullableStringOrNumber(
      source.routingTier ?? source.routing_tier,
    ),
    zone: nullableText(source.zone),
    team: team ? text(team.name ?? team.id) : nullableText(source.team),
    ownerStaff: nullableText(source.ownerStaff ?? source.owner_staff),
    activeLoad: nullableNumber(source.activeLoad ?? source.active_load),
    capacityLimit: nullableNumber(
      source.capacityLimit ?? source.capacity_limit,
    ),
    remainingCapacity: nullableNumber(
      source.remainingCapacity ?? source.remaining_capacity,
    ),
    policyVersion: nullableText(source.policyVersion ?? source.policy_version),
    routingRequest: nullableText(
      source.routingRequest ?? source.routing_request,
    ),
    reason: nullableText(
      source.reason ?? source.resolutionReason ?? source.resolution_reason,
    ),
    errorCode: nullableText(source.errorCode ?? source.error_code),
    missingFields: normalizeStringArray(
      source.missingFields ?? source.missing_fields,
    ),
  };
}

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function normalizePagination(
  value: unknown,
  total: number,
  itemCount: number,
): LeadAssignmentPagination {
  const source = asRecord(value) ?? {};
  const page = count(source.page, 1) || 1;
  const pageSize =
    count(source.pageSize ?? source.page_size, itemCount || 20) || 20;
  const normalizedTotal = count(source.total, total);
  const totalPages = count(
    source.totalPages ?? source.total_pages,
    Math.max(1, Math.ceil(normalizedTotal / pageSize)),
  );
  return {
    page,
    pageSize,
    total: normalizedTotal,
    totalPages: totalPages || 1,
    hasNextPage: Boolean(
      source.hasNextPage ?? source.has_next_page ?? page < (totalPages || 1),
    ),
  };
}

function normalizeCatalogs(value: unknown): LeadAssignmentCatalogs {
  const source = asRecord(unwrapMessage(value)) ?? {};
  return {
    provinces: options(source.provinces),
    sources: options(source.sources),
    majors: options(source.majors),
    highSchools: options(source.highSchools ?? source.high_schools),
    branches: options(source.branches),
  };
}

function normalizeDetail(value: unknown): LeadAssignmentBatchDetailResponse {
  const source = asRecord(unwrapMessage(value));
  if (!source) throw new Error("Batch detail response is invalid");
  const batchSource = asRecord(source.batch) ?? source;
  const itemValues = source.items ?? batchSource.items;
  if (!Array.isArray(itemValues))
    throw new Error("Batch detail items are missing");
  const items = itemValues.map(normalizeItem);
  const batch = normalizeBatch(batchSource);
  return {
    batch,
    items,
    pagination: normalizePagination(
      source.pagination ?? batchSource.pagination,
      batch.itemCount,
      items.length,
    ),
  };
}

function normalizeList(value: unknown): LeadAssignmentBatchListResponse {
  const source = asRecord(unwrapMessage(value));
  if (!source) throw new Error("Batch list response is invalid");
  const itemValues = source.items ?? source.batches;
  if (!Array.isArray(itemValues))
    throw new Error("Batch list items are missing");
  const items = itemValues.map(normalizeBatch);
  return {
    items,
    pagination: normalizePagination(
      source.pagination,
      count(source.total, items.length),
      items.length,
    ),
  };
}

function normalizeMutation(
  value: unknown,
): LeadAssignmentBatchMutationResponse {
  const source = asRecord(unwrapMessage(value));
  if (!source) throw new Error("Batch mutation response is invalid");
  const batch = normalizeBatch(source.batch ?? source);
  const itemValues = source.items ?? source.results;
  return {
    batch,
    items: Array.isArray(itemValues) ? itemValues.map(normalizeItem) : [],
  };
}

function resolveBaseUrl(options: LeadAssignmentBatchRequestOptions): string {
  const baseUrl = (
    options.baseUrl ??
    process.env.NEXT_PUBLIC_FRAPPE_URL ??
    ""
  ).replace(/\/+$/, "");
  if (!baseUrl) {
    throw new LeadAssignmentBatchApiError(
      0,
      "FRAPPE_URL_MISSING",
      "Chưa cấu hình địa chỉ Frappe CRM API.",
    );
  }
  return baseUrl;
}

function frappeCookieHeader(cookieHeader: string): string {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.split("=", 1)[0] === "sid")
    .join("; ");
}

async function requestHeaders(
  options: LeadAssignmentBatchRequestOptions,
  contentType = false,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers ?? {}),
  };
  if (contentType) headers["Content-Type"] = "application/json";
  if (options.idempotencyKey)
    headers["Idempotency-Key"] = options.idempotencyKey;

  if (!options.baseUrl && typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieHeader = frappeCookieHeader((await cookies()).toString());
      if (cookieHeader) headers.Cookie = cookieHeader;
    } catch {
      // API tests and non-request contexts do not have Next headers.
    }
  }

  if (typeof window !== "undefined" && contentType) {
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
        const sessionResponse = await fetch(
          `${resolveBaseUrl(options)}/api/method/crm.api.session.me`,
          { credentials: "include", headers: { Accept: "application/json" } },
        );
        const payload = (await sessionResponse.json().catch(() => null)) as {
          message?: { csrf_token?: unknown };
        } | null;
        if (typeof payload?.message?.csrf_token === "string") {
          headers["X-Frappe-CSRF-Token"] = payload.message.csrf_token;
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
      text(message?.code) ||
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
      `Không thể xử lý batch phân công (${status}).`,
  };
}

async function request(url: string, init: RequestInit): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      ...(typeof window !== "undefined"
        ? { credentials: "include" as RequestCredentials }
        : {}),
      cache: "no-store",
    });
  } catch {
    throw new LeadAssignmentBatchApiError(
      503,
      "LEAD_ASSIGNMENT_BATCH_UNAVAILABLE",
      "Không thể kết nối đến dịch vụ phân công Lead.",
    );
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = errorDetails(payload, response.status);
    throw new LeadAssignmentBatchApiError(
      response.status,
      details.code,
      details.message,
    );
  }
  return payload;
}

async function post(
  method: string,
  body: Record<string, unknown>,
  options: LeadAssignmentBatchRequestOptions,
): Promise<unknown> {
  return request(`${resolveBaseUrl(options)}/api/method/${method}`, {
    method: "POST",
    headers: await requestHeaders(options, true),
    body: JSON.stringify(body),
  });
}

export async function getLeadAssignmentCatalogs(
  params: LeadAssignmentBatchCatalogParams = {},
  options: LeadAssignmentBatchRequestOptions = {},
): Promise<LeadAssignmentCatalogs> {
  const query = new URLSearchParams();
  if (params.province) query.set("province", params.province);
  const payload = await request(
    `${resolveBaseUrl(options)}/api/method/${METHODS.catalogs}?${query.toString()}`,
    { method: "GET", headers: await requestHeaders(options) },
  );
  return normalizeCatalogs(payload);
}

export async function importLeadsToAssignmentBatch(
  requestBody: ImportLeadAssignmentBatchRequest,
  options: LeadAssignmentBatchRequestOptions = {},
): Promise<LeadAssignmentBatchMutationResponse> {
  const batchName = requestBody.batchName.trim();
  if (!batchName)
    throw new LeadAssignmentBatchApiError(
      400,
      "INVALID_PAYLOAD",
      "Tên batch là bắt buộc.",
    );
  const body: Record<string, unknown> = {
    batch_name: batchName,
    description: requestBody.description?.trim() || undefined,
    filename: requestBody.filename,
    csv_content: requestBody.csvContent,
    rows: requestBody.rows,
  };
  const payload = await post(METHODS.import, body, options);
  try {
    return normalizeMutation(payload);
  } catch {
    throw new LeadAssignmentBatchApiError(
      502,
      "INVALID_LEAD_ASSIGNMENT_BATCH_RESPONSE",
      "Phản hồi nhập Lead vào batch không hợp lệ.",
    );
  }
}

export async function createLeadAssignmentBatch(
  requestBody: CreateLeadAssignmentBatchRequest,
  options: LeadAssignmentBatchRequestOptions = {},
): Promise<LeadAssignmentBatchMutationResponse> {
  if (!requestBody.leadIds.length)
    throw new LeadAssignmentBatchApiError(
      400,
      "INVALID_PAYLOAD",
      "Batch phải có ít nhất một Lead.",
    );
  const payload = await post(
    METHODS.create,
    {
      batch_name: requestBody.batchName?.trim() || undefined,
      description: requestBody.description?.trim() || undefined,
      lead_ids: requestBody.leadIds,
    },
    options,
  );
  try {
    return normalizeMutation(payload);
  } catch {
    throw new LeadAssignmentBatchApiError(
      502,
      "INVALID_LEAD_ASSIGNMENT_BATCH_RESPONSE",
      "Phản hồi tạo batch không hợp lệ.",
    );
  }
}

export async function previewLeadAssignmentBatch(
  requestBody: LeadAssignmentBatchActionRequest,
  options: LeadAssignmentBatchRequestOptions = {},
): Promise<LeadAssignmentBatchMutationResponse> {
  const payload = await post(
    METHODS.preview,
    { batch_name: requestBody.batchId },
    options,
  );
  try {
    return normalizeMutation(payload);
  } catch {
    throw new LeadAssignmentBatchApiError(
      502,
      "INVALID_LEAD_ASSIGNMENT_BATCH_RESPONSE",
      "Phản hồi preview batch không hợp lệ.",
    );
  }
}

export async function runLeadAssignmentBatch(
  requestBody: LeadAssignmentBatchActionRequest,
  options: LeadAssignmentBatchRequestOptions = {},
): Promise<LeadAssignmentBatchMutationResponse> {
  const payload = await post(
    METHODS.run,
    { batch_name: requestBody.batchId },
    options,
  );
  try {
    return normalizeMutation(payload);
  } catch {
    throw new LeadAssignmentBatchApiError(
      502,
      "INVALID_LEAD_ASSIGNMENT_BATCH_RESPONSE",
      "Phản hồi chạy batch không hợp lệ.",
    );
  }
}

export async function runUnassignedLeadAssignment(
  options: LeadAssignmentBatchRequestOptions = {},
): Promise<LeadAssignmentAutoRunResponse> {
  const payload = await post(METHODS.runUnassigned, {}, options);
  const source = asRecord(unwrapMessage(payload));
  if (!source) {
    throw new LeadAssignmentBatchApiError(
      502,
      "INVALID_LEAD_ASSIGNMENT_BATCH_RESPONSE",
      "Phản hồi phân công tự động không hợp lệ.",
    );
  }

  if (source.status === "no_work" || source.batch === null) {
    return {
      status: "no_work",
      batch: null,
      items: [],
      scanned: count(source.scanned),
      message: nullableText(source.message),
    };
  }

  try {
    const normalized = normalizeMutation(payload);
    return {
      status: normalized.batch.status,
      batch: normalized.batch,
      items: normalized.items,
      scanned: count(source.scanned, normalized.batch.summary.total),
      message: nullableText(source.message),
    };
  } catch {
    throw new LeadAssignmentBatchApiError(
      502,
      "INVALID_LEAD_ASSIGNMENT_BATCH_RESPONSE",
      "Phản hồi phân công tự động không hợp lệ.",
    );
  }
}

export async function retryLeadAssignmentBatch(
  requestBody: RetryLeadAssignmentBatchRequest,
  options: LeadAssignmentBatchRequestOptions = {},
): Promise<LeadAssignmentBatchMutationResponse> {
  const payload = await post(
    METHODS.retry,
    {
      batch_name: requestBody.batchId,
      item_ids: requestBody.itemIds?.length ? requestBody.itemIds : undefined,
    },
    options,
  );
  try {
    return normalizeMutation(payload);
  } catch {
    throw new LeadAssignmentBatchApiError(
      502,
      "INVALID_LEAD_ASSIGNMENT_BATCH_RESPONSE",
      "Phản hồi retry batch không hợp lệ.",
    );
  }
}

export async function getLeadAssignmentBatch(
  batchId: string,
  options: LeadAssignmentBatchRequestOptions = {},
): Promise<LeadAssignmentBatchDetailResponse> {
  const normalizedBatchId = batchId.trim();
  if (!normalizedBatchId)
    throw new LeadAssignmentBatchApiError(
      400,
      "INVALID_QUERY",
      "batchId là bắt buộc.",
    );
  const query = new URLSearchParams({ batch_name: normalizedBatchId });
  const payload = await request(
    `${resolveBaseUrl(options)}/api/method/${METHODS.detail}?${query.toString()}`,
    { method: "GET", headers: await requestHeaders(options) },
  );
  try {
    return normalizeDetail(payload);
  } catch {
    throw new LeadAssignmentBatchApiError(
      502,
      "INVALID_LEAD_ASSIGNMENT_BATCH_RESPONSE",
      "Phản hồi chi tiết batch không hợp lệ.",
    );
  }
}

export async function listLeadAssignmentBatches(
  params: LeadAssignmentBatchListParams = {},
  options: LeadAssignmentBatchRequestOptions = {},
): Promise<LeadAssignmentBatchListResponse> {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    page_size: String(params.pageSize ?? 20),
  });
  if (params.status && params.status !== "all")
    query.set("status", params.status);
  if (params.q?.trim()) query.set("q", params.q.trim());
  const payload = await request(
    `${resolveBaseUrl(options)}/api/method/${METHODS.list}?${query.toString()}`,
    { method: "GET", headers: await requestHeaders(options) },
  );
  try {
    return normalizeList(payload);
  } catch {
    throw new LeadAssignmentBatchApiError(
      502,
      "INVALID_LEAD_ASSIGNMENT_BATCH_RESPONSE",
      "Phản hồi lịch sử batch không hợp lệ.",
    );
  }
}
