"use client";

import { ArrowRight, CheckCircle1, ClockThree } from "@tailgrids/icons";
import { useMemo, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { SchoolIntelligenceData, StudentSignal } from "@/services/api/schools/types";

interface SchoolStudentSignalsProps {
  data: SchoolIntelligenceData;
}

type StudentSignalFilter = "all" | StudentSignal["signalType"];

const filters: { key: StudentSignalFilter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "hot", label: "Nóng" },
  { key: "highIntent", label: "Ý định cao" },
  { key: "noActivity", label: "Chưa tương tác" },
  { key: "applying", label: "Đang ứng tuyển" },
];

const signalMeta: Record<Exclude<StudentSignalFilter, "all">, { label: string; color: "error" | "primary" | "warning" | "success" }> = {
  hot: { label: "Nóng", color: "error" },
  highIntent: { label: "Ý định cao", color: "primary" },
  noActivity: { label: "Chưa tương tác", color: "warning" },
  applying: { label: "Đang ứng tuyển", color: "success" },
};

const nextActions: Record<Exclude<StudentSignalFilter, "all">, string> = {
  hot: "Gọi tư vấn 1:1",
  highIntent: "Gửi lộ trình ngành",
  noActivity: "Kích hoạt lại điểm chạm",
  applying: "Nhắc hoàn tất hồ sơ",
};

export default function SchoolStudentSignals({ data }: SchoolStudentSignalsProps) {
  const [activeFilter, setActiveFilter] = useState<StudentSignalFilter>("all");
  const filteredStudents = useMemo(
    () => activeFilter === "all" ? data.studentSignals : data.studentSignals.filter((student) => student.signalType === activeFilter),
    [activeFilter, data.studentSignals],
  );

  return (
    <Card className="min-w-0 overflow-hidden border-primary-200/60 p-0">
      <CardHeader className="gap-4 border-b border-card-border p-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Học sinh ưu tiên</CardTitle>
            <Badge color="error">{data.studentSignals.length} tín hiệu</Badge>
          </div>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Chọn nhóm tín hiệu để biết học sinh nào cần được chăm sóc tiếp theo.
          </p>
        </div>
        <Link
          href="/director/students"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary-500 transition hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-button-primary-focus-ring"
        >
          Mở toàn bộ hồ sơ <ArrowRight size={13} />
        </Link>
      </CardHeader>

      <div className="flex flex-wrap gap-2 border-b border-card-border px-5 py-4" role="group" aria-label="Lọc nhóm tín hiệu học sinh">
        {filters.map((filter) => {
          const count = filter.key === "all"
            ? data.studentSignals.length
            : data.studentSignals.filter((student) => student.signalType === filter.key).length;

          return (
            <Button
              key={filter.key}
              variant="primary"
              appearance={activeFilter === filter.key ? "fill" : "outline"}
              size="sm"
              aria-pressed={activeFilter === filter.key}
              onPress={() => setActiveFilter(filter.key)}
              className="gap-2"
            >
              {filter.label}
              <span className={activeFilter === filter.key ? "text-button-primary-text/75" : "text-text-tertiary"}>{count}</span>
            </Button>
          );
        })}
      </div>

      {filteredStudents.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="bg-background-soft-50 text-[11px] text-text-tertiary">
              <tr>
                <th className="px-5 py-3 font-medium">Học sinh</th>
                <th className="px-3 py-3 font-medium">Tín hiệu</th>
                <th className="px-3 py-3 font-medium">Ngành quan tâm</th>
                <th className="px-3 py-3 font-medium">Giai đoạn</th>
                <th className="px-3 py-3 font-medium">Điểm tiềm năng</th>
                <th className="px-3 py-3 font-medium">Hành động tiếp theo</th>
                <th className="px-5 py-3 font-medium"><span className="sr-only">Thao tác</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {filteredStudents.map((student) => (
                <StudentSignalRow key={student.id} student={student} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-5 py-12 text-center">
          <p className="font-medium text-text-primary">Không có học sinh thuộc nhóm này</p>
          <p className="mt-1 text-sm text-text-tertiary">Hãy thử chọn một bộ lọc khác để tiếp tục theo dõi.</p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-card-border bg-background-soft-50 px-5 py-3 text-xs text-text-tertiary">
        <span>Đang hiển thị {filteredStudents.length}/{data.studentSignals.length} học sinh ưu tiên</span>
        <span className="inline-flex items-center gap-1"><ClockThree size={13} /> Cập nhật theo tương tác gần nhất</span>
      </div>
    </Card>
  );
}

function StudentSignalRow({ student }: { student: StudentSignal }) {
  const meta = signalMeta[student.signalType];

  return (
    <tr className="group transition hover:bg-background-soft-50">
      <td className="px-5 py-3.5">
        <Link
          href={`/director/students/${student.id}`}
          className="inline-flex min-w-44 items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-badge-primary-background text-[10px] font-semibold text-badge-primary-text">
            {student.name.split(" ").map((part) => part[0]).slice(-2).join("")}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-text-primary group-hover:text-primary-500">{student.name}</span>
            <span className="mt-0.5 block truncate text-[11px] text-text-tertiary">{student.concern}</span>
          </span>
        </Link>
      </td>
      <td className="px-3 py-3.5"><Badge color={meta.color}>{meta.label}</Badge></td>
      <td className="max-w-44 truncate px-3 py-3.5 font-medium text-text-secondary">{student.major}</td>
      <td className="px-3 py-3.5 text-text-secondary">{student.stage}</td>
      <td className="px-3 py-3.5">
        <div className="flex min-w-28 items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background-soft-200" aria-hidden="true">
            <div className="h-full rounded-full bg-primary-500" style={{ width: `${student.probability}%` }} />
          </div>
          <span className="inline-flex items-center gap-1 font-semibold text-text-primary"><CheckCircle1 size={13} className="text-success-500" />{student.probability}</span>
        </div>
      </td>
      <td className="max-w-48 truncate px-3 py-3.5 text-text-secondary">{nextActions[student.signalType]}</td>
      <td className="px-5 py-3.5 text-right">
        <Link href={`/director/students/${student.id}`} className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500">
          Mở hồ sơ <ArrowRight size={14} />
        </Link>
      </td>
    </tr>
  );
}
