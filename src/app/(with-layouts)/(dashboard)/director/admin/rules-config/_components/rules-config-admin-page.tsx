"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ChevronDown, Plus } from "@tailgrids/icons";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import AdminPageHeader from "@/components/common/admin/admin-page-header";
import { useAuth } from "@/components/common/auth/auth-provider";
import { canManageCrmRules } from "@/components/common/auth/permissions";
import { DeleteRecordDialog } from "@/components/common/delete-record-dialog";
import { canEditRulesInVersion } from "@/components/rules/rule-admin-edit-policy";
import { CrmRuleStatusBadge } from "@/components/rules/rule-status-badges";
import { Button } from "@/components/tailgrids/core/button";
import {
  TabContent,
  TabList,
  TabRoot,
  TabTrigger,
} from "@/components/tailgrids/core/tabs";
import {
  useCrmRuleGroupsQuery,
  useCrmRulesQuery,
  useCrmRuleVersionQuery,
  useCrmRuleVersionsQuery,
  useDeleteCrmRuleMutation,
  useSetCrmRuleEnabledMutation,
} from "@/hooks/use-rules-config-queries";
import type {
  CrmRule,
  CrmRuleFeatureScope,
  CrmRuleGateOutcome,
  CrmRuleStatus,
  CrmRuleType,
} from "@/services/api/rules-config";

import { RuleListToolbar } from "./rule-list-toolbar";
import { RuleGroupTabs } from "./rule-group-tabs";
import RuleVersionActions from "./rule-version-actions";
import RulesConfigTable from "./rules-config-table";

const RULES_PAGE_SIZE = 8;

const formatDate = (date: string | null | undefined, includeTime = false) => {
  if (!date) return "Chưa có dữ liệu";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(date));
};

export default function RulesConfigAdminPage({
  embedded = false,
  versionName: routeVersionName,
}: {
  embedded?: boolean;
  versionName?: string;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const canEdit = canManageCrmRules(user);
  const requestedVersion =
    routeVersionName ?? searchParams.get("version") ?? "";
  const requestedGroup = searchParams.get("group") ?? "all";
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CrmRuleStatus | "all">("all");
  const [featureScope, setFeatureScope] = useState<CrmRuleFeatureScope | "all">(
    "all",
  );
  const [ruleType, setRuleType] = useState<CrmRuleType | "all">("all");
  const [gateOutcome, setGateOutcome] = useState<CrmRuleGateOutcome | "all">(
    "all",
  );
  const [page, setPage] = useState(1);
  const [isCreateVersionOpen, setIsCreateVersionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("manage");
  const [ruleToDelete, setRuleToDelete] = useState<CrmRule | null>(null);
  const [isRuleActionPending, setIsRuleActionPending] = useState(false);
  const ruleActionLock = useRef(false);
  const deleteMutation = useDeleteCrmRuleMutation();
  const enabledMutation = useSetCrmRuleEnabledMutation();

  const versionsQuery = useCrmRuleVersionsQuery({ start: 0, pageLength: 100 });
  const versions = versionsQuery.data?.versions ?? [];
  const listedVersion =
    requestedVersion && versions.length > 0
      ? versions.find(
          (version) =>
            version.name === requestedVersion ||
            version.versionId === requestedVersion,
        ) ?? null
      : versions[0] ?? null;
  const versionLookup = listedVersion?.name ?? requestedVersion;
  const versionQuery = useCrmRuleVersionQuery(versionLookup, {
    enabled: Boolean(versionLookup),
  });
  const currentVersion = versionQuery.data ?? listedVersion;
  const versionName =
    currentVersion?.name ?? versionLookup;
  const activeVersion = currentVersion;
  const isDraft = activeVersion?.status === "draft";
  const isActive = activeVersion?.status === "active";
  const canMutateRules = canEdit && canEditRulesInVersion(activeVersion?.status);
  const groupsQuery = useCrmRuleGroupsQuery(versionName, {
    enabled: Boolean(versionName),
  });
  const groups = groupsQuery.data ?? versionQuery.data?.groups ?? [];
  const ruleGroup = requestedGroup;
  const rulesQuery = useCrmRulesQuery(
    {
      versionName,
      ruleGroup: ruleGroup === "all" ? undefined : ruleGroup,
      search: search.trim() || undefined,
      status: status === "all" ? undefined : status,
      featureScope: featureScope === "all" ? undefined : featureScope,
      ruleType: ruleType === "all" ? undefined : ruleType,
      gateOutcome: gateOutcome === "all" ? undefined : gateOutcome,
      start: (page - 1) * RULES_PAGE_SIZE,
      pageLength: RULES_PAGE_SIZE,
    },
    { enabled: Boolean(versionName) },
  );

  const rules = rulesQuery.data?.rules ?? [];
  const totalRules = rulesQuery.data?.total ?? 0;
  const totalRulePages = Math.max(1, Math.ceil(totalRules / RULES_PAGE_SIZE));

  const updateContext = (nextVersion?: string, nextGroup?: string) => {
    if (nextVersion !== versionName) setPage(1);
    const next = new URLSearchParams(searchParams.toString());
    if (nextVersion) next.set("version", nextVersion);
    else next.delete("version");
    if (nextGroup) next.set("group", nextGroup);
    else next.delete("group");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const beginRuleAction = () => {
    if (ruleActionLock.current) return false;
    ruleActionLock.current = true;
    setIsRuleActionPending(true);
    return true;
  };

  const endRuleAction = () => {
    ruleActionLock.current = false;
    setIsRuleActionPending(false);
  };

  const setRuleGroup = (value: string) => {
    setPage(1);
    updateContext(versionName, value === "all" ? undefined : value);
  };

  const openCreateRule = (groupId = "") => {
    const params = new URLSearchParams({ version: versionName });
    if (groupId) params.set("group", groupId);
    router.push(`/director/admin/rules-config/create?${params.toString()}`);
  };

  const openEditRule = (rule: CrmRule) => {
    router.push(
      `/director/admin/rules-config/edit/${encodeURIComponent(rule.name)}?version=${encodeURIComponent(versionName)}`,
    );
  };

  const handleConfirmDelete = async () => {
    if (!ruleToDelete || !canMutateRules) return;
    const expectedVersionRevision = (versionQuery.data ?? currentVersion)
      ?.revision;
    if (expectedVersionRevision === undefined) return;

    try {
      await deleteMutation.mutateAsync({
        name: ruleToDelete.name,
        expectedVersionRevision,
      });
      setRuleToDelete(null);
      toast.success(
        isActive
          ? "Đã xóa Rule khỏi Version Active. Thay đổi có hiệu lực ngay."
          : "Đã xóa Rule khỏi bản nháp.",
      );
    } catch (deleteError) {
      toast.error(
        deleteError instanceof Error
          ? deleteError.message
          : "Không thể xóa Rule.",
      );
    }
  };

  const handleToggleRule = async (rule: CrmRule) => {
    if (
      !canMutateRules ||
      !activeVersion ||
      !beginRuleAction()
    ) {
      return;
    }

    try {
      await enabledMutation.mutateAsync({
        name: rule.name,
        expectedVersionRevision: versionQuery.data?.revision ?? activeVersion.revision,
        enabled: !rule.enabled,
      });
      toast.success(
        isActive
          ? `Đã ${rule.enabled ? "tắt" : "bật"} Rule. Thay đổi có hiệu lực ngay.`
          : `Đã ${rule.enabled ? "tắt" : "bật"} Rule trong bản nháp.`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật trạng thái Rule.");
    } finally {
      endRuleAction();
    }
  };

  const versionBar = (
    <div className="flex flex-col gap-3 rounded-xl border border-card-border bg-card-background px-4 py-3 shadow-xs sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          Version
          <span className="relative inline-flex">
            <select
              aria-label="Chọn Version CRM Rule"
              className="h-9 min-w-48 appearance-none rounded-lg border border-card-border bg-input-background py-0 pr-9 pl-3 text-sm text-title-50 outline-none focus:border-input-primary-focus-border focus:ring-4 focus:ring-input-primary-focus-border/20"
              disabled={versionsQuery.isPending || versions.length === 0}
              value={versionName}
              onChange={(event) => updateContext(event.target.value)}
            >
              {versions.length === 0 ? (
                <option value="">Chưa có Version</option>
              ) : null}
              {versions.map((version) => (
                <option key={version.name} value={version.name}>
                  {version.versionName} · {version.status}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-text-tertiary"
            />
          </span>
        </label>
        {activeVersion ? (
          <div className="flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
            <CrmRuleStatusBadge status={activeVersion.status} />
            <span>Revision {activeVersion.revision}</span>
            <span>{activeVersion.rulesCount} Rule</span>
          </div>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <RuleVersionActions
          key={`${isCreateVersionOpen ? "create-version-" : "selected-version-"}${versionName}`}
          version={versionQuery.data ?? currentVersion}
          canEdit={canEdit}
          openCreate={isCreateVersionOpen}
          onCreateOpenChange={setIsCreateVersionOpen}
          onCreated={(created) => {
            void versionsQuery.refetch().then(() => {
              setIsCreateVersionOpen(false);
              updateContext(created.name);
            });
          }}
          onChanged={() => {
            void versionsQuery.refetch();
            void versionQuery.refetch();
            void groupsQuery.refetch();
            void rulesQuery.refetch();
          }}
        />
      </div>
    </div>
  );

  const listCard = (
    <section className="overflow-hidden rounded-2xl border border-card-border bg-card-background shadow-xs">
      <RuleListToolbar
        totalCount={totalRules}
        filteredCount={rules.length}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        status={status}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        featureScope={featureScope}
        onFeatureScopeChange={(value) => {
          setFeatureScope(value);
          setPage(1);
        }}
        ruleType={ruleType}
        onRuleTypeChange={(value) => {
          setRuleType(value);
          setPage(1);
        }}
        gateOutcome={gateOutcome}
        onGateOutcomeChange={(value) => {
          setGateOutcome(value);
          setPage(1);
        }}
        canCreate={canMutateRules}
        onCreate={() => openCreateRule(ruleGroup !== "all" ? ruleGroup : "")}
      >
        <RulesConfigTable
          rules={rules}
          total={totalRules}
          isLoading={
            groupsQuery.isPending ||
            versionQuery.isPending ||
            rulesQuery.isPending ||
            rulesQuery.isFetching
          }
          canDelete={canMutateRules}
          canToggle={canMutateRules}
          isDeleteDisabled={
            deleteMutation.isPending ||
            enabledMutation.isPending ||
            isRuleActionPending
          }
          onSelect={openEditRule}
          onDelete={setRuleToDelete}
          onToggle={handleToggleRule}
          currentPage={page}
          totalPages={totalRulePages}
          onPageChange={setPage}
        />
      </RuleListToolbar>
    </section>
  );

  const content = (
    <div className="space-y-4">
      {isActive && canEdit ? (
        <p
          role="alert"
          className="rounded-xl border border-card-border bg-background-gray-secondary px-4 py-3 text-sm text-text-secondary"
        >
          Bạn đang thao tác trên Version Active. Tạo, sửa, bật/tắt hoặc xóa Rule sẽ có hiệu lực ngay; quản lý
          nhóm Rule và thông tin Version vẫn chỉ cho phép trong Draft.
        </p>
      ) : null}
      {versionsQuery.error ? (
        <section
          className="rounded-xl border border-alert-danger-border bg-alert-danger-background p-4"
          role="alert"
        >
          <p className="text-sm font-medium text-alert-danger-title">
            Không tải được Version Rule.
          </p>
          <p className="mt-1 text-sm text-alert-danger-description">
            {versionsQuery.error.message}
          </p>
          <button
            type="button"
            className="mt-3 text-sm font-semibold text-primary-500 hover:underline"
            onClick={() => void versionsQuery.refetch()}
          >
            Thử lại
          </button>
        </section>
      ) : null}

      {!routeVersionName ? versionBar : null}

      {!currentVersion && !versionsQuery.isPending ? (
        <div className="rounded-2xl border border-dashed border-card-border bg-card-surface-area p-10 text-center">
          <h3 className="text-base font-semibold text-title-50">
            Chưa có Rule Version
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">
            Tạo Version bản nháp trước, sau đó thêm các Rule để phát hành.
          </p>
        </div>
      ) : null}

      {currentVersion ? (
        <RuleGroupTabs
          groups={groups}
          selectedGroup={ruleGroup}
          onGroupChange={setRuleGroup}
          isLoading={groupsQuery.isPending || versionQuery.isPending}
          canEdit={canEdit && isDraft}
          versionName={versionName}
          versionRevision={
            versionQuery.data?.revision ?? currentVersion.revision
          }
          onChanged={() => {
            void versionsQuery.refetch();
            void versionQuery.refetch();
            void groupsQuery.refetch();
            void rulesQuery.refetch();
          }}
        />
      ) : null}

      {currentVersion ? (
        rulesQuery.error ? (
          <section
            className="rounded-xl border border-alert-danger-border bg-alert-danger-background p-4"
            role="alert"
          >
            <p className="text-sm font-medium text-alert-danger-title">
              Không tải được Rule của Version này.
            </p>
            <p className="mt-1 text-sm text-alert-danger-description">
              {rulesQuery.error.message}
            </p>
            <button
              type="button"
              className="mt-3 text-sm font-semibold text-primary-500 hover:underline"
              onClick={() => void rulesQuery.refetch()}
            >
              Thử lại
            </button>
          </section>
        ) : (
          listCard
        )
      ) : null}

      <DeleteRecordDialog
        isOpen={Boolean(ruleToDelete)}
        recordType="rule"
        recordName={ruleToDelete?.ruleName ?? ""}
        isDeleting={deleteMutation.isPending}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setRuleToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      >
        <p className="text-sm text-text-secondary">
          {isActive
            ? "Rule sẽ bị xóa khỏi Version Active và thay đổi có hiệu lực ngay. Không thể xóa Rule cuối cùng."
            : "Rule sẽ bị xóa khỏi bản nháp Version này."}
        </p>
      </DeleteRecordDialog>
    </div>
  );

  if (embedded) return content;

  if (routeVersionName) {
    return (
      <main
        id="main-content"
        className="flex h-full min-h-0 min-w-0 flex-col gap-2 overflow-hidden px-2 pt-4 lg:px-6"
      >
        <AdminPageHeader
          section="Rule"
          title={
            <>
              {activeVersion?.versionName ?? versionName}
              {activeVersion?.creation
                ? ` · ${formatDate(activeVersion.creation, true)}`
                : ""}
            </>
          }
          description={
            activeVersion ? "Các Rule trong Version này." : "Đang tải Version."
          }
          canEdit={canEdit}
          before={
            <Button
              type="button"
              variant="ghost"
              appearance="ghost"
              size="sm"
              className="-ml-2 gap-1.5 px-2 text-xs font-medium text-text-secondary hover:text-primary-500"
              onPress={() => router.push("/director/admin/rules-config")}
            >
              <ArrowLeft size={14} aria-hidden="true" />
              Quay lại quản lý Version
            </Button>
          }
          details={
            activeVersion ? (
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-text-tertiary">
                <span className="font-mono font-medium tracking-wide">
                  {activeVersion.versionId ?? versionName}
                </span>
                <CrmRuleStatusBadge status={activeVersion.status} />
                <span>{activeVersion.rulesCount} Rule</span>
                <span>Revision {activeVersion.revision}</span>
                <span>
                  Cập nhật lần cuối:{" "}
                  <strong className="font-medium text-text-secondary">
                    {formatDate(activeVersion.modified)}
                  </strong>
                </span>
              </div>
            ) : null
          }
          actions={
            <RuleVersionActions
              key={`detail-${versionName}`}
              version={versionQuery.data ?? currentVersion}
              canEdit={canEdit}
              onCreated={() => void versionsQuery.refetch()}
              onChanged={() => {
                void versionsQuery.refetch();
                void versionQuery.refetch();
                void groupsQuery.refetch();
                void rulesQuery.refetch();
              }}
            />
          }
          metaLabel="Đồng bộ từ Frappe CRM"
          metaValue={
            <>
              <span className="font-semibold text-text-primary">
                {activeVersion?.rulesCount ?? "—"}
              </span>{" "}
              Rule trong Version
            </>
          }
        />
        <div className="min-h-0 flex-1 overflow-y-auto pt-5 pb-8">
          {content}
        </div>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      className="flex h-full min-h-0 min-w-0 flex-col gap-2 overflow-hidden px-2 pt-4 lg:px-6"
    >
      <AdminPageHeader
        section="Rule"
        title="Quản lý rule"
        description="Quản lý Version và Rule tuyển sinh."
        canEdit={canEdit}
        actions={
          canEdit && versions.length > 0 && !isCreateVersionOpen ? (
            <Button
              size="md"
              className="shrink-0"
              onPress={() => setIsCreateVersionOpen(true)}
            >
              <Plus size={16} aria-hidden="true" />
              Tạo version
            </Button>
          ) : null
        }
        metaLabel="Đồng bộ từ Frappe CRM"
        metaValue={
          <>
            <span className="font-semibold text-text-primary">
              {versionsQuery.data?.total ?? versions.length}
            </span>{" "}
            Version
          </>
        }
      />

      <TabRoot
        defaultValue="manage"
        value={activeTab}
        onValueChange={setActiveTab}
        variant="minimal"
        className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-none border-0 bg-transparent"
      >
        <TabList className="px-1 sm:px-2">
          <TabTrigger value="manage">Quản lý</TabTrigger>
          <TabTrigger value="analyze">Phân tích</TabTrigger>
        </TabList>
        <TabContent
          value="manage"
          className="min-h-0 flex-1 overflow-y-auto px-0 pt-5 pb-8"
        >
          {content}
        </TabContent>
        <TabContent
          value="analyze"
          className="min-h-0 flex-1 overflow-hidden px-0 pt-5"
        >
          <section className="rounded-2xl border border-card-border bg-card-background p-10 text-center shadow-xs">
            <h2 className="text-base font-semibold text-text-primary">
              Phân tích Rule
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">
              Khu vực phân tích hiệu quả và mức độ sử dụng Rule sẽ được triển
              khai sau.
            </p>
          </section>
        </TabContent>
      </TabRoot>
    </main>
  );
}
