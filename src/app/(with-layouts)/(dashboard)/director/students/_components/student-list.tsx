import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import type { StudentListItem } from "@/services/api/students/types";

import StudentOwnerCell from "./student-owner-cell";
import { studentStatusBadgeColor, studentStatusLabel } from "./student-status";

interface StudentListProps {
  students: StudentListItem[];
  ownerEditable?: boolean;
}

function getScoreTone(score: number): "success" | "warning" | "error" {
  if (score >= 75) return "success";
  if (score >= 60) return "warning";
  return "error";
}

export const studentListGrid =
  "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_minmax(0,0.9fr)_minmax(0,1.3fr)_minmax(104px,0.7fr)_minmax(88px,0.55fr)_minmax(0,1.2fr)]";

export default function StudentList({
  students,
  ownerEditable = false,
}: StudentListProps) {
  const [ownerOverrides, setOwnerOverrides] = useState<Record<string, string>>(
    {},
  );

  if (students.length === 0) {
    return (
      <div className="px-5 py-14 text-center">
        <p className="font-medium text-text-primary">
          Không tìm thấy hồ sơ phù hợp
        </p>
        <p className="mt-1 text-sm text-text-tertiary">
          Thử thay đổi từ khóa hoặc bộ lọc để xem thêm học sinh.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-card-border" aria-label="Danh sách học sinh">
      {students.map((student) => {
        const scoreTone = getScoreTone(student.score);
        const status = student.studentStage;

        return (
          <li key={student.id}>
            <div
              className={`grid gap-4 px-4 py-4 ${studentListGrid} lg:items-center lg:px-5`}
            >
              {/* Cột 1: Mã học sinh */}
              <div className="flex min-w-0 items-center justify-between gap-2 lg:block">
                <p className="text-xs text-text-tertiary lg:hidden">
                  Mã học sinh
                </p>
                <p className="truncate text-sm font-medium text-text-primary">
                  {student.code || "-"}
                </p>
              </div>

              {/* Cột 2: Họ và tên */}
              <div className="min-w-0">
                <Link
                  href={`/director/students/${encodeURIComponent(student.code || student.id)}`}
                  aria-label={`Xem chi tiết hồ sơ ${student.name || "học sinh"}`}
                  className="block truncate font-semibold text-text-primary underline-offset-4 hover:text-primary-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                >
                  {student.name || "-"}
                </Link>
              </div>

              {/* Cột 3: Tỉnh/TP */}
              <div className="flex min-w-0 items-center justify-between gap-2 lg:block">
                <p className="text-xs text-text-tertiary lg:hidden">Tỉnh/TP</p>
                <p className="truncate text-sm text-text-secondary">
                  {student.province || "-"}
                </p>
              </div>

              {/* Cột 4: Ngành quan tâm */}
              <div className="flex min-w-0 items-center justify-between gap-2 lg:block">
                <p className="text-xs text-text-tertiary lg:hidden">
                  Ngành quan tâm
                </p>
                <p
                  className="truncate text-sm font-medium text-text-primary lg:text-left"
                  title={student.major || undefined}
                >
                  {student.major || "-"}
                </p>
              </div>

              {/* Cột 5: Trạng thái */}
              <div className="flex min-w-0 items-center justify-between gap-2 lg:justify-start">
                <p className="text-xs text-text-tertiary lg:hidden">
                  Trạng thái
                </p>
                {status ? (
                  <Badge color={studentStatusBadgeColor[status]} size="md">
                    {studentStatusLabel[status]}
                  </Badge>
                ) : (
                  <span className="text-sm text-text-tertiary">
                    Chưa có CRM Student
                  </span>
                )}
              </div>

              {/* Cột 6: Điểm tiềm năng */}
              <div className="flex min-w-0 items-center justify-between gap-2 lg:justify-start">
                <p className="text-xs text-text-tertiary lg:hidden">
                  Điểm tiềm năng
                </p>
                <Badge color={scoreTone} size="md">
                  {student.score}
                </Badge>
              </div>

              {/* Cột 7: Người phụ trách */}
              <div className="min-w-0">
                <p className="mb-1 text-xs text-text-tertiary lg:hidden">
                  Người phụ trách
                </p>
                <StudentOwnerCell
                  studentId={student.id}
                  expectedRevision={student.revision}
                  owner={ownerOverrides[student.id] ?? student.owner}
                  editable={ownerEditable}
                  onChange={(next) =>
                    setOwnerOverrides((previous) => ({
                      ...previous,
                      [student.id]: next,
                    }))
                  }
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
