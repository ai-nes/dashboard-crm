"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { Pagination } from "@/components/tailgrids/core/pagination";

import { leads as allLeads } from "./data";
import LeadList, { leadListGrid } from "./lead-list";
import LeadListToolbar from "./lead-list-toolbar";
import type { LeadStatus } from "./types";

const pageSize = 10;

export default function LeadsOverviewDashboard() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [page, setPage] = useState(1);

  const filteredLeads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return allLeads.filter((lead) => {
      const matchesQuery =
        !normalizedQuery ||
        lead.name.toLowerCase().includes(normalizedQuery) ||
        lead.phone.toLowerCase().includes(normalizedQuery) ||
        lead.school.toLowerCase().includes(normalizedQuery) ||
        lead.owner.toLowerCase().includes(normalizedQuery);
      const matchesStatus = status === "all" || lead.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status]);

  const totalCount = filteredLeads.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageLeads = filteredLeads.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

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
    <main id="main-content" className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6">
      <header className="flex flex-col gap-5 rounded-xl border border-card-border bg-card-background p-5 lg:flex-row lg:items-end lg:justify-between lg:p-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="primary">FAIP · Danh sách lead</Badge>
            <span className="text-xs text-text-tertiary">Dữ liệu tuyển sinh · Kỳ 2026</span>
          </div>
          <h1 className="mt-3 text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">
            Danh sách lead
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
            Toàn cảnh lead tiếp nhận trước khi được phân công cho đội ngũ sale.
          </p>
        </div>
      </header>

      <Card className="min-w-0 overflow-hidden p-0">
        <CardHeader className="border-b border-card-border p-5">
          <div>
            <CardTitle>Danh sách lead</CardTitle>
            <p className="mt-1 text-xs leading-5 text-text-tertiary">
              Theo dõi lead tiếp nhận, tình trạng và người phụ trách.
            </p>
          </div>
          <Badge color="primary">{totalCount}/{allLeads.length} lead</Badge>
        </CardHeader>
        <LeadListToolbar
          query={query}
          status={status}
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
        <LeadList leads={pageLeads} />

        {totalCount > 0 && (
          <div className="flex flex-col gap-3 border-t border-card-border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="shrink-0 whitespace-nowrap text-xs text-text-secondary">
              Hiển thị{" "}
              <span className="font-semibold text-text-primary">
                {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalCount)}
              </span>{" "}
              trong tổng số <span className="font-semibold text-text-primary">{totalCount}</span> lead
            </p>
            <div className="flex shrink-0 items-center justify-end max-sm:w-full">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(nextPage) => setPage(Math.min(Math.max(1, nextPage), totalPages))}
                variant="compact"
              />
            </div>
          </div>
        )}
      </Card>
    </main>
  );
}
