import type {
  SaleConversionTrend,
  SaleConversionTrendPoint,
  SaleConversionTrendRange,
  SaleOverviewMeta,
  SaleOverviewParams,
  SaleOverviewResponse,
  SalePipelineHealth,
  SalePipelineAgingBucket,
  SaleRecentLead,
  SaleRecentStudent,
  SaleStudentAction,
  SaleStudentActionNba,
  SaleStudentStages,
  SaleTask,
  SaleTasks,
} from "./types";
import type { StudentStage } from "@/services/api/students/types";

export type * from "./types";

const METHOD = "crm.api.sale.get_sale_overview";
const STUDENT_STAGE_IDS = ["New", "Attempting", "Connected", "Qualified", "Disqualified"] as const;
const NBA_PRIORITIES = ["high", "medium", "low"] as const;
const LEAD_PROCESSING_STATUSES = [
  "NEW",
  "PROCESSING",
  "PROCESSED",
  "ASSIGNED",
  "CLOSED",
] as const;
const LEAD_PROCESSING_RESOLUTIONS = [
  "PENDING",
  "MATCHED",
  "CREATED",
  "DUPLICATE",
  "INVALID",
  "SPAM",
  "FAILED",
] as const;

export type RequestOptions = {
  baseUrl?: string;
  headers?: Record<string, string>;
};

export class SaleOverviewApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "SaleOverviewApiError";
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

function number(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function count(value: unknown): number {
  return Math.max(0, Math.floor(number(value)));
}

function nullableCount(value: unknown): number | null {
  return value === null || value === undefined ? null : count(value);
}

function nullableText(value: unknown): string | null {
  return value === null || value === undefined || value === "" ? null : text(value);
}

function unwrapMessage(value: unknown): unknown {
  const root = asRecord(value);
  return root?.message !== undefined ? root.message : value;
}

function normalizeMeta(value: unknown): SaleOverviewMeta {
  const source = asRecord(value) ?? {};
  const viewer = asRecord(source.viewer) ?? {};
  const status = source.status;
  return {
    viewer: {
      id: text(viewer.id),
      displayName: text(viewer.displayName ?? viewer.display_name),
    },
    admissionYear: count(source.admissionYear ?? source.admission_year),
    date: text(source.date),
    asOf: text(source.asOf ?? source.as_of),
    timezone: text(source.timezone, "Asia/Ho_Chi_Minh"),
    status:
      status === "partial" || status === "unavailable" ? status : "available",
    warnings: Array.isArray(source.warnings)
      ? source.warnings.filter((item): item is string => typeof item === "string")
      : [],
  };
}

function normalizeTask(value: unknown): SaleTask {
  const source = asRecord(value) ?? {};
  const type = source.type;
  const priority = source.priority;
  const status = source.status;
  return {
    id: text(source.id),
    studentId: text(source.studentId ?? source.student_id),
    studentName: text(source.studentName ?? source.student_name, "Hồ sơ chưa đặt tên"),
    title: text(source.title),
    type:
      type === "call" || type === "document" || type === "message" ? type : "other",
    startAt: nullableText(source.startAt ?? source.start_at),
    dueAt: nullableText(source.dueAt ?? source.due_at),
    context: nullableText(source.context),
    priority:
      priority === "High" || priority === "Low" ? priority : "Medium",
    status:
      status === "Backlog" ||
      status === "In Progress" ||
      status === "Done" ||
      status === "Canceled"
        ? status
        : "Todo",
    isOverdue: source.isOverdue === true || source.is_overdue === true,
  };
}

function normalizeTasks(value: unknown): SaleTasks {
  const source = asRecord(value) ?? {};
  const priority = asRecord(source.priority) ?? {};
  const summary = asRecord(source.summary) ?? {};
  const today = asRecord(summary.today) ?? {};
  const overdue = asRecord(summary.overdue) ?? {};
  const upcoming = asRecord(summary.upcoming) ?? {};
  return {
    priority: {
      overdueCount: count(priority.overdueCount ?? priority.overdue_count),
      items: Array.isArray(priority.items) ? priority.items.map(normalizeTask) : [],
    },
    summary: {
      today: {
        total: count(today.total),
        pending: count(today.pending),
        completed: count(today.completed),
      },
      overdue: { count: count(overdue.count) },
      upcoming: {
        count: count(upcoming.count),
        horizonDays: count(upcoming.horizonDays ?? upcoming.horizon_days) || 7,
      },
    },
  };
}

function normalizeTrendPoint(value: unknown): SaleConversionTrendPoint {
  const source = asRecord(value) ?? {};
  return {
    label: text(source.label),
    periodStart: text(source.periodStart ?? source.period_start),
    periodEnd: text(source.periodEnd ?? source.period_end),
    consulted: count(source.consulted),
  };
}

function normalizeTrendRange(value: unknown): SaleConversionTrendRange {
  const source = asRecord(value) ?? {};
  return {
    from: text(source.from),
    to: text(source.to),
    points: Array.isArray(source.points) ? source.points.map(normalizeTrendPoint) : [],
  };
}

function normalizeTrend(value: unknown): SaleConversionTrend {
  const source = asRecord(value) ?? {};
  const ranges = asRecord(source.ranges) ?? {};
  return {
    defaultRange: source.defaultRange === "12w" ? "12w" : "4w",
    ranges: {
      "4w": normalizeTrendRange(ranges["4w"]),
      "12w": normalizeTrendRange(ranges["12w"]),
    },
  };
}

function normalizeStudentStages(value: unknown): SaleStudentStages | undefined {
  const source = asRecord(value);
  if (!source || !Array.isArray(source.items)) return undefined;

  const items = source.items.flatMap((item) => {
    const row = asRecord(item) ?? {};
    const stageValue = row.stage ?? row.id;
    if (!STUDENT_STAGE_IDS.includes(stageValue as (typeof STUDENT_STAGE_IDS)[number])) {
      return [];
    }

    return [{
      stage: stageValue as StudentStage,
      count: count(row.count),
      share: null,
    }];
  });
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return {
    total,
    items: items.map((item) => ({
      ...item,
      share: total > 0 ? (item.count / total) * 100 : null,
    })),
  };
}

function normalizeStudentActionNba(value: unknown): SaleStudentActionNba | undefined {
  const source = asRecord(value);
  if (!source) return undefined;

  const action = asRecord(source.action) ?? {};
  const recommendation = asRecord(source.recommendation) ?? {};
  const recommendationAction = asRecord(recommendation.action) ?? {};
  const explanation = asRecord(source.explanation) ?? asRecord(recommendation.explanation) ?? {};
  const timing = asRecord(source.timing) ?? asRecord(recommendation.timing) ?? {};
  const priority = source.priority ?? recommendation.priority;
  const title = text(source.title ?? action.title ?? recommendationAction.title);
  const actionCode = text(
    source.actionCode ?? source.action_code ?? source.actionId ?? source.action_id ??
      action.code ?? recommendation.actionId ?? recommendation.action_id,
  );

  if (
    !title ||
    !actionCode ||
    !NBA_PRIORITIES.includes(priority as (typeof NBA_PRIORITIES)[number])
  ) {
    return undefined;
  }

  return {
    actionCode,
    title,
    priority: priority as SaleStudentActionNba["priority"],
    channel: nullableText(source.channel ?? recommendation.channel),
    reason: nullableText(source.reason ?? recommendation.reason),
    whyNow: nullableText(source.whyNow ?? source.why_now ?? explanation.whyNow ?? explanation.why_now),
    salesNextStep: nullableText(
      source.salesNextStep ?? source.sales_next_step ?? explanation.salesNextStep ?? explanation.sales_next_step,
    ),
    scheduledAt: nullableText(
      source.scheduledAt ?? source.scheduled_at ?? timing.scheduledAt ?? timing.scheduled_at,
    ),
  };
}

function normalizeStudentAction(value: unknown): SaleStudentAction | null {
  const source = asRecord(value) ?? {};
  const stageValue = source.studentStage ?? source.student_stage ?? source.stage;
  if (!STUDENT_STAGE_IDS.includes(stageValue as (typeof STUDENT_STAGE_IDS)[number])) {
    return null;
  }

  const studentId = text(source.studentId ?? source.student_id);
  const studentCode = text(source.studentCode ?? source.student_code ?? source.code);
  const studentName = text(source.studentName ?? source.student_name ?? source.name);
  if (!studentId || !studentCode || !studentName) return null;

  const nba = normalizeStudentActionNba(source.nba);

  return {
    studentId,
    studentCode,
    studentName,
    studentStage: stageValue as StudentStage,
    stageAgeDays: nullableCount(source.stageAgeDays ?? source.stage_age_days),
    lastActivityAt: nullableText(source.lastActivityAt ?? source.last_activity_at),
    attentionReason: nullableText(source.attentionReason ?? source.attention_reason),
    ...(nba ? { nba } : {}),
  };
}

function normalizeStudentActions(value: unknown): SaleStudentAction[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value
    .map(normalizeStudentAction)
    .filter((item): item is SaleStudentAction => item !== null);
}

function normalizeRecentLead(value: unknown): SaleRecentLead | null {
  const source = asRecord(value);
  if (!source) return null;

  const processingStatus = source.processingStatus ?? source.processing_status;
  const resolution = source.resolution;
  return {
    id: text(source.id ?? source.name),
    leadCode: text(source.leadCode ?? source.lead_code ?? source.id ?? source.name),
    name: text(source.name, "Lead chưa đặt tên"),
    phone: nullableText(source.phone),
    school: nullableText(source.school ?? source.high_school),
    processingStatus: LEAD_PROCESSING_STATUSES.includes(
      processingStatus as (typeof LEAD_PROCESSING_STATUSES)[number],
    )
      ? (processingStatus as SaleRecentLead["processingStatus"])
      : "NEW",
    resolution: LEAD_PROCESSING_RESOLUTIONS.includes(
      resolution as (typeof LEAD_PROCESSING_RESOLUTIONS)[number],
    )
      ? (resolution as SaleRecentLead["resolution"])
      : "PENDING",
    source: text(source.source, "Chưa cập nhật"),
    createdAt: text(source.createdAt ?? source.created_at),
    contactNoAnswer: count(source.contactNoAnswer ?? source.contact_no_answer),
    contactSuccess: count(source.contactSuccess ?? source.contact_success),
    nextAction: text(source.nextAction ?? source.next_action),
  };
}

function normalizeRecentLeads(value: unknown): SaleRecentLead[] {
  return Array.isArray(value)
    ? value
        .map(normalizeRecentLead)
        .filter((item): item is SaleRecentLead => item !== null)
    : [];
}

function normalizeRecentStudent(value: unknown): SaleRecentStudent | null {
  const source = asRecord(value) ?? {};
  const student = normalizeStudentAction(source.student);
  if (!student) return null;
  return {
    student,
    school: text(source.school),
    major: text(source.major),
    source: text(source.source),
    latestActivity: text(source.latestActivity ?? source.latest_activity),
  };
}

function normalizeRecentStudents(value: unknown): SaleRecentStudent[] {
  return Array.isArray(value)
    ? value
        .map(normalizeRecentStudent)
        .filter((item): item is SaleRecentStudent => item !== null)
    : [];
}

function normalizeHealth(value: unknown): SalePipelineHealth | undefined {
  const source = asRecord(value);
  if (!source) return undefined;
  const agingBuckets = Array.isArray(source.agingBuckets ?? source.aging_buckets)
    ? (source.agingBuckets ?? source.aging_buckets) as unknown[]
    : [];

  return {
    followUpDue: count(source.followUpDue ?? source.follow_up_due),
    overdue: count(source.overdue),
    noActivity: count(source.noActivity ?? source.no_activity),
    agingBuckets: agingBuckets.map((item): SalePipelineAgingBucket => {
      const row = asRecord(item) ?? {};
      return {
        id: text(row.id),
        label: text(row.label),
        count: count(row.count),
      };
    }),
  };
}

export function normalizeSaleOverview(value: unknown): SaleOverviewResponse {
  const payload = asRecord(unwrapMessage(value));
  const meta = asRecord(payload?.meta);
  const tasks = asRecord(payload?.tasks);
  const priority = asRecord(tasks?.priority);
  const summary = asRecord(tasks?.summary);
  const conversionTrend = asRecord(payload?.conversionTrend ?? payload?.conversion_trend);
  const trendRanges = asRecord(conversionTrend?.ranges);
  const recentLeads = normalizeRecentLeads(payload?.recentLeads ?? payload?.recent_leads);
  const recentStudents = normalizeRecentStudents(
    payload?.recentStudents ?? payload?.recent_students,
  );
  const studentStages = normalizeStudentStages(payload?.studentStages ?? payload?.student_stages);
  const studentActions = normalizeStudentActions(payload?.studentActions ?? payload?.student_actions);
  const health = normalizeHealth(payload?.health);

  if (
    !payload ||
    !meta ||
    !tasks ||
    !priority ||
    !summary ||
    !Array.isArray(priority.items) ||
    !conversionTrend ||
    !trendRanges ||
    !asRecord(trendRanges["4w"]) ||
    !asRecord(trendRanges["12w"]) ||
    !studentStages ||
    !studentActions ||
    !health
  ) {
    throw new Error("Invalid Sale overview response");
  }

  const result: SaleOverviewResponse = {
    meta: normalizeMeta(meta),
    tasks: normalizeTasks(tasks),
    conversionTrend: normalizeTrend(conversionTrend),
    recentLeads,
    recentStudents,
    studentStages,
    studentActions,
    health,
  };
  return result;
}

function resolveBaseUrl(options: RequestOptions): string {
  const baseUrl = (
    options.baseUrl ?? process.env.NEXT_PUBLIC_FRAPPE_URL ?? ""
  ).replace(/\/+$/, "");
  if (!baseUrl) {
    throw new SaleOverviewApiError(
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
  options: RequestOptions,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers ?? {}),
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
  return headers;
}

function errorDetails(
  payload: unknown,
  status: number,
): { code: string; message: string } {
  const root = asRecord(payload);
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
      `Không thể tải tổng quan Sale (${status}).`,
  };
}

export async function getSaleOverview(
  params: SaleOverviewParams = {},
  options: RequestOptions = {},
): Promise<SaleOverviewResponse> {
  const url = new URL(`${resolveBaseUrl(options)}/api/method/${METHOD}`);
  if (params.admissionYear) {
    url.searchParams.set("admissionYear", String(params.admissionYear));
  }
  if (params.date) url.searchParams.set("date", params.date);
  url.searchParams.set("trendRange", params.trendRange ?? "4w");
  if (params.timezone) url.searchParams.set("timezone", params.timezone);
  url.searchParams.set("priorityLimit", String(params.priorityLimit ?? 4));

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: "GET",
      headers: await requestHeaders(options),
      ...(typeof window !== "undefined"
        ? { credentials: "include" as RequestCredentials }
        : {}),
      cache: "no-store",
    });
  } catch {
    throw new SaleOverviewApiError(
      503,
      "SALE_OVERVIEW_UNAVAILABLE",
      "Không thể kết nối đến máy chủ tổng quan Sale.",
    );
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = errorDetails(payload, response.status);
    throw new SaleOverviewApiError(response.status, error.code, error.message);
  }

  try {
    return normalizeSaleOverview(payload);
  } catch {
    throw new SaleOverviewApiError(
      502,
      "INVALID_SALE_OVERVIEW_RESPONSE",
      "Phản hồi tổng quan Sale không hợp lệ.",
    );
  }
}
