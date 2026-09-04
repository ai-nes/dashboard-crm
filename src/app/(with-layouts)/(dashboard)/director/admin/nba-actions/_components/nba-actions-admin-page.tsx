"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Breadcrumbs } from "@/components/tailgrids/core/breadcrumbs";
import { Badge } from "@/components/tailgrids/core/badge";
import { useAuth } from "@/components/common/auth/auth-provider";
import { hasCrmRole } from "@/components/common/auth/rbac";
import {
  useNbaActionTypesQuery,
  useNbaActionsQuery,
  useNbaTimeSlotsQuery,
  useUpdateNbaActionMutation,
} from "@/hooks/use-nba-actions-queries";
import {
  ACTION_TIME_SLOTS,
  type ActionTimeSlot,
  type NbaAction,
} from "@/services/api/nba-actions";

import NbaActionConfigPanel from "./nba-action-config-panel";
import NbaActionListPanel from "./nba-action-list-panel";
import type { EnabledFilter } from "./types";

const PAGE_SIZE = 20;

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
  const [debouncedSearch, setDebouncedSearch] = useState(
    searchParams.get("search") ?? "",
  );
  const [actionType, setActionType] = useState(
    searchParams.get("action_type") ?? "all",
  );
  const [enabled, setEnabled] = useState<EnabledFilter>(
    (searchParams.get("enabled") as EnabledFilter | null) ?? "all",
  );
  const [page, setPage] = useState(parsePage(searchParams.get("page")));
  const [selectedActionName, setSelectedActionName] = useState<string | null>(null);
  const [draftSlots, setDraftSlots] = useState<Record<string, ActionTimeSlot[]>>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  const updateQuery = useCallback(
    (changes: Record<string, string | undefined>) => {
      const nextParams = new URLSearchParams(searchParams.toString());
      Object.entries(changes).forEach(([key, value]) => {
        if (value === undefined || value === "") nextParams.delete(key);
        else nextParams.set(key, value);
      });
      const query = nextParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

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

  const actionsParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      actionType: actionType === "all" ? undefined : actionType,
      enabled:
        enabled === "all" ? undefined : enabled === "enabled" ? true : false,
      start: (page - 1) * PAGE_SIZE,
      pageLength: PAGE_SIZE,
    }),
    [actionType, debouncedSearch, enabled, page],
  );

  const actionsQuery = useNbaActionsQuery(actionsParams);
  const actionTypesQuery = useNbaActionTypesQuery();
  const timeSlotsQuery = useNbaTimeSlotsQuery();
  const updateMutation = useUpdateNbaActionMutation();

  const rawActions = actionsQuery.data?.actions ?? [];
  const actions = rawActions.map((action) => ({
    ...action,
    allowedTimeSlots: draftSlots[action.name] ?? action.allowedTimeSlots,
  }));
  const effectiveSelectedActionName = actions.some(
    (action) => action.name === selectedActionName,
  )
    ? selectedActionName
    : (actions[0]?.name ?? null);
  const selectedAction =
    actions.find((action) => action.name === effectiveSelectedActionName) ?? null;

  const total = actionsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const availableTimeSlots = timeSlotsQuery.data?.timeSlots ?? ACTION_TIME_SLOTS.slice();
  const isTimeSlotsReady = Boolean(timeSlotsQuery.data?.timeSlots.length);

  const handleFilterChange = (change: Record<string, string | undefined>) => {
    setPage(1);
    updateQuery({ ...change, page: "1" });
  };

  const handleActionTypeChange = (value: string) => {
    setActionType(value);
    handleFilterChange({ action_type: value === "all" ? undefined : value });
  };

  const handleEnabledChange = (value: EnabledFilter) => {
    setEnabled(value);
    handleFilterChange({ enabled: value === "all" ? undefined : value });
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    updateQuery({ page: nextPage === 1 ? undefined : String(nextPage) });
  };

  const handleReset = () => {
    setSearch("");
    setDebouncedSearch("");
    setActionType("all");
    setEnabled("all");
    setPage(1);
    updateQuery({ search: undefined, action_type: undefined, enabled: undefined, page: undefined });
  };

  const handleUnlimitedChange = (isUnlimited: boolean) => {
    if (!selectedAction || !canEdit) return;
    const nextSlots = isUnlimited ? [] : availableTimeSlots.slice();
    void saveTimeSlots(selectedAction, nextSlots);
  };

  const handleSlotChange = (slot: ActionTimeSlot, isSelected: boolean) => {
    if (!selectedAction || !canEdit || selectedAction.allowedTimeSlots.length === 0) return;
    const nextSlots = isSelected
      ? Array.from(new Set([...selectedAction.allowedTimeSlots, slot]))
      : selectedAction.allowedTimeSlots.filter((item) => item !== slot);

    if (nextSlots.length === 0) {
      toast.error("Bật Không giới hạn giờ nếu không muốn giới hạn Action.");
      return;
    }

    void saveTimeSlots(selectedAction, nextSlots);
  };

  const saveTimeSlots = async (action: NbaAction, nextSlots: ActionTimeSlot[]) => {
    const previousSlots = action.allowedTimeSlots;
    setDraftSlots((current) => ({ ...current, [action.name]: nextSlots }));
    setSaveError(null);

    try {
      await updateMutation.mutateAsync({
        name: action.name,
        allowedTimeSlots: nextSlots,
      });
      toast.success(`Đã lưu khung giờ cho ${action.code}.`);
    } catch (error) {
      setDraftSlots((current) => ({ ...current, [action.name]: previousSlots }));
      const message =
        error instanceof Error
          ? error.message
          : "Không thể lưu khung giờ. Vui lòng thử lại.";
      setSaveError(message);
      toast.error(message);
    }
  };

  const listError = actionsQuery.error;

  return (
    <main className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6">
      <header className="flex flex-col gap-4 rounded-xl border border-card-border bg-card-background p-5 lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Badge color="primary">NBA · CẤU HÌNH</Badge>
            <h1 className="mt-3 text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">
              Quản lý Action NBA
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
              Cấu hình khung giờ để AI đề xuất đúng thời điểm và tránh các hành động ngoài giờ phù hợp.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 lg:items-end">
            <Breadcrumbs
              dividerType="chevron"
              items={[
                { href: "/", label: "Tổng quan" },
                { href: "/director/admin/nba-actions", label: "Cấu hình Action NBA" },
              ]}
            />
            <span className="text-xs text-text-tertiary">
              Múi giờ theo cấu hình hệ thống CRM
            </span>
          </div>
        </div>
      </header>

      {listError ? (
        <section className="rounded-xl border border-alert-danger-border bg-alert-danger-background p-5" role="alert">
          <p className="text-sm font-medium text-alert-danger-title">
            Không tải được danh sách Action NBA.
          </p>
          <p className="mt-1 text-sm leading-6 text-alert-danger-description">
            {listError.message || "Vui lòng thử lại sau."}
          </p>
          <button
            type="button"
            onClick={() => void actionsQuery.refetch()}
            className="mt-3 rounded-lg border border-button-error-outline-stroke px-3 py-2 text-sm font-medium text-button-error-outline-text transition hover:bg-button-error-outline-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            Thử lại
          </button>
        </section>
      ) : (
        <section
          className="grid min-w-0 gap-5 xl:grid-cols-[minmax(18rem,26rem)_minmax(0,1fr)]"
          aria-label="Không gian cấu hình Action NBA"
        >
          <NbaActionListPanel
            actions={actions}
            selectedActionName={effectiveSelectedActionName}
            onSelectAction={(name) => {
              setSelectedActionName(name);
              setSaveError(null);
            }}
            search={search}
            onSearchChange={setSearch}
            actionType={actionType}
            onActionTypeChange={handleActionTypeChange}
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
          />
          <NbaActionConfigPanel
            action={selectedAction}
            availableTimeSlots={availableTimeSlots}
            canEdit={canEdit}
            isLoading={actionsQuery.isPending}
            isTimeSlotsReady={isTimeSlotsReady}
            timeSlotsError={Boolean(timeSlotsQuery.error)}
            isSaving={updateMutation.isPending}
            saveError={saveError}
            onUnlimitedChange={handleUnlimitedChange}
            onSlotChange={handleSlotChange}
          />
        </section>
      )}
    </main>
  );
}
