"use client";

import { ArrowLeft, Pencil1 } from "@tailgrids/icons";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/common/auth/auth-provider";
import { hasCrmCapability } from "@/components/common/auth/permissions";
import { hasFrappeTechnicalRole } from "@/components/common/auth/rbac";
import { DeleteRecordDialog } from "@/components/common/delete-record-dialog";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tailgrids/core/tooltip";
import {
  useCreateCrmRuleMutation,
  useCrmFactsQuery,
  useCrmRuleQuery,
  useCrmRulesQuery,
  useCrmRuleVersionQuery,
  useDeleteCrmRuleMutation,
  useUpdateCrmRuleMutation,
} from "@/hooks/use-rules-config-queries";
import { useNbaActionsQuery } from "@/hooks/use-nba-actions-queries";
import type {
  CrmRule,
  CrmRuleCondition,
  CrmRuleFeatureScope,
  CrmRuleGateOutcome,
  CrmRulePayload,
  CrmRuleType,
} from "@/services/api/rules-config";

import {
  conditionToDraft,
  draftToCondition,
  hasCondition,
  type RuleFilterGroup,
  type RuleFilterLogic,
} from "./rule-condition-model";
import { RuleConditionRawEditor } from "./rule-condition-raw-editor";
import { RuleFilterBuilder } from "./rule-filter-builder";
import { CrmRuleStatusBadge } from "./rule-status-badges";
import { RuleTargetActionsField } from "./rule-target-actions-field";

const selectClass =
  "h-10 w-full rounded-lg border border-card-border bg-input-background px-3 text-sm text-title-50 outline-none focus:border-input-primary-focus-border focus:ring-4 focus:ring-input-primary-focus-border/20 disabled:cursor-not-allowed disabled:bg-background-gray-secondary";
const inputClass =
  "h-10 w-full rounded-lg border border-card-border bg-input-background px-3 text-sm text-title-50 outline-none placeholder:text-input-placeholder-text focus:border-input-primary-focus-border focus:ring-4 focus:ring-input-primary-focus-border/20 disabled:cursor-not-allowed disabled:bg-background-gray-secondary";
const textAreaClass =
  "min-h-20 w-full resize-y rounded-lg border border-card-border bg-input-background px-3 py-2.5 text-sm text-title-50 outline-none placeholder:text-input-placeholder-text focus:border-input-primary-focus-border focus:ring-4 focus:ring-input-primary-focus-border/20 disabled:cursor-not-allowed disabled:bg-background-gray-secondary";

type MetadataForm = Omit<CrmRulePayload, "condition">;

function defaultMetadata(ruleGroup: string): MetadataForm {
  return {
    ruleId: "",
    ruleGroup,
    ruleName: "",
    description: "",
    featureScope: "all",
    ruleType: "GUARDRAIL",
    gateOutcome: "PASS",
    priority: 100,
    action: "",
    targetActions: [],
    businessReasonTemplate: "{action} is governed by {rule_name}.",
    salesNextStepTemplate: "Chưa có bước tiếp theo được xác định.",
  };
}

function metadataFromRule(rule: CrmRule): MetadataForm {
  return {
    ruleId: rule.ruleId,
    ruleGroup: rule.ruleGroup,
    ruleName: rule.ruleName,
    description: rule.description ?? "",
    featureScope: rule.featureScope,
    ruleType: rule.ruleType,
    gateOutcome: rule.gateOutcome,
    priority: rule.priority,
    action: rule.action,
    targetActions: rule.targetActions,
    businessReasonTemplate: rule.businessReasonTemplate,
    salesNextStepTemplate: rule.salesNextStepTemplate,
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Thao tác Rule thất bại.";
}

export default function RuleBuilderPage({
  mode,
  ruleName,
  versionName,
  initialRuleGroup = "",
  backHref,
}: {
  mode: "create" | "edit";
  ruleName?: string;
  versionName: string;
  initialRuleGroup?: string;
  backHref: string;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const canEdit = hasCrmCapability(user, "rule.manage") || hasFrappeTechnicalRole(user?.roles, "System Manager");
  const isCreate = mode === "create";
  const versionQuery = useCrmRuleVersionQuery(versionName, { enabled: Boolean(versionName) });
  const detailQuery = useCrmRuleQuery(ruleName ?? "", { enabled: !isCreate && Boolean(ruleName) });
  const factsQuery = useCrmFactsQuery();
  const siblingRulesQuery = useCrmRulesQuery({ versionName, pageLength: 200 }, { enabled: Boolean(versionName) });
  const actionCatalogQuery = useNbaActionsQuery({ pageLength: 100 });
  const createMutation = useCreateCrmRuleMutation();
  const updateMutation = useUpdateCrmRuleMutation();
  const deleteMutation = useDeleteCrmRuleMutation();

  const [sourceRule, setSourceRule] = useState<CrmRule | null>(null);
  const [form, setForm] = useState<MetadataForm>(() => defaultMetadata(initialRuleGroup));
  const [groups, setGroups] = useState<RuleFilterGroup[]>([]);
  const [logic, setLogic] = useState<RuleFilterLogic>("all");
  const [useRawEditor, setUseRawEditor] = useState(false);
  const [rawCondition, setRawCondition] = useState<CrmRuleCondition>({});
  const [initialized, setInitialized] = useState(isCreate);
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    if (isCreate || initialized) return;
    const rule = detailQuery.data;
    if (!rule) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSourceRule(rule);
    setForm(metadataFromRule(rule));
    const parsedDraft = conditionToDraft(rule.condition);
    if (parsedDraft) {
      setGroups(parsedDraft.groups);
      setLogic(parsedDraft.logic);
      setUseRawEditor(false);
    } else {
      setUseRawEditor(true);
      setRawCondition(rule.condition);
    }
    setInitialized(true);
  }, [detailQuery.data, initialized, isCreate]);

  const facts = factsQuery.data?.facts ?? [];
  const actionSuggestions = Array.from(new Set([
    ...(actionCatalogQuery.data?.actions ?? []).map((action) => action.code),
    ...(siblingRulesQuery.data?.rules ?? []).map((rule) => rule.action).filter(Boolean),
  ])).sort();
  const version = versionQuery.data;
  const isBusy = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const editable = canEdit && version?.status === "draft" && (isCreate || sourceRule?.status === "draft");
  const title = form.ruleName || (isCreate ? "Rule mới" : "Chi tiết Rule");
  const updateForm = <K extends keyof MetadataForm>(key: K, value: MetadataForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const startEditingName = () => {
    setDraftName(form.ruleName);
    setIsEditingName(true);
  };
  const saveName = () => {
    updateForm("ruleName", draftName.trim());
    setIsEditingName(false);
  };
  const cancelEditingName = () => setIsEditingName(false);

  const condition: CrmRuleCondition = useRawEditor ? rawCondition : draftToCondition({ groups, logic });

  const handleSave = async () => {
    if (!version) {
      toast.error("Chưa chọn Rule Version.");
      return;
    }
    if (!form.ruleId.trim() || !form.ruleGroup.trim() || !form.ruleName.trim() || !form.action.trim()) {
      toast.error("Vui lòng nhập mã, nhóm, tên và action của Rule.");
      return;
    }
    if (!hasCondition(condition)) {
      toast.error("Rule cần ít nhất một điều kiện.");
      return;
    }
    try {
      const payload: CrmRulePayload = { ...form, condition };
      if (isCreate) {
        await createMutation.mutateAsync({ ...payload, versionName: version.name, expectedVersionRevision: version.revision });
        toast.success("Đã tạo bản nháp Rule.");
      } else if (sourceRule) {
        await updateMutation.mutateAsync({ ...payload, name: sourceRule.name, expectedVersionRevision: version.revision });
        toast.success("Đã lưu bản nháp Rule.");
      }
      router.push(backHref);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!sourceRule || !version) return;
    try {
      await deleteMutation.mutateAsync({ name: sourceRule.name, expectedVersionRevision: version.revision });
      toast.success("Đã xoá Rule bản nháp.");
      router.push(backHref);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  if (!isCreate && detailQuery.isPending) {
    return (
      <main className="flex h-full min-h-0 items-center justify-center bg-card-background px-6">
        <p className="text-sm text-text-secondary">Đang tải Rule…</p>
      </main>
    );
  }

  if (!isCreate && (detailQuery.isError || !sourceRule)) {
    return (
      <main className="flex h-full min-h-0 items-center justify-center bg-card-background px-6">
        <section className="w-full max-w-md rounded-2xl border border-card-border bg-card-surface-area p-6 text-center">
          <h1 className="text-xl font-semibold text-text-primary">Không thể tải Rule</h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {detailQuery.error instanceof Error ? detailQuery.error.message : "Rule không tồn tại hoặc bạn không có quyền truy cập."}
          </p>
          <Button type="button" appearance="outline" size="sm" className="mt-5" onPress={() => router.push(backHref)}>
            Quay lại quản lý Rule
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-card-background text-text-primary">
      <header className="relative flex h-[72px] shrink-0 items-center justify-between border-b border-card-border bg-card-surface-area px-2 text-text-primary sm:px-4">
        <Button
          variant="primary"
          appearance="ghost"
          size="lg"
          className="border border-card-border bg-transparent text-text-secondary hover:bg-background-gray-primary hover:text-text-primary"
          onPress={() => router.push(backHref)}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Quay lại quản lý Rule
        </Button>

        <div className="absolute inset-x-20 flex min-w-0 items-center justify-center gap-2 sm:inset-x-32">
          {isEditingName ? (
            <Input
              autoFocus
              aria-label="Tên Rule"
              disabled={!editable}
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              onBlur={saveName}
              onKeyDown={(event) => {
                if (event.key === "Enter") saveName();
                if (event.key === "Escape") cancelEditingName();
              }}
              className="h-auto w-[min(70vw,32rem)] rounded-none border-0 bg-transparent px-2 py-1 text-center text-base leading-8 font-semibold text-text-primary shadow-none outline-none ring-0 focus:border-0 focus:ring-0 sm:text-xl"
            />
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex max-w-full min-w-0">
                  <Button
                    variant="ghost"
                    appearance="ghost"
                    size="md"
                    isDisabled={!editable}
                    aria-label="Đổi tên Rule"
                    className="max-w-full min-w-0 gap-2 px-2 text-text-primary hover:bg-background-gray-primary hover:text-text-primary"
                    onPress={startEditingName}
                  >
                    <span className="truncate text-center text-base font-semibold text-text-primary sm:text-xl">{title}</span>
                    {editable ? <Pencil1 size={17} aria-hidden="true" className="shrink-0 text-text-tertiary" /> : null}
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Đổi tên Rule</p>
              </TooltipContent>
            </Tooltip>
          )}
          {sourceRule ? <CrmRuleStatusBadge status={sourceRule.status} /> : null}
        </div>

        <div className="flex items-center gap-2">
          {!isCreate && sourceRule?.status === "draft" && canEdit && version?.status === "draft" ? (
            <Button type="button" variant="danger" appearance="ghost" size="lg" isDisabled={isBusy} onPress={() => setIsDeleteOpen(true)}>
              Xoá bản nháp
            </Button>
          ) : null}
          {editable ? (
            <Button variant="primary" appearance="fill" size="lg" isDisabled={isBusy} onPress={() => void handleSave()}>
              {isBusy ? "Đang lưu…" : isCreate ? "Tạo Rule" : "Lưu thay đổi"}
            </Button>
          ) : null}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {!version ? (
          <p className="border-b border-card-border bg-alert-danger-background px-4 py-3 text-sm text-alert-danger-title sm:px-8">
            Chưa có Rule Version. Hãy quay lại quản lý Rule để chọn Version.
          </p>
        ) : null}
        {sourceRule && !editable ? (
          <p className="border-b border-card-border bg-background-gray-secondary px-4 py-3 text-sm text-text-secondary sm:px-8">
            Version hoặc Rule đang ở trạng thái chỉ xem. Hãy clone Version để tạo bản nháp mới.
          </p>
        ) : null}
        {factsQuery.error ? (
          <p className="border-b border-card-border bg-alert-danger-background px-4 py-3 text-sm text-alert-danger-title sm:px-8">
            Không tải được fact catalog: {factsQuery.error.message}
          </p>
        ) : null}

        <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-8">
          <section className="space-y-3 rounded-2xl border border-card-border bg-card-surface-area p-4 shadow-xs sm:p-5">
            <div>
              <h3 className="text-sm font-semibold text-title-50">Thông tin Rule</h3>
              <p className="text-xs text-text-tertiary">Các mã này được lưu trực tiếp trên CRM Rule.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium text-title-50">
                Mã Rule
                <input
                  className={inputClass}
                  disabled={!editable || Boolean(sourceRule)}
                  value={form.ruleId}
                  onChange={(event) => updateForm("ruleId", event.target.value.toUpperCase())}
                  placeholder="CRM-RULE-001"
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-title-50">
                Nhóm
                <input
                  className={inputClass}
                  disabled={!editable}
                  value={form.ruleGroup}
                  onChange={(event) => updateForm("ruleGroup", event.target.value.toUpperCase())}
                  placeholder="LEAD_ASSIGNMENT"
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-title-50 sm:col-span-2">
                Mô tả
                <textarea
                  className={textAreaClass}
                  disabled={!editable}
                  value={form.description ?? ""}
                  onChange={(event) => updateForm("description", event.target.value)}
                  placeholder="Mục đích và phạm vi áp dụng của Rule"
                />
              </label>
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border border-card-border bg-card-surface-area p-4 shadow-xs sm:p-5">
            <div>
              <h3 className="text-sm font-semibold text-title-50">Phân loại và action</h3>
              <p className="text-xs text-text-tertiary">Enum phải khớp schema Rule Engine trên Frappe.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium text-title-50">
                Feature scope
                <select
                  className={selectClass}
                  disabled={!editable}
                  value={form.featureScope}
                  onChange={(event) => updateForm("featureScope", event.target.value as CrmRuleFeatureScope)}
                >
                  <option value="all">all</option>
                  <option value="conversation_analysis">conversation_analysis</option>
                  <option value="student_360">student_360</option>
                  <option value="school_360">school_360</option>
                  <option value="nba">nba</option>
                  <option value="copilot">copilot</option>
                </select>
              </label>
              <label className="space-y-1.5 text-sm font-medium text-title-50">
                Rule type
                <select
                  className={selectClass}
                  disabled={!editable}
                  value={form.ruleType}
                  onChange={(event) => updateForm("ruleType", event.target.value as CrmRuleType)}
                >
                  {["GUARDRAIL", "ELIGIBILITY", "PREREQUISITE", "MODIFIER", "RESOLUTION"].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 text-sm font-medium text-title-50">
                Gate outcome
                <select
                  className={selectClass}
                  disabled={!editable}
                  value={form.gateOutcome}
                  onChange={(event) => updateForm("gateOutcome", event.target.value as CrmRuleGateOutcome)}
                >
                  {["PASS", "WAIT", "STOP", "DIRECT", "ESCALATE"].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 text-sm font-medium text-title-50">
                Ưu tiên
                <input
                  className={inputClass}
                  disabled={!editable}
                  type="number"
                  min={0}
                  max={1000}
                  value={form.priority}
                  onChange={(event) => updateForm("priority", Number(event.target.value))}
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-title-50 sm:col-span-2">
                Action
                <input
                  className={inputClass}
                  disabled={!editable}
                  value={form.action}
                  onChange={(event) => updateForm("action", event.target.value.toUpperCase())}
                  placeholder="ALLOW_ASSIGNMENT"
                  list="rule-action-suggestions"
                />
                <datalist id="rule-action-suggestions">
                  {actionSuggestions.map((code) => (
                    <option key={code} value={code} />
                  ))}
                </datalist>
                <p className="text-xs font-normal text-text-tertiary">
                  Mã nghiệp vụ tự do (không thuộc catalog CRM) — gợi ý lấy từ các Action đã dùng trong Version này.
                </p>
              </label>
              <div className="space-y-1.5 text-sm font-medium text-title-50 sm:col-span-2">
                Target actions
                <RuleTargetActionsField
                  value={form.targetActions}
                  disabled={!editable}
                  onChange={(next) => updateForm("targetActions", next)}
                />
                <p className="text-xs font-normal text-text-tertiary">
                  Chọn từ danh mục CRM Action thật (dùng chung với NBA) để tránh gõ sai mã.
                </p>
              </div>
              <label className="space-y-1.5 text-sm font-medium text-title-50 sm:col-span-2">
                Lý do nghiệp vụ
                <textarea
                  className={textAreaClass}
                  disabled={!editable}
                  value={form.businessReasonTemplate ?? ""}
                  onChange={(event) => updateForm("businessReasonTemplate", event.target.value)}
                  placeholder="{action} is governed by {rule_name}."
                  maxLength={240}
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-title-50 sm:col-span-2">
                Bước tiếp theo cho tư vấn viên
                <textarea
                  className={textAreaClass}
                  disabled={!editable}
                  value={form.salesNextStepTemplate ?? ""}
                  onChange={(event) => updateForm("salesNextStepTemplate", event.target.value)}
                  placeholder="Gọi lại để xác nhận nhu cầu nhập học."
                  maxLength={240}
                />
              </label>
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border border-card-border bg-card-surface-area shadow-xs">
            <div className="px-4 pt-4 sm:px-5">
              <h3 className="text-sm font-semibold text-title-50">Điều kiện áp dụng</h3>
              <p className="text-xs text-text-tertiary">Fact và kiểu dữ liệu được lấy từ catalog của backend.</p>
            </div>
            {useRawEditor ? (
              <div className="px-4 pb-4 sm:px-5">
                <RuleConditionRawEditor condition={rawCondition} disabled={!editable} onChange={setRawCondition} />
              </div>
            ) : (
              <RuleFilterBuilder groups={groups} setGroups={setGroups} logic={logic} setLogic={setLogic} facts={facts} disabled={!editable} />
            )}
          </section>
        </div>
      </div>

      {sourceRule ? (
        <DeleteRecordDialog
          isOpen={isDeleteOpen}
          recordType="rule"
          recordName={sourceRule.ruleName}
          isDeleting={deleteMutation.isPending}
          onOpenChange={(open) => {
            if (!open && !deleteMutation.isPending) setIsDeleteOpen(false);
          }}
          onConfirm={handleDelete}
        >
          <p className="text-sm text-text-secondary">Rule sẽ bị xóa khỏi bản nháp Version này.</p>
        </DeleteRecordDialog>
      ) : null}
    </main>
  );
}
