"use client";

import { Calendar, CheckCircle1, FileText } from "@tailgrids/icons";

import { Card } from "@/components/tailgrids/core/card";
import type { SchoolIntelligenceData } from "@/services/api/schools/types";

import StudentAICardHeader from "../../students/_components/student-ai-card-header";
import {
  displaySchoolValue,
  schoolAnalysisTimestamp,
} from "./school-analysis-display";

interface SchoolRecentInteractionsCardProps {
  data: SchoolIntelligenceData;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export default function SchoolRecentInteractionsCard({
  data,
  isRefreshing,
  onRefresh,
}: SchoolRecentInteractionsCardProps) {
  const activities = normalizeActivities(data).slice(0, 5);
  const relationship = data.relationshipResponse ?? data.relationship;
  const latestCompletedActivity = activities.find(
    (activity) => activity.status?.toLowerCase() === "completed",
  );
  const relationshipRows = [
    ["Mức độ hợp tác", relationship.level],
    ["Đầu mối trường", relationship.contact],
    ["Vai trò đầu mối", relationship.contactRole],
    [
      "Điểm chạm gần nhất",
      latestCompletedActivity
        ? [latestCompletedActivity.title, latestCompletedActivity.date]
            .map(displaySchoolValue)
            .filter(Boolean)
            .join(" · ")
        : null,
    ],
  ].filter(([, value]) => displaySchoolValue(value));

  return (
    <Card className="min-w-0 overflow-hidden border border-card-border p-5 lg:p-6">
      <StudentAICardHeader
        title="Nhật ký hoạt động tuyển sinh"
        timestamp={schoolAnalysisTimestamp(data.dataFreshness)}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col rounded-xl border border-primary-500/30 bg-badge-primary-background/30 p-4 sm:p-5 dark:border-primary-500/50 dark:bg-card-background/40">
          <div className="flex items-center justify-between gap-3 border-b border-card-border/60 pb-3">
            <h4 className="text-sm font-semibold text-text-primary">
              Điểm chạm trường (Inbound)
            </h4>
          </div>
          <dl className="mt-3 divide-y divide-card-border/40 text-xs">
            {relationshipRows.map(([label, value]) => (
              <div
                key={label}
                className="flex min-h-10 items-baseline justify-between gap-3 py-2.5"
              >
                <dt className="font-medium text-text-secondary">{label}:</dt>
                <dd className="text-right font-medium text-text-primary">
                  {displaySchoolValue(value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex min-w-0 flex-col rounded-xl border border-success-500/30 bg-badge-success-background/30 p-4 sm:p-5 dark:border-success-500/50 dark:bg-card-background/40">
          <div className="flex items-center justify-between gap-3 border-b border-card-border/60 pb-3">
            <h4 className="text-sm font-semibold text-text-primary">
              Hoạt động phối hợp tuyển sinh (Outbound)
            </h4>
            <span className="text-xs font-medium text-text-tertiary">
              {activities.length > 0 ? `${activities.length} hoạt động` : ""}
            </span>
          </div>
          <div className="mt-3 divide-y divide-card-border/40 text-xs">
            {activities.map((activity) => (
              <SchoolActivityRow key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function SchoolActivityRow({ activity }: { activity: SchoolActivityRowData }) {
  const title = displaySchoolValue(activity.title);
  const date = displaySchoolValue(activity.date);
  const outcome = displaySchoolValue(activity.outcome);
  const status = displayActivityStatus(activity.status);

  return (
    <div className="py-2.5 first:pt-1 last:pb-1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          {activity.status?.toLowerCase() === "completed" ||
          activity.status?.toLowerCase() === "đã hoàn thành" ? (
            <CheckCircle1
              size={14}
              className="shrink-0 text-success-500"
              aria-hidden="true"
            />
          ) : (
            <Calendar
              size={14}
              className="shrink-0 text-primary-500"
              aria-hidden="true"
            />
          )}
          <span className="truncate font-semibold text-text-primary">
            {title}
          </span>
        </div>
        <time className="shrink-0 text-[11px] text-text-tertiary">{date}</time>
      </div>
      {(outcome || status) && (
        <p className="mt-1 flex items-start gap-1.5 pl-5 leading-relaxed text-text-secondary">
          <FileText
            size={13}
            className="mt-0.5 shrink-0 text-text-tertiary"
            aria-hidden="true"
          />
          {outcome || status}
        </p>
      )}
    </div>
  );
}

function displayActivityStatus(value: string | null) {
  const status = displaySchoolValue(value);
  if (!status) return null;
  const normalized = status.toLowerCase();
  if (normalized === "completed" || normalized === "đã hoàn thành") {
    return "Đã hoàn thành";
  }
  if (
    normalized === "scheduled" ||
    normalized === "planned" ||
    normalized === "đã lên lịch"
  ) {
    return "Đã lên lịch";
  }
  return status;
}

interface SchoolActivityRowData {
  id: string;
  title: string | null;
  date: string | null;
  status: string | null;
  outcome: string | null;
}

function normalizeActivities(
  data: SchoolIntelligenceData,
): SchoolActivityRowData[] {
  if (data.activitiesResponse) {
    return data.activitiesResponse
      .map((activity, index) => ({
        id: `${activity.activityType ?? "activity"}-${activity.scheduledAt ?? activity.occurredAt ?? index}`,
        title: activity.activityType,
        date: activity.scheduledAt ?? activity.occurredAt,
        status: activity.status,
        outcome:
          activity.outcome ??
          (activity.attendance === null
            ? null
            : `Số người tham dự: ${activity.attendance}`),
      }))
      .filter((activity) =>
        [activity.title, activity.date, activity.status, activity.outcome].some(
          (value) => displaySchoolValue(value),
        ),
      );
  }

  return data.activities
    .map((activity) => ({
      id: activity.id,
      title: activity.title,
      date: activity.date,
      status:
        activity.status === "completed" ? "Đã hoàn thành" : activity.status,
      outcome: activity.outcome ?? null,
    }))
    .filter((activity) =>
      [activity.title, activity.date, activity.status, activity.outcome].some(
        (value) => displaySchoolValue(value),
      ),
    );
}
