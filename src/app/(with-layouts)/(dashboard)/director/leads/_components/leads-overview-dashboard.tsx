"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { useState } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { Pagination } from "@/components/tailgrids/core/pagination";
import { useLeadSaleLeadsQuery } from "@/hooks/use-lead-sale-leads-queries";
import type { LeadListParams } from "@/services/api/lead-sale";

import LeadList, { leadListGrid } from "./lead-list";
import LeadListToolbar from "./lead-list-toolbar";
import type { LeadStatus } from "./types";

const pageSize = 10;

export default function LeadsOverviewDashboard() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [page, setPage] = useState(1);
  const listParams: LeadListParams = {
    admissionYear: 2026,
    page,
    pageSize,
    q: query || undefined,
    status: status === "all" ? undefined : status,
  };
  const {
    data: response,
    isError,
    error,
    isPending,
    isPlaceholderData,
  } = useLeadSaleLeadsQuery(listParams, { placeholderData: keepPreviousData });

  const leads = response?.data ?? [];
  const meta = response?.meta;
  const totalCount = meta?.total ?? 0;
  const totalPages = Math.max(
    1,
    meta?.totalPages ?? Math.ceil(totalCount / pageSize),
  );
  const currentPage = Math.min(page, totalPages);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const handleStatusChange = (value: LeadStatus | "all") => {
    setStatus(value);
    setPage(1);
  };

  const resetFilters = () => {
    setQuery("");
    setStatus("all");
    setPage(1);
  };

  return (
    <main
      id="main-content"
      className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6"
    >
      {isError && (
        <Card className="border-error-200 bg-badge-error-background p-4 text-error-600">
          <p className="text-sm font-semibold">
            Không thể tải danh sách Lead từ Frappe CRM
          </p>
          <p className="mt-1 text-xs">
            {error?.message || "Lỗi kết nối hoặc không có quyền truy cập."}
          </p>
        </Card>
      )}

      <header className="flex flex-col gap-5 rounded-xl border border-card-border bg-card-background p-5 lg:flex-row lg:items-end lg:justify-between lg:p-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="primary">FAIP · Danh sách Lead</Badge>
            <span className="text-xs text-text-tertiary">
              Dữ liệu tuyển sinh · Kỳ {meta?.admissionYear ?? 2026}
            </span>
          </div>
          <h1 className="mt-3 text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">
            Danh sách Lead
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
            Toàn cảnh Lead tiếp nhận trước khi được phân công cho đội ngũ Sale.
          </p>
        </div>
      </header>

      <Card className="min-w-0 overflow-hidden p-0">
        <CardHeader className="border-b border-card-border p-5">
          <div>
            <CardTitle>Danh sách Lead</CardTitle>
            <p className="mt-1 text-xs leading-5 text-text-tertiary">
              Theo dõi Lead tiếp nhận, tình trạng và người phụ trách.
            </p>
          </div>
          <Badge color="primary">{totalCount} Lead</Badge>
        </CardHeader>
        <LeadListToolbar
          query={query}
          status={status}
          statusOptions={meta?.statusOptions ?? []}
          resultCount={totalCount}
          onQueryChange={handleQueryChange}
          onStatusChange={handleStatusChange}
          onReset={resetFilters}
        />
        <div
          className={`hidden ${leadListGrid} items-center gap-4 border-b border-card-border bg-background-soft-50 px-5 py-3 text-xs font-medium text-text-tertiary lg:grid`}
          aria-hidden="true"
        >
          <span>Họ và Tên</span>
          <span>Di động</span>
          <span>Trường THPT</span>
          <span>Tình trạng Lead</span>
          <span>Nguồn</span>
          <span>Người phụ trách</span>
          <span className="text-center">Thao tác</span>
        </div>
        {isPending && !response ? (
          <div
            className="px-5 py-14 text-center text-sm text-text-tertiary"
            role="status"
          >
            Đang tải danh sách Lead…
          </div>
        ) : (
          <LeadList leads={leads} />
        )}

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
                Lead
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
                onPageChange={(nextPage) =>
                  setPage(Math.min(Math.max(1, nextPage), totalPages))
                }
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
