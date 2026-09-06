import { MapMarker5 } from "@tailgrids/icons";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import type { StudentListItem } from "@/services/api/students/types";

import StudentOwnerCell from "./student-owner-cell";

interface StudentListProps {
  students: StudentListItem[];
  ownerEditable?: boolean;
}

const stageColor = {
  "Quan tâm": "gray",
  "Tìm hiểu": "sky",
  "Tư vấn": "primary",
  "Ứng tuyển": "warning",
  "Nhập học": "success",
} as const;

function getScoreTone(score: number): "success" | "warning" | "error" {
  if (score >= 75) return "success";
  if (score >= 60) return "warning";
  return "error";
}

export const studentListGrid =
  "lg:grid-cols-[minmax(250px,1.35fr)_minmax(170px,0.9fr)_120px_130px_minmax(200px,1.2fr)_110px]";

export default function StudentList({
  students,
  ownerEditable = false,
}: StudentListProps) {
  const [ownerOverrides, setOwnerOverrides] = useState<
    Record<string, string>
  >({});

  if (students.length === 0) {
    return (
      <div className="px-5 py-14 text-center">
        <p className="font-medium text-text-primary">Không tìm thấy hồ sơ phù hợp</p>
        <p className="mt-1 text-sm text-text-tertiary">Thử thay đổi từ khóa hoặc bộ lọc để xem thêm học sinh.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-card-border" aria-label="Danh sách học sinh">
      {students.map((student) => {
        const scoreTone = getScoreTone(student.score);

        return (
          <li key={student.id}>
            <div className={`grid gap-4 px-4 py-4 ${studentListGrid} lg:items-center lg:px-5`}>
              {/* Cột 1: Họ tên · THPT · Quê quán */}
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-badge-primary-background text-sm font-semibold text-badge-primary-text">
                  {student.initials || "HS"}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-text-primary">{student.name || "-"}</p>
                  <p className="mt-1 truncate text-xs text-text-tertiary">{student.school || "-"}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-text-secondary">
                    <MapMarker5 size={13} className="shrink-0 text-icon-tertiary" aria-hidden="true" />
                    {student.province || "-"}
                  </p>
                </div>
              </div>

              {/* Cột 2: Ngành quan tâm */}
              <div className="flex min-w-0 items-center justify-between gap-2 lg:block">
                <p className="text-xs text-text-tertiary lg:hidden">Ngành quan tâm</p>
                <p className="truncate text-sm font-medium text-text-primary lg:text-left" title={student.major || undefined}>
                  {student.major || "-"}
                </p>
              </div>

              {/* Cột 3: Trạng thái */}
              <div className="flex items-center justify-between gap-2 lg:justify-start">
                <p className="text-xs text-text-tertiary lg:hidden">Trạng thái</p>
                {student.stage && stageColor[student.stage] ? (
                  <Badge color={stageColor[student.stage]}>{student.stage}</Badge>
                ) : (
                  <span className="text-xs font-medium text-text-tertiary">-</span>
                )}
              </div>

              {/* Cột 4: Điểm tiềm năng */}
              <div className="flex items-center justify-between gap-2 lg:justify-start">
                <p className="text-xs text-text-tertiary lg:hidden">Điểm tiềm năng</p>
                <Badge color={scoreTone}>{student.score}</Badge>
              </div>

              {/* Cột 5: Người phụ trách */}
              <div className="min-w-0">
                <p className="mb-1 text-xs text-text-tertiary lg:hidden">Người phụ trách</p>
                <StudentOwnerCell
                  studentId={student.id}
                  expectedRevision={student.revision}
                  owner={ownerOverrides[student.id] ?? student.owner}
                  editable={ownerEditable}
                  onChange={(next) =>
                    setOwnerOverrides((prev) => ({
                      ...prev,
                      [student.id]: next,
                    }))
                  }
                />
              </div>

              {/* Cột 6: Thao tác */}
              <div className="flex items-center justify-between gap-2 lg:justify-center">
                <p className="text-xs text-text-tertiary lg:hidden">Thao tác</p>
                <Link
                  href={`/director/students/${student.id}`}
                  aria-label={`Xem chi tiết hồ sơ ${student.name || "học sinh"}`}
                  className="text-xs font-medium text-warning-500 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                >
                  Chi tiết
                </Link>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
