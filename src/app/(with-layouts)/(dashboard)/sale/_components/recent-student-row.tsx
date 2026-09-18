import { ArrowRight } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  getStudentStageBadgeColor,
  getStudentStageLabel,
} from "@/components/segments/segment-filter-config";
import { formatNbaChannel } from "@/services/api/nba/presentation";

import type { SaleDashboardStudentRecord } from "./sale-dashboard-detail.types";

interface RecentStudentRowProps {
  record: SaleDashboardStudentRecord;
  onOpen: (record: SaleDashboardStudentRecord) => void;
}

const nbaPriorityPresentation = {
  high: { label: "Ưu tiên cao", color: "error" },
  medium: { label: "Ưu tiên vừa", color: "warning" },
  low: { label: "Ưu tiên thấp", color: "gray" },
} as const;

export default function RecentStudentRow({
  record,
  onOpen,
}: RecentStudentRowProps) {
  const { student } = record;
  const priority = student.nba
    ? nbaPriorityPresentation[student.nba.priority]
    : null;

  return (
    <li>
      <Button
        type="button"
        variant="ghost"
        appearance="ghost"
        onPress={() => onOpen(record)}
        aria-label={`Xem chi tiết học sinh ${student.studentName}, mã ${student.studentCode}`}
        className="group h-auto w-full cursor-pointer justify-start rounded-none px-4 py-3.5 text-left transition-colors hover:bg-card-background hover:text-text-primary active:bg-background-soft-50 first:rounded-t-xl last:rounded-b-xl sm:px-5"
      >
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-badge-success-background text-xs font-semibold text-badge-success-text"
          aria-hidden="true"
        >
          {student.studentName.split(/\s+/).slice(-1)[0]?.slice(0, 1) ?? "H"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="truncate text-sm font-semibold text-text-primary transition-colors group-hover:text-primary-700 group-focus-visible:text-primary-700">
              {student.studentName}
            </span>
            <span className="text-[11px] text-text-tertiary">
              {student.studentCode}
            </span>
          </span>
          <span className="mt-1 block truncate text-xs text-text-secondary">
            {record.school} · {record.major}
          </span>
          <span className="mt-2 flex flex-wrap items-center gap-2">
            <Badge
              color={getStudentStageBadgeColor(student.studentStage)}
              size="sm"
            >
              {getStudentStageLabel(student.studentStage)}
            </Badge>
            {priority ? (
              <Badge color={priority.color} size="sm">
                {priority.label}
              </Badge>
            ) : null}
            {student.nba ? (
              <span className="min-w-0 truncate text-[11px] text-text-tertiary">
                {student.nba.title} · {formatNbaChannel(student.nba.channel)}
              </span>
            ) : null}
          </span>
        </span>
        <ArrowRight
          size={15}
          aria-hidden="true"
          className="shrink-0 text-text-tertiary transition group-hover:translate-x-0.5 group-hover:text-primary-600 group-focus-visible:text-primary-600"
        />
      </Button>
    </li>
  );
}
