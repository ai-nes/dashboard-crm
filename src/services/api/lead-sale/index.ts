import { NestApiError, nestRequest } from "../nest/nest-client";
import type {
  LeadSaleDashboardAgingBucket,
  LeadSaleDashboardPayload,
  LeadSaleIntervention,
  LeadSaleInterventionId,
  LeadSaleKpi,
  LeadSaleOverviewMeta,
  LeadSaleOverviewParams,
  LeadSaleOverviewResponse,
  LeadSaleResultTrend,
  LeadSaleStudentStatus,
  LeadSaleStudentStatusId,
  LeadSaleTeamMember,
  LeadSaleTeamMemberStatus,
  LeadSaleTrendPoint,
  LeadSaleTrendRangeData,
} from "./types";

export type * from "./types";
export * from "./leads";
export * from "./campaigns";
export * from "./campaign-channel-types";
export * from "./student-assignment";
export * from "./team-management";
export * from "./lead-assignment-batch";
export * from "./lead-routing-policy";
export * from "./lead-assignment-workflow-config";

const KPI_IDS = [
  "active",
  "new",
  "unassigned",
  "needs-action",
  "overdue",
  "documents",
] as const;
const INTERVENTION_IDS = [
  "unassigned",
  "not-contacted",
  "at-risk",
  "blocked",
] as const;
const TEAM_STATUS_IDS = ["on-track", "needs-support"] as const;
const STUDENT_STATUS_IDS = [
  "new",
  "attempting",
  "connected",
  "qualified",
  "disqualified",
] as const;
const DASHBOARD_STAGE_IDS = [
  "new",
  "attempting",
  "connected",
  "qualified",
] as const;
const DASHBOARD_ACTION_IDS = [
  "overdue",
  "unassigned",
  "due-today",
  "aging",
] as const;
const DASHBOARD_ISSUE_IDS = [
  "overdue",
  "missing-documents",
  "uncontacted",
  "aging",
] as const;

export class LeadSaleOverviewApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "LeadSaleOverviewApiError";
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

function nullableNumber(value: unknown): number | null {
  return value === null || value === undefined ? null : number(value);
}

function nullableCount(value: unknown): number | null {
  const normalized = nullableNumber(value);
  return normalized === null ? null : Math.max(0, Math.floor(normalized));
}

function unwrapMessage(value: unknown): unknown {
  const root = asRecord(value);
  return root?.message !== undefined ? root.message : value;
}

function normalizeMeta(value: unknown): LeadSaleOverviewMeta {
  const source = asRecord(value) ?? {};
  const viewer = asRecord(source.viewer) ?? {};
  const team = asRecord(source.team) ?? {};
  const status = source.status;
  return {
    viewer: {
      id: text(viewer.id),
      displayName: text(viewer.displayName ?? viewer.display_name),
    },
    team: {
      id: text(team.id),
      name: text(team.name),
    },
    admissionYear: count(source.admissionYear ?? source.admission_year),
    date: text(source.date),
    asOf: text(source.asOf ?? source.as_of),
    timezone: text(source.timezone, "Asia/Ho_Chi_Minh"),
    status:
      status === "partial" || status === "unavailable" ? status : "available",
    warnings: Array.isArray(source.warnings)
      ? source.warnings.filter(
          (item): item is string => typeof item === "string",
        )
      : [],
  };
}

function normalizeKpi(value: unknown): LeadSaleKpi {
  const source = asRecord(value) ?? {};
  const id = KPI_IDS.includes(source.id as (typeof KPI_IDS)[number])
    ? (source.id as LeadSaleKpi["id"])
    : "active";
  return { id, value: count(source.value) };
}

function normalizeInterventions(value: unknown): {
  items: LeadSaleIntervention[];
} {
  const source = asRecord(value) ?? {};
  return {
    items: Array.isArray(source.items)
      ? source.items.map((item): LeadSaleIntervention => {
          const row = asRecord(item) ?? {};
          const id = INTERVENTION_IDS.includes(row.id as LeadSaleInterventionId)
            ? (row.id as LeadSaleInterventionId)
            : "blocked";
          return { id, count: count(row.count) };
        })
      : [],
  };
}

function normalizeTeamPerformance(value: unknown): {
  items: LeadSaleTeamMember[];
} {
  const source = asRecord(value) ?? {};
  return {
    items: Array.isArray(source.items)
      ? source.items.map((item): LeadSaleTeamMember => {
          const row = asRecord(item) ?? {};
          const status = TEAM_STATUS_IDS.includes(
            row.status as LeadSaleTeamMemberStatus,
          )
            ? (row.status as LeadSaleTeamMemberStatus)
            : "needs-support";
          return {
            id: text(row.id),
            displayName: text(row.displayName ?? row.display_name),
            activeStudents: count(row.activeStudents ?? row.active_students),
            consulted: count(row.consulted),
            admitted: count(row.admitted),
            status,
          };
        })
      : [],
  };
}

function normalizeStudentStatus(value: unknown): LeadSaleStudentStatus {
  const source = asRecord(value) ?? {};
  return {
    total: count(source.total),
    items: Array.isArray(source.items)
      ? source.items.map((item): LeadSaleStudentStatus["items"][number] => {
          const row = asRecord(item) ?? {};
          const id = STUDENT_STATUS_IDS.includes(
            row.id as LeadSaleStudentStatusId,
          )
            ? (row.id as LeadSaleStudentStatusId)
            : "new";
          const share = row.share;
          return {
            id,
            label: text(row.label),
            count: count(row.count),
            share:
              share === null || share === undefined ? null : number(share, 0),
          };
        })
      : [],
  };
}

function normalizeTrendPoint(value: unknown): LeadSaleTrendPoint {
  const source = asRecord(value) ?? {};
  return {
    label: text(source.label),
    periodStart: text(source.periodStart ?? source.period_start),
    periodEnd: text(source.periodEnd ?? source.period_end),
    consulted: count(source.consulted),
    admitted: count(source.admitted),
  };
}

function normalizeTrendRange(value: unknown): LeadSaleTrendRangeData {
  const source = asRecord(value) ?? {};
  return {
    from: text(source.from),
    to: text(source.to),
    points: Array.isArray(source.points)
      ? source.points.map(normalizeTrendPoint)
      : [],
  };
}

function normalizeTrend(value: unknown): LeadSaleResultTrend {
  const source = asRecord(value) ?? {};
  const ranges = asRecord(source.ranges) ?? {};
  return {
    defaultRange: source.defaultRange === "3m" ? "3m" : "4w",
    ranges: {
      "4w": normalizeTrendRange(ranges["4w"]),
      "3m": normalizeTrendRange(ranges["3m"]),
    },
  };
}

function normalizeDashboard(value: unknown): LeadSaleDashboardPayload {
  const source = asRecord(value);
  if (!source) throw new Error("Invalid Lead Sale dashboard response");
  const summary = asRecord(source.summary) ?? {};
  const stages = Array.isArray(source.stages)
    ? source.stages.map((item) => {
        const row = asRecord(item) ?? {};
        const id = DASHBOARD_STAGE_IDS.includes(
          row.id as (typeof DASHBOARD_STAGE_IDS)[number],
        )
          ? (row.id as (typeof DASHBOARD_STAGE_IDS)[number])
          : "new";
        return {
          id,
          label: text(row.label, id),
          volume: count(row.volume),
          nextStepConversion:
            row.nextStepConversion === null ||
            row.nextStepConversion === undefined
              ? null
              : Math.min(100, Math.max(0, number(row.nextStepConversion))),
          averageDays: number(row.averageDays),
          actionItemCount: count(row.actionItemCount ?? row.action_item_count),
        };
      })
    : [];
  const trend = Array.isArray(source.trend)
    ? source.trend.map((item) => {
        const row = asRecord(item) ?? {};
        const stageCounts = asRecord(row.stageCounts ?? row.stage_counts) ?? {};
        return {
          period: text(row.period),
          stageCounts: Object.fromEntries(
            DASHBOARD_STAGE_IDS.map((stage) => [
              stage,
              count(stageCounts[stage]),
            ]),
          ) as Record<(typeof DASHBOARD_STAGE_IDS)[number], number>,
        };
      })
    : [];
  const reps = Array.isArray(source.reps)
    ? source.reps.map((item) => {
        const row = asRecord(item) ?? {};
        const pipeline = asRecord(row.pipeline) ?? {};
        const numberMap = (input: unknown): Record<string, number> => {
          const record = asRecord(input) ?? {};
          return Object.fromEntries(
            Object.entries(record).map(([key, value]) => [key, count(value)]),
          );
        };
        const repTrend = Array.isArray(pipeline.trend)
          ? pipeline.trend.map((point) => {
              const trendPoint = asRecord(point) ?? {};
              const stageCounts =
                asRecord(trendPoint.stageCounts ?? trendPoint.stage_counts) ??
                {};
              return {
                period: text(trendPoint.period),
                stageCounts: Object.fromEntries(
                  DASHBOARD_STAGE_IDS.map((stage) => [
                    stage,
                    count(stageCounts[stage]),
                  ]),
                ) as Record<(typeof DASHBOARD_STAGE_IDS)[number], number>,
              };
            })
          : [];
        return {
          id: text(row.id),
          displayName: text(row.displayName ?? row.display_name),
          target: nullableCount(row.target),
          enrollment: count(row.enrollment),
          achievement: nullableCount(row.achievement),
          remaining: nullableCount(row.remaining),
          expected: count(row.expected),
          coverage: nullableNumber(row.coverage),
          winRate: count(row.winRate ?? row.win_rate),
          closedOpportunities: count(
            row.closedOpportunities ?? row.closed_opportunities,
          ),
          wonOpportunities: count(
            row.wonOpportunities ?? row.won_opportunities,
          ),
          openOpportunities: count(
            row.openOpportunities ?? row.open_opportunities,
          ),
          overdue: count(row.overdue),
          avgStageAgeDays: number(
            row.avgStageAgeDays ?? row.avg_stage_age_days,
          ),
          actionItemCount: count(row.actionItemCount ?? row.action_item_count),
          pipeline: {
            newOpportunities: count(
              pipeline.newOpportunities ?? pipeline.new_opportunities,
            ),
            followUpDue: count(pipeline.followUpDue ?? pipeline.follow_up_due),
            stageVolumes: numberMap(
              pipeline.stageVolumes ?? pipeline.stage_volumes,
            ),
            stageActionItemCounts: numberMap(
              pipeline.stageActionItemCounts ??
                pipeline.stage_action_item_counts,
            ),
            agingBuckets: numberMap(
              pipeline.agingBuckets ?? pipeline.aging_buckets,
            ),
            trend: repTrend,
          },
        };
      })
    : [];
  const priorityQueue = Array.isArray(source.priorityQueue)
    ? source.priorityQueue.map((item) => {
        const row = asRecord(item) ?? {};
        const stageId = DASHBOARD_STAGE_IDS.includes(
          row.stageId as (typeof DASHBOARD_STAGE_IDS)[number],
        )
          ? (row.stageId as (typeof DASHBOARD_STAGE_IDS)[number])
          : "new";
        const issueCode = DASHBOARD_ISSUE_IDS.includes(
          row.issueCode as (typeof DASHBOARD_ISSUE_IDS)[number],
        )
          ? (row.issueCode as (typeof DASHBOARD_ISSUE_IDS)[number])
          : "aging";
        return {
          id: text(row.id),
          name: text(row.name, "Hồ sơ chưa đặt tên"),
          owner: text(row.owner, "Chưa phân công"),
          stageId,
          stageLabel: text(row.stageLabel, stageId),
          issueCode,
          ageDays: count(row.ageDays ?? row.age_days),
          nextAction: text(row.nextAction ?? row.next_action),
          lastActivityAt: text(row.lastActivityAt ?? row.last_activity_at),
        };
      })
    : [];
  const actions = Array.isArray(source.actions)
    ? source.actions.map((item) => {
        const row = asRecord(item) ?? {};
        const id = DASHBOARD_ACTION_IDS.includes(
          row.id as (typeof DASHBOARD_ACTION_IDS)[number],
        )
          ? (row.id as (typeof DASHBOARD_ACTION_IDS)[number])
          : "aging";
        return {
          id,
          value: count(row.value),
          longestAgeDays: count(row.longestAgeDays ?? row.longest_age_days),
        };
      })
    : [];
  const agingBuckets = Array.isArray(source.agingBuckets)
    ? source.agingBuckets.map((item) => {
        const row = asRecord(item) ?? {};
        const id: LeadSaleDashboardAgingBucket["id"] =
          row.id === "3-5-days" ||
          row.id === "6-10-days" ||
          row.id === "over-10-days"
            ? row.id
            : "0-2-days";
        return { id, count: count(row.count) };
      })
    : [];

  return {
    summary: {
      enrollment: count(summary.enrollment),
      target: nullableCount(summary.target),
      achievement: nullableCount(summary.achievement),
      remaining: nullableCount(summary.remaining),
      expected: count(summary.expected),
      coverage: nullableNumber(summary.coverage),
      openOpportunities: count(
        summary.openOpportunities ?? summary.open_opportunities,
      ),
      newOpportunities: count(
        summary.newOpportunities ?? summary.new_opportunities,
      ),
      winRate: count(summary.winRate ?? summary.win_rate),
      followUpDue: count(summary.followUpDue ?? summary.follow_up_due),
      overdue: count(summary.overdue),
      actionRequired: count(summary.actionRequired ?? summary.action_required),
    },
    actions,
    priorityQueue,
    stages,
    reps,
    trend,
    agingBuckets,
    status:
      source.status === "partial" || source.status === "unavailable"
        ? source.status
        : "available",
  };
}

export function normalizeLeadSaleOverview(
  value: unknown,
): LeadSaleOverviewResponse {
  const payload = asRecord(unwrapMessage(value));
  const meta = asRecord(payload?.meta);
  const interventions = asRecord(payload?.interventions);
  const teamPerformance = asRecord(
    payload?.teamPerformance ?? payload?.team_performance,
  );
  const studentStatus = asRecord(
    payload?.studentStatus ?? payload?.student_status,
  );
  const resultTrend = asRecord(payload?.resultTrend ?? payload?.result_trend);
  const trendRanges = asRecord(resultTrend?.ranges);

  if (
    !payload ||
    !meta ||
    !asRecord(meta.team) ||
    !Array.isArray(payload.kpis) ||
    !interventions ||
    !Array.isArray(interventions.items) ||
    !teamPerformance ||
    !Array.isArray(teamPerformance.items) ||
    !studentStatus ||
    !Array.isArray(studentStatus.items) ||
    !resultTrend ||
    !trendRanges ||
    !asRecord(trendRanges["4w"]) ||
    !asRecord(trendRanges["3m"])
  ) {
    throw new Error("Invalid Lead Sale overview response");
  }

  const dashboard = normalizeDashboard(payload.dashboard);
  const result: LeadSaleOverviewResponse = {
    meta: normalizeMeta(meta),
    kpis: payload.kpis.map(normalizeKpi),
    interventions: normalizeInterventions(interventions),
    teamPerformance: normalizeTeamPerformance(teamPerformance),
    studentStatus: normalizeStudentStatus(studentStatus),
    resultTrend: normalizeTrend(resultTrend),
    dashboard,
  };

  const kpiIds = new Set(result.kpis.map((item) => item.id));
  const interventionIds = new Set(
    result.interventions.items.map((item) => item.id),
  );
  const statusIds = new Set(result.studentStatus.items.map((item) => item.id));
  if (
    result.kpis.length !== KPI_IDS.length ||
    !KPI_IDS.every((id) => kpiIds.has(id)) ||
    result.interventions.items.length !== INTERVENTION_IDS.length ||
    !INTERVENTION_IDS.every((id) => interventionIds.has(id)) ||
    result.studentStatus.items.length !== STUDENT_STATUS_IDS.length ||
    !STUDENT_STATUS_IDS.every((id) => statusIds.has(id)) ||
    result.studentStatus.items.reduce(
      (total, item) => total + item.count,
      0,
    ) !== result.studentStatus.total ||
    result.studentStatus.total !==
      result.kpis.find((item) => item.id === "active")?.value
  ) {
    throw new Error("Incomplete Lead Sale overview response");
  }
  return result;
}

export async function getLeadSaleOverview(
  params: LeadSaleOverviewParams = {},
): Promise<LeadSaleOverviewResponse> {
  let payload: unknown;
  try {
    payload = await nestRequest<unknown>("/api/v1/lead-sale/overview", {
      query: {
        admissionYear: params.admissionYear,
        date: params.date,
        trendRange: params.trendRange ?? "4w",
        timezone: params.timezone,
        teamMemberLimit: params.teamMemberLimit ?? 20,
      },
    });
  } catch (error) {
    if (error instanceof NestApiError) {
      throw new LeadSaleOverviewApiError(
        error.status,
        error.code,
        error.message,
      );
    }
    throw new LeadSaleOverviewApiError(
      503,
      "LEAD_SALE_OVERVIEW_UNAVAILABLE",
      "Không thể kết nối đến máy chủ tổng quan Lead Sale.",
    );
  }
  try {
    return normalizeLeadSaleOverview(payload);
  } catch {
    throw new LeadSaleOverviewApiError(
      502,
      "INVALID_LEAD_SALE_OVERVIEW_RESPONSE",
      "Phản hồi tổng quan Lead Sale không hợp lệ.",
    );
  }
}
