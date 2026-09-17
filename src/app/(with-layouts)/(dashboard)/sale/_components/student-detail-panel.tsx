import { Badge } from "@/components/tailgrids/core/badge";
import {
  getStudentStageBadgeColor,
  getStudentStageLabel,
} from "@/components/segments/segment-filter-config";
import { formatNbaChannel } from "@/services/api/nba/presentation";

import type { SaleDashboardStudentRecord } from "./sale-dashboard-detail.types";
import {
  SaleDetailCallout,
  SaleDetailFacts,
  SaleDetailSection,
} from "./sale-detail-primitives";

interface StudentDetailPanelProps {
  record: SaleDashboardStudentRecord;
  timezone: string;
}

const lifecycleLabel = {
  Lead: "Lead",
  MQL: "Đã xác định nhu cầu",
  Applicant: "Ứng tuyển",
  Enrolled: "Đã nhập học",
  Lost: "Không tiếp tục",
} as const;

const nbaPriorityPresentation = {
  high: { label: "Ưu tiên cao", color: "error" },
  medium: { label: "Ưu tiên vừa", color: "warning" },
  low: { label: "Ưu tiên thấp", color: "gray" },
} as const;

function formatDateTime(
  value: string | null | undefined,
  timezone: string,
): string {
  if (!value) return "Chưa ghi nhận";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa ghi nhận";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  }).format(date);
}

export default function StudentDetailPanel({
  record,
  timezone,
}: StudentDetailPanelProps) {
  const { student } = record;
  const priority = student.nba
    ? nbaPriorityPresentation[student.nba.priority]
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge color={getStudentStageBadgeColor(student.studentStage)}>
          {getStudentStageLabel(student.studentStage)}
        </Badge>
        {student.lifecycleStatus ? (
          <Badge color="gray">{lifecycleLabel[student.lifecycleStatus]}</Badge>
        ) : null}
        {student.stageAgeDays !== null && student.stageAgeDays !== undefined ? (
          <Badge color="gray">{student.stageAgeDays} ngày ở giai đoạn</Badge>
        ) : null}
      </div>

      <SaleDetailSection title="Hồ sơ học sinh">
        <SaleDetailFacts
          facts={[
            { label: "Mã học sinh", value: student.studentCode },
            { label: "Trường", value: record.school },
            { label: "Ngành quan tâm", value: record.major },
            { label: "Nguồn", value: record.source },
            {
              label: "Hoạt động gần nhất",
              value: formatDateTime(student.lastActivityAt, timezone),
            },
            {
              label: "Thời gian ở giai đoạn",
              value:
                student.stageAgeDays === null ||
                student.stageAgeDays === undefined
                  ? "Chưa có dữ liệu"
                  : `${student.stageAgeDays} ngày`,
            },
          ]}
        />
      </SaleDetailSection>

      {student.attentionReason ? (
        <SaleDetailCallout title="Lý do cần quan tâm" tone="warning">
          {student.attentionReason}
        </SaleDetailCallout>
      ) : null}

      {student.nba ? (
        <SaleDetailSection title="Gợi ý hành động tiếp theo">
          <div className="rounded-xl border border-card-border bg-background-soft-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-text-primary">
                {student.nba.title}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {priority ? (
                  <Badge color={priority.color}>{priority.label}</Badge>
                ) : null}
                <Badge color="gray">
                  {formatNbaChannel(student.nba.channel)}
                </Badge>
              </div>
            </div>
            <dl className="mt-4 space-y-3 border-t border-card-border pt-4 text-sm">
              {student.nba.reason ? (
                <div>
                  <dt className="text-xs font-medium text-text-tertiary">
                    Lý do đề xuất
                  </dt>
                  <dd className="mt-1 leading-6 text-text-secondary">
                    {student.nba.reason}
                  </dd>
                </div>
              ) : null}
              {student.nba.whyNow ? (
                <div>
                  <dt className="text-xs font-medium text-text-tertiary">
                    Vì sao cần làm lúc này
                  </dt>
                  <dd className="mt-1 leading-6 text-text-secondary">
                    {student.nba.whyNow}
                  </dd>
                </div>
              ) : null}
              {student.nba.salesNextStep ? (
                <div>
                  <dt className="text-xs font-medium text-text-tertiary">
                    Bước Sale nên thực hiện
                  </dt>
                  <dd className="mt-1 leading-6 text-text-secondary">
                    {student.nba.salesNextStep}
                  </dd>
                </div>
              ) : null}
              {student.nba.scheduledAt ? (
                <div>
                  <dt className="text-xs font-medium text-text-tertiary">
                    Thời điểm gợi ý
                  </dt>
                  <dd className="mt-1 text-text-primary">
                    {formatDateTime(student.nba.scheduledAt, timezone)}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        </SaleDetailSection>
      ) : (
        <SaleDetailCallout title="Chưa có gợi ý hành động" tone="primary">
          Hồ sơ này hiện chưa có NBA được ghi nhận.
        </SaleDetailCallout>
      )}
    </div>
  );
}
