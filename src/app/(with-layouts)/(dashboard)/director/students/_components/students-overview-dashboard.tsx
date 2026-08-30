"use client";

import { Download1, Reload } from "@tailgrids/icons";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { Pagination } from "@/components/tailgrids/core/pagination";
import { useDirectorStudentsQuery } from "@/hooks/use-students-queries";
import type { StudentJourneyStage } from "@/services/api/students/types";

import StudentKpiStrip from "./student-kpi-strip";
import StudentList from "./student-list";
import StudentListToolbar from "./student-list-toolbar";

export default function StudentsOverviewDashboard() {
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<StudentJourneyStage | "all">("all");
  const [province, setProvince] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: response, isError, error, isFetching, refetch } = useDirectorStudentsQuery({
    admissionYear: 2026,
    page,
    pageSize,
    q: query || undefined,
    stage,
    province,
  });

  const students = response?.data ?? [];
  const summary = response?.summary;
  const meta = response?.meta;

  const totalCount = meta?.total ?? students.length;
  const totalAll = meta?.totalAll ?? totalCount;
  const totalPages = meta?.totalPages ?? Math.max(1, Math.ceil(totalCount / pageSize));

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setPage(1);
  };

  const handleStageChange = (val: StudentJourneyStage | "all") => {
    setStage(val);
    setPage(1);
  };

  const handleProvinceChange = (val: string) => {
    setProvince(val);
    setPage(1);
  };

  const resetFilters = () => {
    setQuery("");
    setStage("all");
    setProvince("all");
    setPage(1);
  };

  return (
    <main id="main-content" className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6">
      {isError && (
        <Card className="border-error-200 bg-badge-error-background p-4 text-error-600">
          <p className="font-semibold text-sm">Không thể tải dữ liệu từ Frappe CRM API</p>
          <p className="mt-1 text-xs">{error?.message || "Lỗi kết nối hoặc không có quyền truy cập (403 Forbidden)."}</p>
        </Card>
      )}

      <header className="flex flex-col gap-5 rounded-xl border border-card-border bg-card-background p-5 lg:flex-row lg:items-end lg:justify-between lg:p-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="primary">FAIP · Student 360°</Badge>
            <span className="text-xs text-text-tertiary">Dữ liệu tuyển sinh · Kỳ {meta?.admissionYear ?? 2026}</span>
          </div>
          <h1 className="mt-3 text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">Hồ sơ học sinh 360°</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">Từ toàn cảnh tệp học sinh đến hành động tiếp theo cho từng hồ sơ.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            appearance="outline"
            onPress={() => {
              refetch();
              toast.success("Đang làm mới dữ liệu từ CRM...");
            }}
            isDisabled={isFetching}
          >
            <Reload size={15} className={isFetching ? "animate-spin" : ""} />
            Làm mới
          </Button>
          <Button size="sm" appearance="outline" onPress={() => toast.success("Đã tạo bản xuất danh sách học sinh.")}>
            <Download1 size={16} />
            Xuất danh sách
          </Button>
        </div>
      </header>

      <StudentKpiStrip summary={summary} />

      <Card className="min-w-0 overflow-hidden p-0">
        <CardHeader className="border-b border-card-border p-5"><div><CardTitle>Danh sách học sinh</CardTitle><p className="mt-1 text-xs leading-5 text-text-tertiary">Ưu tiên theo điểm tiềm năng, giai đoạn hành trình và hành động gần nhất.</p></div><Badge color="primary">{totalCount}/{totalAll} hồ sơ</Badge></CardHeader>
        <StudentListToolbar query={query} stage={stage} province={province} resultCount={totalCount} onQueryChange={handleQueryChange} onStageChange={handleStageChange} onProvinceChange={handleProvinceChange} onReset={resetFilters} />
        <div className="hidden grid-cols-[minmax(240px,1.35fr)_130px_minmax(140px,0.75fr)_minmax(210px,1.15fr)_84px] items-center gap-4 border-b border-card-border bg-background-soft-50 px-5 py-3 text-xs font-medium text-text-tertiary lg:grid" aria-hidden="true">
          <span>Học sinh</span>
          <span className="text-center">Giai đoạn</span>
          <span>Điểm tiềm năng</span>
          <span>Hành động gần nhất</span>
          <span />
        </div>
        <StudentList students={students} />

        {totalCount > 0 && (
          <div className="flex flex-col gap-3 border-t border-card-border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="shrink-0 whitespace-nowrap text-xs text-text-secondary">
              Hiển thị <span className="font-semibold text-text-primary">{(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalCount)}</span> trong tổng số <span className="font-semibold text-text-primary">{totalCount}</span> hồ sơ
            </p>
            <div className="flex shrink-0 items-center justify-end max-sm:w-full">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                variant="compact"
              />
            </div>
          </div>
        )}
      </Card>
    </main>
  );
}
