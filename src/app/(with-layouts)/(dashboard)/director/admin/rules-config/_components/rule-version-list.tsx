"use client";

import { Search1 } from "@tailgrids/icons";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";

import { Button } from "@/components/tailgrids/core/button";
import { Pagination } from "@/components/tailgrids/core/pagination";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { useCrmRuleVersionsQuery } from "@/hooks/use-rules-config-queries";
import type {
  CrmRuleStatus,
  CrmRuleVersion,
} from "@/services/api/rules-config";

import { RuleVersionStatusSelect } from "./rule-version-status-select";

const STATUS_TABS: Array<{ id: CrmRuleStatus | "all"; label: string }> = [
  { id: "all", label: "Tất cả" },
  { id: "draft", label: "Bản nháp" },
  { id: "testing", label: "Đang kiểm thử" },
  { id: "active", label: "Đang hoạt động" },
  { id: "archived", label: "Đã lưu trữ" },
];
const PAGE_SIZE = 8;

const formatDate = (date: string | null) => {
  if (!date) return "Chưa cập nhật";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(date));
};

export function RuleVersionList({ canEdit }: { canEdit: boolean }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CrmRuleStatus | "all">("all");
  const [page, setPage] = useState(1);
  const versionsQuery = useCrmRuleVersionsQuery({
    status: status === "all" ? undefined : status,
    search: search.trim() || undefined,
    start: (page - 1) * PAGE_SIZE,
    pageLength: PAGE_SIZE,
  });
  const versions = versionsQuery.data?.versions ?? [];
  const total = versionsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasVersionFilter = Boolean(search.trim()) || status !== "all";
  const tabs = STATUS_TABS.map((tab) => ({
    ...tab,
    count:
      tab.id === "all" ? total : tab.id === status ? total : null,
  }));

  const openVersion = (version: CrmRuleVersion) => {
    router.push(
      `/director/admin/rules-config/${encodeURIComponent(version.name)}`,
    );
  };

  return (
    <section
      aria-label="Danh sách Version"
      className="overflow-hidden rounded-2xl border border-card-border bg-card-background shadow-xs"
    >
      <Tabs
        selectedKey={status}
        onSelectionChange={(key) => {
          setStatus(String(key) as CrmRuleStatus | "all");
          setPage(1);
        }}
      >
        <div className="space-y-3 border-b border-card-border px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <InputGroup className="h-10 w-full sm:max-w-md">
              <InputGroupAddon
                align="inline-start"
                className="pr-0 text-text-tertiary"
              >
                <Search1 size={18} aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                type="search"
                aria-label="Tìm Version"
                placeholder="Tìm mã, tên Version hoặc mô tả..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="pl-2 text-sm"
              />
            </InputGroup>
            <span aria-live="polite" className="text-xs text-text-tertiary">
              {versions.length} / {total} Version
            </span>
          </div>
          <TabList
            aria-label="Lọc trạng thái Version"
            className="flex flex-wrap gap-1.5"
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                id={tab.id}
                className="group flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary outline-none hover:bg-background-gray-secondary_alt data-[selected]:bg-badge-primary-background data-[selected]:text-badge-primary-text data-[focus-visible]:outline-2 data-[focus-visible]:outline-primary-500"
              >
                {tab.label}
                <span className="rounded-md bg-background-gray-secondary px-1.5 py-0.5 text-xs tabular-nums group-data-[selected]:bg-badge-primary-background group-data-[selected]:text-badge-primary-text">
                  {tab.count ?? "—"}
                </span>
              </Tab>
            ))}
          </TabList>
        </div>
        <TabPanel
          id={status}
          className="outline-none focus-visible:outline-2 focus-visible:outline-primary-500"
        >
          {versionsQuery.isPending ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-lg bg-background-gray-secondary"
                />
              ))}
            </div>
          ) : null}
          {versionsQuery.error ? (
            <div className="p-8 text-center text-sm text-alert-danger-title">
              <p>{versionsQuery.error.message}</p>
              <Button
                type="button"
                size="sm"
                appearance="ghost"
                className="mt-3"
                onPress={() => void versionsQuery.refetch()}
              >
                Thử lại
              </Button>
            </div>
          ) : null}
          {!versionsQuery.isPending && !versionsQuery.error ? (
            <>
              <TableRoot
                fullBleed
                className="border-0"
                aria-label="Danh sách Version"
              >
                <TableHeader className="bg-background-gray-secondary">
                  <TableRow>
                    <TableHead scope="col" className="whitespace-nowrap">
                      Mã Version
                    </TableHead>
                    <TableHead scope="col" className="whitespace-nowrap">
                      Tên Version
                    </TableHead>
                    <TableHead scope="col" className="whitespace-nowrap">
                      Số Rule
                    </TableHead>
                    <TableHead scope="col" className="whitespace-nowrap">
                      Người tạo
                    </TableHead>
                    <TableHead scope="col" className="whitespace-nowrap">
                      Trạng thái
                    </TableHead>
                    <TableHead scope="col" className="whitespace-nowrap">
                      Cập nhật lần cuối
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {versions.map((version) => (
                    <TableRow
                      key={version.name}
                      tabIndex={0}
                      className="cursor-pointer hover:bg-background-gray-secondary_alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
                      onClick={() => openVersion(version)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openVersion(version);
                        }
                      }}
                    >
                      <TableCell className="whitespace-nowrap py-5 font-mono text-xs text-text-tertiary">
                        {version.versionId}
                      </TableCell>
                      <TableCell className="py-5 text-sm font-semibold text-primary-500">
                        {version.versionName}
                      </TableCell>
                      <TableCell className="py-5 text-sm tabular-nums text-text-secondary">
                        {version.rulesCount}
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-5 text-sm text-text-secondary">
                        {version.creator ?? "—"}
                      </TableCell>
                      <TableCell
                        className="py-5 text-sm"
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          <RuleVersionStatusSelect
                            version={version}
                            canEdit={canEdit}
                            onChanged={() => void versionsQuery.refetch()}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-5 text-sm text-text-secondary">
                        {formatDate(version.modified)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {versions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-16 text-center text-sm text-text-tertiary"
                      >
                        {!hasVersionFilter
                          ? "Chưa có Version nào. Tạo Version để bắt đầu."
                          : "Không tìm thấy Version phù hợp."}
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </TableRoot>
              {totalPages > 1 && (
                <div className="border-t border-card-border px-5 py-3">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    variant="compact"
                    isDisabled={versionsQuery.isFetching}
                  />
                </div>
              )}
            </>
          ) : null}
        </TabPanel>
      </Tabs>
    </section>
  );
}
