import type {
  LeadSaleDashboardDetailRecord,
  LeadSaleDashboardPayload,
  LeadSaleDashboardPriorityRecord,
  LeadSaleDashboardStage,
  LeadSaleOverviewResponse,
} from "@/services/api/lead-sale";

import {
  DEFAULT_LEAD_SALE_FILTERS,
  type LeadSaleAction,
  type LeadSaleAgingBucket,
  type LeadSaleDashboardFilters,
  type LeadSaleDashboardData,
  type LeadSaleDetail,
  type LeadSaleDetailId,
  type LeadSaleDetailRecord,
  type LeadSaleQueueRecord,
  type LeadSaleRepPerformance,
  type LeadSaleStageAnalysis,
  type LeadSaleTone,
  type LeadSaleTrendPoint,
} from "./lead-sale-dashboard.types";

const STAGE_DETAIL_IDS: Record<LeadSaleDashboardStage["id"], LeadSaleDetailId> =
  {
    new: "stage-new",
    attempting: "stage-attempting",
    connected: "stage-connected",
    qualified: "stage-qualified",
  };

const REP_DETAIL_IDS: LeadSaleDetailId[] = [
  "rep-a",
  "rep-b",
  "rep-c",
  "rep-d",
  "rep-e",
];

const AGING_DETAIL_IDS: Record<string, LeadSaleDetailId> = {
  "0-2-days": "aging-0-2",
  "3-5-days": "aging-3-5",
  "6-10-days": "aging-6-10",
  "over-10-days": "aging-over-10",
};

const RECORD_DETAIL_IDS: LeadSaleDetailId[] = [
  "record-minh-khoi",
  "record-thao-nguyen",
  "record-gia-han",
];

const ACTION_DETAIL_IDS: Record<string, LeadSaleDetailId> = {
  overdue: "overdue",
  unassigned: "unassigned",
  "due-today": "due-today",
  aging: "aging",
};

const STAGE_TONES: Record<LeadSaleDashboardStage["id"], LeadSaleTone> = {
  new: "primary",
  attempting: "warning",
  connected: "violet",
  qualified: "success",
};

const ISSUE_TONES: Record<string, LeadSaleTone> = {
  overdue: "danger",
  "missing-documents": "violet",
  uncontacted: "warning",
  aging: "warning",
};

const DETAIL_IDS: LeadSaleDetailId[] = [
  "enrollment",
  "forecast",
  "overdue",
  "unassigned",
  "due-today",
  "aging",
  "stage-new",
  "stage-attempting",
  "stage-connected",
  "stage-qualified",
  "aging-0-2",
  "aging-3-5",
  "aging-6-10",
  "aging-over-10",
  "rep-a",
  "rep-b",
  "rep-c",
  "rep-d",
  "rep-e",
  "record-minh-khoi",
  "record-thao-nguyen",
  "record-gia-han",
];

function initials(value: string): string {
  const words = value.trim().split(/\s+/).filter(Boolean);
  return (
    words
      .slice(-2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("") || "–"
  );
}

function formatAge(days: number): string {
  return days === 1 ? "1 ngày" : `${days} ngày`;
}

function formatMetric(value: number | null, suffix = ""): string {
  return value === null ? "N/A" : `${value}${suffix}`;
}

function formatCoverage(value: number | null): string {
  return value === null ? "N/A" : `${value.toFixed(2).replace(".", ",")}x`;
}

function formatActivity(value: string): string {
  if (!value) return "Chưa ghi nhận hoạt động";
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function issueLabel(code: string | null): string {
  return (
    {
      overdue: "Quá hạn xử lý",
      "missing-documents": "Thiếu giấy tờ",
      uncontacted: "Chưa có tương tác",
      aging: "Tồn lâu, cần cập nhật",
    }[code ?? ""] ?? "Đang xử lý"
  );
}

function toDetailRecord(
  row: LeadSaleDashboardPriorityRecord | LeadSaleDashboardDetailRecord,
  tone?: LeadSaleTone,
): LeadSaleDetailRecord {
  const isEnrolled = "recordType" in row && row.recordType === "enrolled";
  return {
    id: row.id,
    name: row.name,
    initials: initials(row.name),
    owner: row.owner,
    stage: row.stageLabel,
    issue: isEnrolled ? "Đã nhập học" : issueLabel(row.issueCode),
    age: formatAge(row.ageDays),
    lastActivity: formatActivity(row.lastActivityAt),
    nextAction: row.nextAction,
    tone:
      tone ??
      (isEnrolled
        ? "success"
        : (ISSUE_TONES[row.issueCode ?? ""] ?? "primary")),
  };
}

function recordsFromDetails(
  detailRecords: LeadSaleDashboardDetailRecord[] | null,
  fallback: LeadSaleDetailRecord[],
  predicate: (record: LeadSaleDashboardDetailRecord) => boolean,
) {
  return detailRecords
    ? detailRecords.filter(predicate).map((record) => toDetailRecord(record))
    : fallback;
}

function recordsForAction(
  actionId: LeadSaleAction["id"],
  detailRecords: LeadSaleDashboardDetailRecord[] | null,
  records: LeadSaleDetailRecord[],
) {
  if (detailRecords) {
    return recordsFromDetails(detailRecords, records, (record) =>
      record.actionIds.includes(actionId),
    );
  }
  if (actionId !== "unassigned") return records;
  return records.filter(
    (record) => !record.owner || record.owner === "Chưa phân công",
  );
}

function emptyDetail(id: LeadSaleDetailId): LeadSaleDetail {
  return {
    id,
    kind: "records",
    eyebrow: "TỔNG QUAN TUYỂN SINH",
    title: "Chi tiết tuyển sinh",
    description: "Dữ liệu được tổng hợp từ phạm vi đội Sale hiện tại.",
    tone: "primary",
    metrics: [],
    records: [],
    recommendedAction: "Tiếp tục theo dõi các hồ sơ trong phạm vi đội.",
  };
}

function createDetails(
  payload: LeadSaleDashboardPayload,
  actions: LeadSaleAction[],
  priorityQueue: LeadSaleQueueRecord[],
  stages: LeadSaleStageAnalysis[],
  reps: LeadSaleRepPerformance[],
  agingBuckets: LeadSaleAgingBucket[],
): Record<LeadSaleDetailId, LeadSaleDetail> {
  const details = Object.fromEntries(
    DETAIL_IDS.map((id) => [id, emptyDetail(id)]),
  ) as Record<LeadSaleDetailId, LeadSaleDetail>;
  const detailRecords = payload.detailRecords?.length
    ? payload.detailRecords
    : null;
  const records = detailRecords
    ? detailRecords.map((row) => toDetailRecord(row))
    : payload.priorityQueue.map((row) => toDetailRecord(row));
  const set = (id: LeadSaleDetailId, patch: Partial<LeadSaleDetail>) => {
    details[id] = { ...details[id], ...patch };
  };

  set("enrollment", {
    eyebrow: "KẾT QUẢ ĐỘI NGŨ",
    title: "Hồ sơ đã nhập học",
    tone: "success",
    metrics: [
      { label: "Đã nhập học", value: String(payload.summary.enrollment) },
      { label: "Chỉ tiêu", value: formatMetric(payload.summary.target) },
      {
        label: "Mức đạt",
        value: formatMetric(payload.summary.achievement, "%"),
      },
    ],
    records: recordsFromDetails(
      detailRecords,
      records,
      (record) => record.recordType === "enrolled",
    ),
    recommendedAction:
      "Theo dõi nhóm hồ sơ đã hoàn tất và tập trung phần chỉ tiêu còn thiếu.",
  });
  set("forecast", {
    eyebrow: "DỰ BÁO NHẬP HỌC",
    title: "Dự báo nhập học",
    tone: "violet",
    metrics: [
      { label: "Dự kiến", value: String(payload.summary.expected) },
      { label: "Còn thiếu", value: formatMetric(payload.summary.remaining) },
      { label: "Độ phủ", value: formatCoverage(payload.summary.coverage) },
    ],
    breakdown: stages.map((stage) => ({
      id: `forecast-${stage.id}`,
      label: stage.label,
      value: `${stage.volume} hồ sơ`,
      note: `${stage.nextStepConversion ?? 0}% chuyển bước tiếp theo`,
      detailId: stage.detailId,
    })),
    kind: "stage-breakdown",
    recommendedAction:
      "Ưu tiên các giai đoạn có độ phủ thấp hoặc nhiều hồ sơ cần xử lý.",
  });

  for (const action of actions) {
    const detailId = ACTION_DETAIL_IDS[action.id];
    if (!detailId) continue;
    set(detailId, {
      eyebrow: "CẦN CAN THIỆP",
      title: action.label,
      tone: action.tone,
      metrics: [
        { label: "Số hồ sơ", value: String(action.value) },
        { label: "Tuổi cao nhất", value: formatAge(action.longestAgeDays) },
      ],
      records: recordsForAction(action.id, detailRecords, records),
      recommendedAction: action.subtext,
    });
  }

  for (const stage of stages) {
    set(stage.detailId, {
      eyebrow: "PHÂN TÍCH GIAI ĐOẠN",
      title: stage.label,
      description: stage.note,
      tone: stage.tone,
      metrics: [
        { label: "Hồ sơ", value: String(stage.volume) },
        {
          label: "Tỷ lệ chuyển đổi",
          value:
            stage.nextStepConversion === null
              ? "—"
              : `${stage.nextStepConversion}%`,
        },
        { label: "Cần xử lý", value: String(stage.actionItemCount) },
      ],
      records: recordsFromDetails(
        detailRecords,
        records,
        (record) => record.stageId === stage.id,
      ),
      recommendedAction: stage.actionItemCount
        ? "Rà soát và cập nhật bước tiếp theo cho các hồ sơ này."
        : "Tiếp tục theo dõi và cập nhật bước tiếp theo.",
    });
  }

  for (const bucket of agingBuckets) {
    set(bucket.detailId, {
      eyebrow: "TUỔI HỒ SƠ",
      title: bucket.label,
      tone: bucket.tone,
      metrics: [
        { label: "Số hồ sơ", value: String(bucket.count) },
        { label: "Khoảng thời gian", value: bucket.label },
      ],
      records: recordsFromDetails(
        detailRecords,
        records,
        (record) =>
          record.recordType === "active" && record.agingBucketId === bucket.id,
      ),
      recommendedAction:
        bucket.id === "0-2-days"
          ? "Theo dõi theo lịch xử lý."
          : "Ưu tiên rà soát và cập nhật bước tiếp theo.",
    });
  }

  reps.forEach((rep, index) => {
    const detailId = REP_DETAIL_IDS[index];
    if (!detailId) return;
    set(detailId, {
      eyebrow: "CHI TIẾT THEO SALE",
      title: rep.name,
      tone:
        (rep.coverage !== null && rep.coverage < 1) || rep.overdue > 0
          ? "warning"
          : "success",
      metrics: [
        { label: "Đã nhập học", value: String(rep.enrollment) },
        { label: "Độ phủ", value: formatCoverage(rep.coverage) },
        {
          label: "Quá hạn / Cần xử lý",
          value: `${rep.overdue} / ${rep.actionItemCount}`,
        },
      ],
      records: detailRecords
        ? recordsFromDetails(
            detailRecords,
            records,
            (record) => record.ownerId === rep.id,
          )
        : records.filter((record) => record.owner === rep.name),
      recommendedAction:
        rep.overdue || rep.actionItemCount
          ? "Cùng nhân viên tư vấn xử lý các hồ sơ quá hạn và việc cần xử lý trước khi nhận thêm."
          : "Tiếp tục duy trì nhịp xử lý và cập nhật pipeline.",
    });
  });

  priorityQueue.forEach((record, index) => {
    const detailId = RECORD_DETAIL_IDS[index];
    if (!detailId) return;
    set(detailId, {
      eyebrow: "HỒ SƠ CẦN XỬ LÝ",
      title: record.name,
      description: `${record.stage} · ${record.issue}`,
      tone: record.tone,
      metrics: [
        { label: "Nhân viên tư vấn", value: record.owner },
        { label: "Giai đoạn", value: record.stage },
        { label: "Đã đứng", value: record.age },
      ],
      records: [toDetailRecord(payload.priorityQueue[index], record.tone)],
      recommendedAction: record.nextAction,
    });
  });
  return details;
}

export function toLeadSaleDashboardData(
  response: LeadSaleOverviewResponse,
  filters: LeadSaleDashboardFilters = DEFAULT_LEAD_SALE_FILTERS,
): LeadSaleDashboardData {
  const payload = response.dashboard;
  const summary = payload.summary;
  const actionItems: LeadSaleAction[] = payload.actions.map((action) => ({
    id: action.id,
    label: {
      overdue: "Công việc quá hạn",
      unassigned: "Lead chưa phân công",
      "due-today": "Liên hệ hôm nay",
      aging: "Hồ sơ tồn lâu",
    }[action.id],
    value: action.value,
    longestAgeDays: action.longestAgeDays,
    description: {
      overdue: "Hồ sơ đang chờ xử lý nhưng đã quá hạn.",
      unassigned: "Hồ sơ mới chưa có người phụ trách.",
      "due-today": "Hồ sơ có lịch gọi lại hoặc tư vấn trong ngày.",
      aging: "Hồ sơ đã ở giai đoạn hiện tại lâu, cần cập nhật bước tiếp theo.",
    }[action.id],
    subtext: action.longestAgeDays
      ? `Hồ sơ lâu nhất: ${action.longestAgeDays} ngày`
      : "Không có hồ sơ trong nhóm này",
    tone:
      action.id === "overdue"
        ? "danger"
        : action.id === "unassigned"
          ? "violet"
          : action.id === "aging"
            ? "warning"
            : "primary",
    detailId: ACTION_DETAIL_IDS[action.id],
  }));
  const priorityQueue: LeadSaleQueueRecord[] = payload.priorityQueue.map(
    (row, index) => ({
      id: row.id,
      name: row.name,
      initials: initials(row.name),
      owner: row.owner,
      stage: row.stageLabel,
      issue: issueLabel(row.issueCode),
      age: formatAge(row.ageDays),
      nextAction: row.nextAction,
      tone: ISSUE_TONES[row.issueCode] ?? "warning",
      detailId: RECORD_DETAIL_IDS[index] ?? "aging",
    }),
  );
  const stages: LeadSaleStageAnalysis[] = payload.stages.map((stage) => ({
    ...stage,
    note: stage.actionItemCount
      ? `${stage.actionItemCount} hồ sơ cần xử lý`
      : "Chưa có việc cần xử lý",
    tone: STAGE_TONES[stage.id],
    detailId: STAGE_DETAIL_IDS[stage.id],
  }));
  const reps: LeadSaleRepPerformance[] = payload.reps.map((rep, index) => ({
    ...rep,
    name: rep.displayName,
    initials: initials(rep.displayName),
    detailId: REP_DETAIL_IDS[index] ?? "rep-e",
    pipeline: {
      ...rep.pipeline,
      trend: rep.pipeline.trend,
    },
  }));
  const trend: LeadSaleTrendPoint[] = payload.trend;
  const agingBuckets: LeadSaleAgingBucket[] = payload.agingBuckets.map(
    (bucket) => ({
      ...bucket,
      label: {
        "0-2-days": "0–2 ngày",
        "3-5-days": "3–5 ngày",
        "6-10-days": "6–10 ngày",
        "over-10-days": "Trên 10 ngày",
      }[bucket.id],
      note:
        bucket.id === "0-2-days" ? "Đang trong mốc xử lý" : "Cần theo dõi sát",
      tone:
        bucket.id === "0-2-days"
          ? "success"
          : bucket.id === "3-5-days"
            ? "warning"
            : "danger",
      detailId: AGING_DETAIL_IDS[bucket.id],
    }),
  );

  const data = {
    asOf: response.meta.asOf,
    teamName: response.meta.team.name,
    periodLabel: `Kỳ tuyển sinh ${response.meta.admissionYear}`,
    scopeLabel:
      "Toàn đội · Tất cả chương trình · Tất cả nguồn · Tất cả khu vực",
    activeFilters: filters,
    summary,
    actions: actionItems,
    priorityQueue,
    stages,
    reps,
    trend,
    agingBuckets,
    details: {} as Record<LeadSaleDetailId, LeadSaleDetail>,
  } satisfies Omit<LeadSaleDashboardData, "details"> & {
    details: Record<LeadSaleDetailId, LeadSaleDetail>;
  };
  data.details = createDetails(
    payload,
    actionItems,
    priorityQueue,
    stages,
    reps,
    agingBuckets,
  );
  return data;
}
