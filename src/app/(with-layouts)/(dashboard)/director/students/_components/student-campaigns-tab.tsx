"use client";

import { Calendar, InfoCircle, RefreshCircle1Clockwise } from "@tailgrids/icons";

import { useStudentCampaignHistoryQuery } from "@/hooks/use-student-campaign-history-query";
import type { StudentCampaignParticipation } from "@/services/api/student-campaigns";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import { formatDate, formatDateTime } from "@/utils/format-date";

interface StudentCampaignsTabProps {
  studentId: string;
  primaryCampaign?: string | null;
  primaryCampaignOccurredAt?: string | null;
  isActive: boolean;
}

const statusLabels: Record<string, string> = {
  Registered: "Đã đăng ký",
  "Checked-in": "Đã tham dự",
  "No-show": "Vắng mặt",
  "Feedback Given": "Đã gửi phản hồi",
};

const statusColors: Record<
  string,
  "gray" | "primary" | "success" | "warning" | "sky"
> = {
  Registered: "primary",
  "Checked-in": "success",
  "No-show": "warning",
  "Feedback Given": "sky",
};

const campaignStatusLabels: Record<string, string> = {
  DRAFT: "Bản nháp",
  UPCOMING: "Sắp diễn ra",
  ACTIVE: "Đang diễn ra",
  CLOSED: "Đã đóng",
};

const campaignStatusColors: Record<
  string,
  "gray" | "primary" | "success"
> = {
  DRAFT: "gray",
  UPCOMING: "primary",
  ACTIVE: "success",
  CLOSED: "gray",
};

const eventTypeLabels: Record<string, string> = {
  "On-Campus": "Tại trường",
  "Off-Campus": "Ngoài trường",
};

const eventTypeColors: Record<string, "gray" | "sky" | "orange"> = {
  "On-Campus": "sky",
  "Off-Campus": "orange",
};

export default function StudentCampaignsTab({
  studentId,
  primaryCampaign,
  primaryCampaignOccurredAt,
  isActive,
}: StudentCampaignsTabProps) {
  const historyQuery = useStudentCampaignHistoryQuery(studentId, isActive);
  const history = historyQuery.data?.campaigns ?? [];
  const campaignLabel = primaryCampaign?.trim() || "";
  const hasPrimaryCampaign = history.some(
    (item) =>
      item.campaign?.trim().toLocaleLowerCase() ===
        campaignLabel.toLocaleLowerCase() ||
      item.label.trim().toLocaleLowerCase() === campaignLabel.toLocaleLowerCase(),
  );
  const participations =
    campaignLabel && !hasPrimaryCampaign
      ? [
          {
            label: campaignLabel,
            campaign: campaignLabel,
            event: null,
            kind: "campaign" as const,
            status: null,
            occurredAt: primaryCampaignOccurredAt ?? null,
            campaignDetails: null,
            eventDetails: null,
          },
          ...history,
        ]
      : history;
  const hasStudent = Boolean(studentId.trim());

  return (
    <section className="space-y-4" aria-labelledby="student-campaigns-heading">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3
            id="student-campaigns-heading"
            className="text-base font-semibold text-text-primary"
          >
            Chiến dịch &amp; sự kiện đã tham gia
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            Lịch sử được ghi nhận trong hồ sơ tuyển sinh.
          </p>
        </div>
        {participations.length > 0 && (
          <Badge color="gray" size="sm">
            {participations.length} hoạt động
          </Badge>
        )}
      </header>

      {historyQuery.isPending && hasStudent ? (
        <CampaignHistorySkeleton />
      ) : historyQuery.isError && participations.length === 0 ? (
        <div
          role="alert"
          className="rounded-lg border border-error-500/30 bg-badge-error-background p-4 text-sm text-error-600"
        >
          <div className="flex items-start gap-2">
            <InfoCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium">Không thể tải lịch sử chiến dịch.</p>
              <p className="mt-1 text-xs">
                {historyQuery.error.message || "Vui lòng thử lại."}
              </p>
              <Button
                type="button"
                appearance="outline"
                size="sm"
                className="mt-3"
                onPress={() => void historyQuery.refetch()}
              >
                <RefreshCircle1Clockwise size={15} aria-hidden="true" />
                Thử lại
              </Button>
            </div>
          </div>
        </div>
      ) : participations.length === 0 ? (
        <div className="rounded-lg border border-dashed border-card-border px-4 py-8 text-center">
          <p className="text-sm font-medium text-text-primary">
            {hasStudent
              ? "Chưa ghi nhận chiến dịch hoặc sự kiện"
              : "Hồ sơ chưa liên kết với CRM Student"}
          </p>
          <p className="mx-auto mt-1 max-w-xl text-sm text-text-secondary">
            {hasStudent
              ? "Khi có hoạt động tuyển sinh được ghi nhận, lịch sử sẽ hiển thị tại đây."
              : "Cần bản ghi CRM Student để đối chiếu hoạt động tham gia."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-card-border rounded-xl border border-card-border">
          {participations.map((participation, index) => (
            <CampaignParticipationRow
              key={`${participation.kind}-${participation.occurredAt ?? "undated"}-${index}`}
              participation={participation}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function CampaignParticipationRow({
  participation,
}: {
  participation: StudentCampaignParticipation;
}) {
  const isEvent = participation.kind === "event";
  const timeLabel = isEvent
    ? "Tham gia"
    : participation.occurredAt
      ? "Ghi nhận"
      : "Thời gian";

  return (
    <article className="flex min-w-0 flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="min-w-0 break-words text-sm font-medium text-text-primary">
            {participation.label}
          </h4>
          <Badge color={isEvent ? "violet" : "sky"} size="sm">
            {isEvent ? "Sự kiện" : "Chiến dịch"}
          </Badge>
          {participation.campaignDetails?.status && (
            <Badge
              color={campaignStatusColors[participation.campaignDetails.status] ?? "gray"}
              size="sm"
            >
              {campaignStatusLabels[participation.campaignDetails.status] ??
                participation.campaignDetails.status}
            </Badge>
          )}
          {participation.status && (
            <Badge
              color={statusColors[participation.status] ?? "gray"}
              size="sm"
            >
              {statusLabels[participation.status] ?? participation.status}
            </Badge>
          )}
        </div>
        {isEvent && participation.campaign && (
          <p className="mt-1 text-sm text-text-secondary">
            Chiến dịch: {participation.campaign}
          </p>
        )}
        <CampaignParticipationDetails participation={participation} />
      </div>
      <time
        dateTime={participation.occurredAt ?? undefined}
        className="inline-flex shrink-0 items-center gap-1.5 text-xs text-text-secondary"
      >
        <Calendar size={14} aria-hidden="true" />
        <span>
          {timeLabel}: {formatDateTime(participation.occurredAt, "Chưa rõ thời điểm")}
        </span>
      </time>
    </article>
  );
}

function CampaignParticipationDetails({
  participation,
}: {
  participation: StudentCampaignParticipation;
}) {
  const details: string[] = [];
  const campaign = participation.campaignDetails;
  const event = participation.eventDetails;

  if (campaign?.stableCode) details.push(`Mã chiến dịch ${campaign.stableCode}`);
  if (campaign?.campaignType) details.push(`Loại chiến dịch ${campaign.campaignType}`);
  const campaignRange = formatDateRange(campaign?.startDate, campaign?.endDate);
  if (campaignRange) details.push(`Thời gian ${campaignRange}`);
  const eventStart = event?.startDatetime ?? event?.eventDate;
  if (eventStart) {
    const eventEnd = event?.endDatetime
      ? ` – ${formatDateTime(event.endDatetime)}`
      : "";
    details.push(
      `Lịch sự kiện ${formatDateTime(eventStart)}${eventEnd}`,
    );
  }
  if (event?.location) details.push(`Địa điểm ${event.location}`);

  if (details.length === 0 && !campaign?.eventType) return null;
  return (
    <div className="mt-2 space-y-0.5">
      <p className="text-xs font-medium text-text-secondary">
        {participation.kind === "event"
          ? "Chi tiết tham gia"
          : "Chi tiết chiến dịch"}
      </p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs leading-5 text-text-secondary">
        {campaign?.eventType && (
          <Badge color={eventTypeColors[campaign.eventType] ?? "gray"} size="sm">
            {eventTypeLabels[campaign.eventType] ?? campaign.eventType}
          </Badge>
        )}
        {details.map((detail) => (
          <span key={detail}>{detail}</span>
        ))}
      </div>
    </div>
  );
}

function formatDateRange(startDate?: string | null, endDate?: string | null) {
  const start = startDate ? formatDate(startDate, "") : "";
  const end = endDate ? formatDate(endDate, "") : "";
  if (start && end && start !== end) return `${start} – ${end}`;
  return start || end;
}

function CampaignHistorySkeleton() {
  return (
    <div
      aria-label="Đang tải lịch sử chiến dịch"
      aria-busy="true"
      className="divide-y divide-card-border rounded-xl border border-card-border"
    >
      {["first", "second", "third"].map((item) => (
        <div key={item} className="space-y-3 p-4">
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}
