"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/components/common/auth/auth-provider";
import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { Pagination } from "@/components/tailgrids/core/pagination";
import { useDirectorStudentsQuery } from "@/hooks/use-students-queries";
import type { StudentJourneyStage } from "@/services/api/students/types";

import StudentKpiStrip from "./student-kpi-strip";
import StudentList, { studentListGrid } from "./student-list";
import StudentListToolbar from "./student-list-toolbar";

export default function StudentsOverviewDashboard() {
  const { user } = useAuth();
  const isLeadSale = user?.roles?.includes("Lead Sales") ?? false;
  const pageTitle = isLeadSale ? "Danh sách học sinh" : "Hồ sơ học sinh 360°";
  const searchParams = useSearchParams();
  const ownerId = searchParams.get("owner")?.trim() || undefined;
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<StudentJourneyStage | "all">("all");
  const [province, setProvince] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const {
    data: response,
    isError,
    error,
    isPlaceholderData,
  } = useDirectorStudentsQuery(
    {
      admissionYear: 2026,
      page,
      pageSize,
      q: query || undefined,
      stage,
      province,
      ownerId,
    },
    { placeholderData: keepPreviousData },
  );

  const students = response?.data ?? [];
  const summary = response?.summary;
  const meta = response?.meta;

  const totalCount = meta?.total ?? students.length;
  const totalAll = meta?.totalAll ?? totalCount;
  const totalPages = Math.max(
    1,
    meta?.totalPages ?? Math.ceil(totalCount / pageSize),
  );
  const currentPage = meta ? Math.min(page, totalPages) : page;

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

  const handlePageChange = (nextPage: number) => {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
  };

  return (
    <main
      id="main-content"
      className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6"
    >
      {isError && (
        <Card className="border-error-200 bg-badge-error-background p-4 text-error-600">
          <p className="font-semibold text-sm">
            Không thể tải dữ liệu từ Frappe CRM API
          </p>
          <p className="mt-1 text-xs">
            {error?.message ||
              "Lỗi kết nối hoặc không có quyền truy cập (403 Forbidden)."}
          </p>
        </Card>
      )}

      <header className="flex flex-col gap-5 rounded-xl border border-card-border bg-card-background p-5 lg:flex-row lg:items-end lg:justify-between lg:p-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="primary">FAIP · {pageTitle}</Badge>
            <span className="text-xs text-text-tertiary">
              Dữ liệu tuyển sinh · Kỳ {meta?.admissionYear ?? 2026}
            </span>
          </div>
          <h1 className="mt-3 text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">
            {pageTitle}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
            Từ toàn cảnh tệp học sinh đến hành động tiếp theo cho từng hồ sơ.
          </p>
        </div>
      </header>

      <StudentKpiStrip summary={summary} />

      <Card className="min-w-0 overflow-hidden p-0">
        <CardHeader className="border-b border-card-border p-5">
          <div>
            <CardTitle>Danh sách học sinh</CardTitle>
            <p className="mt-1 text-xs leading-5 text-text-tertiary">
              Theo dõi hồ sơ, trạng thái, mức độ ưu tiên và hành động tiếp theo
              của từng học sinh.
            </p>
          </div>
          <Badge color="primary">
            {totalCount}/{totalAll} hồ sơ
          </Badge>
        </CardHeader>
        <StudentListToolbar
          query={query}
          stage={stage}
          province={province}
          resultCount={totalCount}
          onQueryChange={handleQueryChange}
          onStageChange={handleStageChange}
          onProvinceChange={handleProvinceChange}
          onReset={resetFilters}
        />
        <div
          className={`hidden ${studentListGrid} items-center gap-4 border-b border-card-border bg-background-soft-50 px-5 py-3 text-xs font-medium text-text-tertiary lg:grid`}
          aria-hidden="true"
        >
          <span>Họ tên · THPT · Quê quán</span>
          <span>Ngành quan tâm</span>
          <span>Trạng thái</span>
          <span>Điểm tiềm năng</span>
          <span>Người phụ trách</span>
          <span className="text-center">Thao tác</span>
        </div>
        <StudentList students={students} ownerEditable={isLeadSale} />

        {totalCount > 0 && (
          <div className="flex flex-col gap-3 border-t border-card-border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <p className="shrink-0 whitespace-nowrap text-xs text-text-secondary">
                Hiển thị{" "}
                <span className="font-semibold text-text-primary">
                  {(currentPage - 1) * pageSize + 1}–
                  {Math.min(currentPage * pageSize, totalCount)}
                </span>{" "}
                trong tổng số{" "}
                <span className="font-semibold text-text-primary">
                  {totalCount}
                </span>{" "}
                hồ sơ
              </p>
              {isPlaceholderData && (
                <span className="text-xs text-text-tertiary" role="status">
                  Đang tải trang…
                </span>
              )}
            </div>
            <div className="flex shrink-0 items-center justify-end max-sm:w-full">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                variant="compact"
                isDisabled={isPlaceholderData}
              />
            </div>
          </div>
        )}
      </Card>
    </main>
  );
}
