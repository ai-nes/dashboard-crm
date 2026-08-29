import { ArrowRight, ArrowUpward, ClockThree, MapMarker5 } from "@tailgrids/icons";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import type { StudentListItem } from "@/services/api/students/types";

interface StudentListProps {
  students: StudentListItem[];
}

const stageColor = {
  "Quan tâm": "gray",
  "Tìm hiểu": "sky",
  "Tư vấn": "primary",
  "Ứng tuyển": "warning",
  "Nhập học": "success",
} as const;

const priorityColor = { Cao: "error", "Trung bình": "warning", Thấp: "gray" } as const;

export default function StudentList({ students }: StudentListProps) {
  if (students.length === 0) {
    return <div className="px-5 py-14 text-center"><p className="font-medium text-text-primary">Không tìm thấy hồ sơ phù hợp</p><p className="mt-1 text-sm text-text-tertiary">Thử thay đổi từ khóa hoặc bộ lọc để xem thêm học sinh.</p></div>;
  }

  return (
    <ul className="divide-y divide-card-border" aria-label="Danh sách học sinh">
      {students.map((student) => (
        <li key={student.id}>
          <Link href={`/director/students/${student.id}`} className="group grid gap-4 px-4 py-4 transition hover:bg-background-soft-50 focus-visible:bg-background-soft-50 focus-visible:outline-none lg:grid-cols-[minmax(260px,1.3fr)_minmax(140px,0.65fr)_minmax(150px,0.75fr)_minmax(210px,1fr)_auto] lg:items-center lg:px-5">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-badge-primary-background text-sm font-semibold text-badge-primary-text">{student.initials}</span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><p className="truncate font-semibold text-text-primary group-hover:text-primary-500">{student.name}</p><Badge color={priorityColor[student.priority]}>{student.priority}</Badge></div>
                <p className="mt-1 truncate text-xs text-text-tertiary">{student.code} · {student.major}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-text-secondary"><MapMarker5 size={13} className="shrink-0 text-icon-tertiary" aria-hidden="true" />{student.school} · {student.province}</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 lg:block"><p className="text-xs text-text-tertiary">Giai đoạn</p><Badge color={stageColor[student.stage]}>{student.stage}</Badge></div>
            <div className="min-w-0"><div className="flex items-center justify-between gap-3"><p className="text-xs text-text-tertiary">Điểm tiềm năng</p><span className="text-sm font-semibold text-text-primary">{student.score}/100</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background-soft-200"><div className="h-full rounded-full bg-primary-500" style={{ width: `${student.score}%` }} /></div><p className={`mt-1 flex items-center gap-1 text-xs ${student.scoreDelta >= 0 ? "text-success-500" : "text-error-500"}`}>{student.scoreDelta >= 0 && <ArrowUpward size={11} aria-hidden="true" />}{student.scoreDelta > 0 ? "+" : ""}{student.scoreDelta} điểm / 7 ngày</p></div>
            <div className="min-w-0"><p className="text-xs text-text-tertiary">Hành động tiếp theo</p><p className="mt-1 truncate text-sm font-medium text-text-primary">{student.nextAction}</p><p className="mt-1 flex items-center gap-1 text-xs text-text-tertiary"><ClockThree size={12} aria-hidden="true" />{student.lastActivity} · {student.owner}</p></div>
            <span className="hidden items-center gap-1 text-xs font-medium text-button-primary-outline-text group-hover:text-button-primary-outline-hover-text lg:flex">Mở 360°<ArrowRight size={15} /></span>
            <span className="flex items-center justify-end gap-1 text-xs font-medium text-button-primary-outline-text lg:hidden">Xem hồ sơ<ArrowRight size={15} /></span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
