"use client";

import StudentCardEmptyState from "@/app/(with-layouts)/(dashboard)/director/students/_components/student-card-empty-state";
import {
  Avatar,
  AvatarFallback,
} from "@/components/tailgrids/core/avatar";
import { Badge } from "@/components/tailgrids/core/badge";

import type { SegmentStudent } from "./segment-detail-types";
import {
  getSegmentLevelBadgeColor,
  getSegmentLevelLabel,
  getStudentStageBadgeColor,
  getStudentStageLabel,
} from "./segment-filter-config";

function getStudentInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "HS";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function SegmentFilterPreview({
  total,
  totalStudents,
  students,
  isLoading,
  error,
}: {
  total: number;
  totalStudents: number;
  students: SegmentStudent[];
  isLoading?: boolean;
  error?: string;
}) {
  const percentage =
    totalStudents > 0
      ? new Intl.NumberFormat("vi-VN", {
          style: "percent",
          maximumFractionDigits: 1,
        }).format(total / totalStudents)
      : "—";

  return (
    <div
      className="h-full w-full overflow-y-auto p-6"
      aria-label="Xem trước segment"
    >
      <div className="rounded-lg border border-badge-warning-icon-color bg-badge-warning-background p-4 text-sm text-text-primary">
        <strong>Kết quả ước tính.</strong> Lưu segment để xử lý kết quả đầy đủ.
      </div>
      <h2 className="mt-6 text-lg font-semibold">Xem trước</h2>
      <div className="my-8 grid grid-cols-2 gap-4 text-center">
        <div>
          <h3 className="text-xs font-semibold uppercase">Quy mô ước tính</h3>
          <p className="my-3 text-3xl font-semibold">
            {isLoading ? "…" : total.toLocaleString("vi-VN")}
          </p>
          <p className="text-sm text-text-secondary">Học sinh</p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase">Tỷ lệ dữ liệu</h3>
          <p className="my-3 text-3xl font-semibold">
            {isLoading ? "…" : percentage}
          </p>
          <p className="text-sm text-text-secondary">trên tổng số học sinh</p>
        </div>
      </div>
      <div className="rounded-xl border border-card-border">
        {error ? (
          <p className="px-5 py-16 text-center text-sm text-badge-error-text">
            {error}
          </p>
        ) : isLoading ? (
          <p className="px-5 py-16 text-center text-sm text-text-secondary">
            Đang tải danh sách học sinh khớp bộ lọc…
          </p>
        ) : students.length > 0 ? (
          <ul
            aria-label="Học sinh xem trước"
            className="divide-y divide-card-border"
          >
            {students.map((student) => (
              <li
                key={student.id}
                className="px-4 py-4 transition-colors duration-150 hover:bg-background-gray-secondary_alt"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <Avatar size="sm" aria-hidden="true">
                      <AvatarFallback className="border border-primary-100 bg-primary-50 text-xs text-primary-600">
                        {getStudentInitials(student.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-primary">
                        {student.name}
                      </p>
                      <p className="mt-1 truncate text-xs text-text-secondary">
                        <span className="tabular-nums font-medium">
                          {student.code}
                        </span>
                      </p>
                    </div>
                  </div>
                  <Badge
                    color={getStudentStageBadgeColor(student.stage)}
                    className="shrink-0 whitespace-nowrap"
                  >
                    {getStudentStageLabel(student.stage)}
                  </Badge>
                </div>
                {(student.potential || student.intent) && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {student.potential && (
                      <Badge
                        color={getSegmentLevelBadgeColor(student.potential)}
                      >
                        Tiềm năng: {getSegmentLevelLabel(student.potential)}
                      </Badge>
                    )}
                    {student.intent && (
                      <Badge color={getSegmentLevelBadgeColor(student.intent)}>
                        Ý định: {getSegmentLevelLabel(student.intent)}
                      </Badge>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex min-h-80 flex-col items-center justify-center px-5 py-10 text-center">
            <StudentCardEmptyState
              message="Segment hiện chưa có dữ liệu."
              className="[&>div]:mb-6 [&>div]:size-36 [&>p]:text-lg [&>p]:font-semibold [&>p]:text-text-primary"
            />
            <p className="text-sm leading-6 text-text-secondary">
              Chưa có học sinh phù hợp với bộ lọc để hiển thị.
            </p>
          </div>
        )}
      </div>
      <p className="mt-6 text-center text-sm text-text-secondary">
        Xem trước tối đa 25 kết quả đầu tiên.
      </p>
    </div>
  );
}
