"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Badge } from "@/components/tailgrids/core/badge";
import { useAuth } from "@/components/common/auth/auth-provider";
import { hasCrmRole } from "@/components/common/auth/rbac";
import { useNbaActionTypesQuery, useNbaActionsQuery, useNbaTimeSlotsQuery } from "@/hooks/use-nba-actions-queries";
import { ACTION_TIME_SLOTS } from "@/services/api/nba-actions";

import NbaActionsTable from "./nba-actions-table";
import NbaAdminTabs from "./nba-admin-tabs";
import { NBA_ACTION_PAGE_SIZE, type ChannelFilter, type EnabledFilter } from "./types";

const PAGE_SIZE = NBA_ACTION_PAGE_SIZE;

function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default function NbaActionsAdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const canEdit = hasCrmRole(user?.roles, "System Manager");

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search") ?? "");
  const [actionType, setActionType] = useState(searchParams.get("action_type") ?? "all");
  const [channel, setChannel] = useState<ChannelFilter>((searchParams.get("channel") as ChannelFilter | null) ?? "all");
  const [enabled, setEnabled] = useState<EnabledFilter>((searchParams.get("enabled") as EnabledFilter | null) ?? "all");
  const [page, setPage] = useState(parsePage(searchParams.get("page")));
  const [selectedActionName, setSelectedActionName] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const updateQuery = useCallback((changes: Record<string, string | undefined>) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => {
      if (value === undefined || value === "") nextParams.delete(key);
      else nextParams.set(key, value);
    });
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextSearch = search.trim();
      if (nextSearch === debouncedSearch) return;
      setDebouncedSearch(nextSearch);
      setPage(1);
      updateQuery({ search: nextSearch || undefined, page: "1" });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [debouncedSearch, search, updateQuery]);

  const actionsParams = useMemo(() => ({
    search: debouncedSearch || undefined,
    actionType: actionType === "all" ? undefined : actionType,
    channel: channel === "all" ? undefined : channel,
    enabled: enabled === "all" ? undefined : enabled === "enabled",
    start: (page - 1) * PAGE_SIZE,
    pageLength: PAGE_SIZE,
  }), [actionType, channel, debouncedSearch, enabled, page]);

  const actionsQuery = useNbaActionsQuery(actionsParams);
  const actionTypesQuery = useNbaActionTypesQuery();
  const timeSlotsQuery = useNbaTimeSlotsQuery();
  const actions = actionsQuery.data?.actions ?? [];
  const total = actionsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const availableTimeSlots = timeSlotsQuery.data?.timeSlots ?? ACTION_TIME_SLOTS.slice();
  const isTimeSlotsReady = Boolean(timeSlotsQuery.data?.timeSlots.length);

  const handleFilterChange = (change: Record<string, string | undefined>) => {
    setPage(1);
    updateQuery({ ...change, page: "1" });
  };
  const handleActionTypeChange = (value: string) => { setActionType(value); handleFilterChange({ action_type: value === "all" ? undefined : value }); };
  const handleEnabledChange = (value: EnabledFilter) => { setEnabled(value); handleFilterChange({ enabled: value === "all" ? undefined : value }); };
  const handleChannelChange = (value: ChannelFilter) => { setChannel(value); handleFilterChange({ channel: value === "all" ? undefined : value }); };
  const handlePageChange = (nextPage: number) => { setPage(nextPage); updateQuery({ page: nextPage === 1 ? undefined : String(nextPage) }); };
  const handleReset = () => {
    setSearch("");
    setDebouncedSearch("");
    setActionType("all");
    setChannel("all");
    setEnabled("all");
    setPage(1);
    updateQuery({ search: undefined, action_type: undefined, channel: undefined, enabled: undefined, page: undefined });
  };

  return (
    <main className="min-w-0 space-y-6 px-2 py-4 pb-8 lg:px-6">
      <header className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-primary-500"><span className="size-2 rounded-full bg-primary-500" aria-hidden="true" /><span>NBA</span><Badge color={canEdit ? "success" : "gray"}>{canEdit ? "System Manager" : "Chỉ xem"}</Badge></div>
            <h1 className="mt-2 text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">Quản lý cấu hình NBA</h1>
            <p className="mt-2 text-sm leading-6 text-text-secondary">Quản lý hành động, nhóm hành động, chính sách thời gian và quy tắc đề xuất cho từng hồ sơ tuyển sinh.</p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-text-secondary lg:items-end lg:justify-end"><span className="text-xs text-text-tertiary">Các cấu hình được đồng bộ trực tiếp với Frappe CRM</span><p><span className="font-semibold text-text-primary">{total || "—"}</span> hành động trong quy trình tuyển sinh</p></div>
        </div>
      </header>

      <NbaAdminTabs
        actionCount={total}
        canEdit={canEdit}
        actionsPanel={
          actionsQuery.error ? (
            <section className="rounded-xl border border-alert-danger-border bg-alert-danger-background p-5" role="alert">
              <p className="text-sm font-medium text-alert-danger-title">Không tải được danh sách hành động NBA.</p>
              <p className="mt-1 text-sm leading-6 text-alert-danger-description">{actionsQuery.error.message || "Hãy thử lại sau."}</p>
              <button type="button" onClick={() => void actionsQuery.refetch()} className="mt-3 rounded-lg border border-button-error-outline-stroke px-3 py-2 text-sm font-medium text-button-error-outline-text transition hover:bg-button-error-outline-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500">Thử lại</button>
            </section>
          ) : (
            <NbaActionsTable
              actions={actions}
              selectedActionName={selectedActionName}
              isCreateOpen={isCreateOpen}
              onSelectAction={(name) => setSelectedActionName(name)}
              onCreateAction={() => { setSelectedActionName(null); setIsCreateOpen(true); }}
              onCloseCreate={() => setIsCreateOpen(false)}
              search={search}
              onSearchChange={setSearch}
              actionType={actionType}
              onActionTypeChange={handleActionTypeChange}
              channel={channel}
              onChannelChange={handleChannelChange}
              enabled={enabled}
              onEnabledChange={handleEnabledChange}
              actionTypes={actionTypesQuery.data?.actionTypes ?? []}
              total={total}
              resultCount={actions.length}
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isLoading={actionsQuery.isPending}
              isFetching={actionsQuery.isFetching}
              onReset={handleReset}
              availableTimeSlots={availableTimeSlots}
              canEdit={canEdit}
              isTimeSlotsReady={isTimeSlotsReady}
              timeSlotsError={Boolean(timeSlotsQuery.error)}
            />
          )
        }
      />
    </main>
  );
}
