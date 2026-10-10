"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "@tailgrids/icons";
import { Pie, PieChart, Cell, Label, Tooltip } from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import type { TooltipContentProps } from "recharts";
import { toast } from "sonner";

import AdminPageHeader from "@/components/common/admin/admin-page-header";
import { DropdownField } from "@/components/common/dropdown-field";
import { useAuth } from "@/components/common/auth/auth-provider";
import { getScoreTemplatePermissions } from "./score-template-permissions";
import ScoreRulesInlineEditor from "./score-rules-inline-editor";
import { EditableDetailField } from "@/components/common/editable-detail-field";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { ChartContainer } from "@/components/tailgrids/core/chart";
import { Button } from "@/components/tailgrids/core/button";
import {
  useScoreTemplateDetailQuery,
  useScoreTemplateMutation,
} from "@/hooks/use-admin-catalog-queries";
import {
  normalizeCatalogError,
  type ScoreRule,
  type ScoreTemplate,
} from "@/services/api/admin-catalog";
import { cn } from "@/utils/cn";

import {
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  StatusBadge,
} from "./admin-catalog-ui";

import { getScoreRuleValidationMessage } from "./score-rule-model";
import ScoreTemplateCreateDialog from "./score-template-create-dialog";
import {
  DEFAULT_SCORE_WEIGHT_VALUES,
  SCORE_WEIGHT_DIMENSIONS,
  type ScoreWeightField,
  type ScoreWeightValues,
} from "./score-template-weight-model";

const SCORE_TEMPLATE_LIST_PATH = "/director/admin/catalogs";

type ScoreForm = {
  template_name: string;
  status: ScoreTemplate["status"];
  start_time: string;
  end_time: string;
  fit_weight: string;
  engagement_weight: string;
  intent_weight: string;
  rules: ScoreRule[];
};

type ScoreFormUpdater = (patch: Partial<ScoreForm>) => void;

const emptyForm: ScoreForm = {
  template_name: "",
  status: "Draft",
  start_time: "",
  end_time: "",
  fit_weight: "",
  engagement_weight: "",
  intent_weight: "",
  rules: [],
};

const statusOptions: Array<{ id: ScoreTemplate["status"]; label: string }> = [
  { id: "Draft", label: "Nháp" },
  { id: "Active", label: "Đang dùng" },
  { id: "Inactive", label: "Ngừng dùng" },
];

function toScoreForm(template: ScoreTemplate): ScoreForm {
  return {
    template_name: template.template_name,
    status: template.status,
    start_time: template.start_time?.slice(0, 16) ?? "",
    end_time: template.end_time?.slice(0, 16) ?? "",
    fit_weight:
      template.fit_weight === undefined ? "" : String(template.fit_weight),
    engagement_weight:
      template.engagement_weight === undefined
        ? ""
        : String(template.engagement_weight),
    intent_weight:
      template.intent_weight === undefined
        ? ""
        : String(template.intent_weight),
    rules: template.rules ?? [],
  };
}

function toScorePayload(form: ScoreForm): Partial<ScoreTemplate> {
  return {
    template_name: form.template_name.trim(),
    status: form.status,
    start_time: form.start_time || undefined,
    end_time: form.end_time || undefined,
    fit_weight: parseScoreNumber(form.fit_weight),
    engagement_weight: parseScoreNumber(form.engagement_weight),
    intent_weight: parseScoreNumber(form.intent_weight),
    rules: form.rules,
  };
}

function getScoreValidationMessage(form: ScoreForm): string | null {
  if (!form.template_name.trim()) return "Tên template không được để trống.";
  for (const dimension of SCORE_WEIGHT_DIMENSIONS) {
    const value = Number(form[dimension.field]);
    if (
      !form[dimension.field].trim() ||
      !Number.isFinite(value) ||
      value < 0 ||
      value > 1
    ) {
      return `${dimension.label}: nhập trọng số từ 0 đến 100%.`;
    }
  }
  if (form.rules.length === 0) {
    return "Thêm ít nhất một rubric cho template.";
  }
  const invalidRule = form.rules
    .map(getScoreRuleValidationMessage)
    .find((message): message is string => Boolean(message));
  if (invalidRule) {
    return invalidRule;
  }
  return null;
}

function statusLabel(status: ScoreTemplate["status"]): string {
  return statusOptions.find((option) => option.id === status)?.label ?? status;
}

function formatScoreDateTime(value?: string): string {
  if (!value) return "Chưa thiết lập";
  const [date, time] = value.split("T");
  const [year, month, day] = date.split("-");
  const dateLabel =
    year && month && day ? `${day}/${month}/${year}` : date || "Chưa thiết lập";
  return time ? `${dateLabel} · ${time.slice(0, 5)}` : dateLabel;
}

function formatScoreNumber(value?: number): string {
  return value === undefined
    ? "Chưa thiết lập"
    : new Intl.NumberFormat("vi-VN", {
        maximumFractionDigits: 2,
      }).format(value);
}

function parseScoreNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function formatWeightPercent(value?: number): string {
  if (value === undefined) return "";
  return formatScoreNumber(value <= 1 ? value * 100 : value);
}

function formatWeightInput(value?: number): string {
  if (value === undefined) return "";
  return String(value <= 1 ? value * 100 : value);
}

function parseWeightPercent(value: string): string {
  const parsed = parseScoreNumber(value);
  return parsed === undefined ? "" : String(parsed / 100);
}

function toWeightFraction(value?: number): number {
  if (value === undefined || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(value <= 1 ? value : value / 100, 1));
}

function getScoreWeightValues(form: ScoreForm): ScoreWeightValues {
  return SCORE_WEIGHT_DIMENSIONS.reduce(
    (values, dimension) => {
      values[dimension.id] = toWeightFraction(
        parseScoreNumber(form[dimension.field]),
      );
      return values;
    },
    { ...DEFAULT_SCORE_WEIGHT_VALUES },
  );
}

function ScoreTemplateIdentityFields({
  form,
  updateForm,
  isDisabled,
}: {
  form: ScoreForm;
  updateForm: ScoreFormUpdater;
  isDisabled: boolean;
}) {
  return (
    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 [&_label>span:first-child]:text-xs [&_label>span:first-child]:text-text-tertiary">
      <Field label="Tên template">
        <input
          aria-label="Tên template"
          required
          value={form.template_name}
          disabled={isDisabled}
          className="-ml-2 h-8 w-full rounded-md border border-transparent bg-transparent px-2 text-sm font-medium text-text-primary outline-none hover:border-card-border focus:border-primary-500 focus:bg-card-background focus:ring-2 focus:ring-primary-500/15"
          onChange={(event) =>
            updateForm({ template_name: event.target.value })
          }
        />
      </Field>
      <Field label="Trạng thái">
        <DropdownField
          ariaLabel="Trạng thái"
          value={form.status}
          options={statusOptions}
          isDisabled={isDisabled}
          triggerClassName="-ml-2 h-8 border-transparent bg-transparent px-2 text-sm shadow-none hover:border-card-border"
          onChange={(value) =>
            updateForm({ status: value as ScoreForm["status"] })
          }
        />
      </Field>
      <Field label="Bắt đầu">
        <input
          type="datetime-local"
          aria-label="Bắt đầu"
          value={form.start_time}
          disabled={isDisabled}
          className="-ml-2 h-8 min-w-0 w-full rounded-md border border-transparent bg-transparent px-2 text-sm text-text-primary outline-none hover:border-card-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15"
          onChange={(event) => updateForm({ start_time: event.target.value })}
        />
      </Field>
      <Field label="Kết thúc">
        <input
          type="datetime-local"
          aria-label="Kết thúc"
          value={form.end_time}
          disabled={isDisabled}
          className="-ml-2 h-8 min-w-0 w-full rounded-md border border-transparent bg-transparent px-2 text-sm text-text-primary outline-none hover:border-card-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15"
          onChange={(event) => updateForm({ end_time: event.target.value })}
        />
      </Field>
    </div>
  );
}

function ScoreWeightFields({
  form,
  updateForm,
  isDisabled,
}: {
  form: ScoreForm;
  updateForm: ScoreFormUpdater;
  isDisabled: boolean;
}) {
  const data = getWeightChartData(form);
  const updateWeight = (field: ScoreWeightField, value: string) => {
    updateForm({ [field]: parseWeightPercent(value) } as Partial<ScoreForm>);
  };

  return (
    <div className="grid items-center gap-5 md:grid-cols-[minmax(180px,0.9fr)_minmax(0,1.1fr)]">
      <WeightChart data={data} emptyHint="Nhập tỷ trọng ở các ô bên cạnh." />
      <div className="space-y-3">
        {SCORE_WEIGHT_DIMENSIONS.map((dimension) => (
          <label
            key={dimension.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-card-border bg-background-gray-secondary/20 px-3 py-2.5"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: dimension.color }}
                aria-hidden="true"
              />
              <span>
                <span className="block text-sm font-semibold text-text-primary">
                  {dimension.label}
                </span>
                <span className="block text-xs text-text-tertiary">
                  {dimension.description}
                </span>
              </span>
            </span>
            <span className="flex items-center text-sm font-semibold text-text-primary">
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                aria-label={`${dimension.label} trọng số`}
                value={formatWeightInput(
                  parseScoreNumber(form[dimension.field]),
                )}
                disabled={isDisabled}
                className="h-8 w-16 rounded-md border border-transparent bg-transparent px-1 text-right tabular-nums outline-none hover:border-card-border focus:border-primary-500 focus:bg-card-background focus:ring-2 focus:ring-primary-500/15"
                onChange={(event) =>
                  updateWeight(dimension.field, event.target.value)
                }
              />
              <span>%</span>
            </span>
          </label>
        ))}
        <WeightTotalHint data={data} />
      </div>
    </div>
  );
}

function getWeightChartData(form: ScoreForm) {
  const values = getScoreWeightValues(form);
  const items = SCORE_WEIGHT_DIMENSIONS.map((dimension) => ({
    ...dimension,
    value: values[dimension.id],
  }));
  const total = items.reduce(
    (sum, item) => sum + Math.max(item.value ?? 0, 0),
    0,
  );
  const chartData = items.map((item) => ({
    ...item,
    chartValue: Math.max(item.value ?? 0, 0),
    percentage: total > 0 ? (Math.max(item.value ?? 0, 0) / total) * 100 : 0,
  }));
  const hasWeights = total > 0;
  const totalPercent = total * 100;
  const hasValidTotal = Math.abs(totalPercent - 100) < 0.01;

  return {
    items,
    chartData,
    total,
    hasWeights,
    totalPercent,
    hasValidTotal,
  };
}

type WeightChartData = ReturnType<typeof getWeightChartData>;

function WeightChart({
  data,
  emptyHint = "Chưa có tỷ trọng được thiết lập.",
}: {
  data: WeightChartData;
  emptyHint?: string;
}) {
  const { items, chartData, hasWeights, totalPercent } = data;

  return (
    <div
      className="min-w-0"
      aria-label={`Biểu đồ tỷ trọng ${items.map((item) => item.label).join(", ")}`}
    >
      {hasWeights ? (
        <ChartContainer className="h-56 w-full" height={224} width="100%">
          <PieChart>
            <Tooltip
              cursor={{ fill: "transparent" }}
              content={WeightSummaryTooltip}
            />
            <Pie
              data={chartData}
              dataKey="chartValue"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={3}
              startAngle={90}
              endAngle={-270}
              stroke="var(--card-background)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {chartData.map((item) => (
                <Cell key={item.id} fill={item.color} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        <tspan
                          x={viewBox.cx}
                          dy="-0.2em"
                          className="fill-text-primary text-xl font-semibold"
                        >
                          {formatScoreNumber(totalPercent)}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          dy="1.5em"
                          className="fill-text-tertiary text-[11px]"
                        >
                          Tổng trọng số
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      ) : (
        <div className="flex h-56 items-center justify-center rounded-xl bg-background-gray-secondary/30 text-center">
          <div>
            <p className="text-sm font-semibold text-text-secondary">
              Chưa thiết lập trọng số
            </p>
            <p className="mt-1 text-xs text-text-tertiary">{emptyHint}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function WeightTotalHint({ data }: { data: WeightChartData }) {
  const { hasWeights, totalPercent, hasValidTotal } = data;

  return (
    <p
      className={cn(
        "text-xs leading-5",
        !hasWeights
          ? "text-text-tertiary"
          : hasValidTotal
            ? "text-success-600 dark:text-success-400"
            : "text-warning-600 dark:text-warning-400",
      )}
    >
      {hasWeights
        ? `Tổng trọng số: ${formatScoreNumber(totalPercent)}%. ${hasValidTotal ? "Đã đủ 100%." : "Nên điều chỉnh về 100%."}`
        : "Nhập tỷ trọng theo phần trăm; tổng hợp lệ là 100%."}
    </p>
  );
}

function WeightSummary({ form }: { form: ScoreForm }) {
  const data = getWeightChartData(form);
  const { chartData, hasWeights, totalPercent, hasValidTotal } = data;

  return (
    <div className="grid items-center gap-5 md:grid-cols-[minmax(180px,0.9fr)_minmax(0,1.1fr)]">
      <WeightChart data={data} />

      <dl className="space-y-3">
        {chartData.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-card-border bg-background-gray-secondary/20 px-3 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <dt className="truncate text-sm font-semibold text-text-primary">
                  {item.label}
                </dt>
                <dd className="mt-0.5 truncate text-xs text-text-tertiary">
                  {item.description}
                </dd>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <dd className="text-sm font-semibold tabular-nums text-text-primary">
                {hasWeights ? `${formatWeightPercent(item.value)}%` : "—"}
              </dd>
              <dd className="mt-0.5 text-xs font-medium tabular-nums text-text-tertiary">
                {hasWeights ? `${formatScoreNumber(item.percentage)}%` : "—"}
              </dd>
            </div>
          </div>
        ))}
        <p
          className={cn(
            "pt-1 text-xs leading-5",
            !hasWeights
              ? "text-text-tertiary"
              : hasValidTotal
                ? "text-success-600 dark:text-success-400"
                : "text-warning-600 dark:text-warning-400",
          )}
        >
          {hasWeights
            ? `Tổng trọng số: ${formatScoreNumber(totalPercent)}%. ${hasValidTotal ? "Đã đủ 100%." : "Nên điều chỉnh về 100%."}`
            : "Chưa thiết lập trọng số."}
        </p>
      </dl>
    </div>
  );
}

function WeightSummaryTooltip({
  active,
  payload,
}: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload as
    | { label: string; percentage: number; color: string }
    | undefined;
  if (!item) return null;

  return (
    <div className="rounded-xl border border-card-border bg-card-background px-3 py-2 shadow-md">
      <div className="flex items-center gap-2">
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: item.color }}
          aria-hidden="true"
        />
        <p className="text-xs font-semibold text-text-primary">{item.label}</p>
      </div>
      <p className="mt-1 text-xs text-text-secondary">
        Tỷ trọng: {formatScoreNumber(item.percentage)}%
      </p>
    </div>
  );
}

export default function ScoreTemplateDetailPage({
  templateName,
}: {
  templateName?: string;
}) {
  const { user } = useAuth();
  const permissions = getScoreTemplatePermissions(user);
  const isCreate = !templateName;
  const canRead = isCreate ? permissions.canCreate : permissions.canRead;

  if (!canRead) {
    return (
      <main id="main-content" className="px-2 py-4 lg:px-6">
        <section className="rounded-2xl border border-card-border bg-card-background p-6 text-sm text-text-secondary">
          {isCreate
            ? "Bạn không có quyền tạo Score Template."
            : "Bạn không có quyền xem Score Template."}
        </section>
      </main>
    );
  }

  return (
    <ScoreTemplateDetailContent
      templateName={templateName}
      permissions={permissions}
    />
  );
}

function ScoreTemplateDetailContent({
  templateName,
  permissions,
}: {
  templateName?: string;
  permissions: ReturnType<typeof getScoreTemplatePermissions>;
}) {
  const router = useRouter();
  const isCreate = !templateName;
  const canEdit = permissions.canUpdate;
  const detailQuery = useScoreTemplateDetailQuery(
    templateName ?? null,
    permissions.canRead,
  );
  const save = useScoreTemplateMutation();
  const initializedTemplateRef = useRef<string | null>(null);
  const [savedForm, setSavedForm] = useState<ScoreForm>(emptyForm);
  const [form, setForm] = useState<ScoreForm>(emptyForm);
  const [autoSaveError, setAutoSaveError] = useState<string | null>(null);
  const lastAttemptRef = useRef<string | null>(null);
  const modifiedRef = useRef<string | undefined>(undefined);
  const { mutateAsync, isPending } = save;
  const [showCreateErrors, setShowCreateErrors] = useState(false);

  useEffect(() => {
    if (!templateName || !detailQuery.data) return;
    if (initializedTemplateRef.current === templateName) return;

    const nextForm = toScoreForm(detailQuery.data);
    setSavedForm(nextForm);
    setForm(nextForm);
    modifiedRef.current = detailQuery.data.modified;
    lastAttemptRef.current = null;
    setAutoSaveError(null);
    initializedTemplateRef.current = templateName;
  }, [detailQuery.data, templateName]);

  const updateForm: ScoreFormUpdater = (patch) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const navigateBack = () => router.push(SCORE_TEMPLATE_LIST_PATH);

  const createTemplate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!permissions.canCreate || save.isPending) return;
    setShowCreateErrors(true);
    const templateNameValue = form.template_name.trim();
    if (!templateNameValue) {
      toast.error("Tên template không được để trống.");
      return;
    }

    try {
      const saved = await save.mutateAsync({
        data: {
          template_name: templateNameValue,
          status: form.status,
          start_time: form.start_time || undefined,
          end_time: form.end_time || undefined,
        },
      });
      toast.success("Đã tạo Score Template.");
      if (saved.name) {
        router.replace(
          `${SCORE_TEMPLATE_LIST_PATH}/${encodeURIComponent(saved.name)}`,
        );
      } else {
        navigateBack();
      }
    } catch (error) {
      toast.error(
        normalizeCatalogError(error, "Không thể tạo Score Template."),
      );
    }
  };

  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm);
  const validationMessage = getScoreValidationMessage(form);

  useEffect(() => {
    if (
      isCreate ||
      !canEdit ||
      !isDirty ||
      isPending ||
      validationMessage ||
      initializedTemplateRef.current !== templateName
    )
      return;
    const snapshot = JSON.stringify(form);
    if (lastAttemptRef.current === snapshot) return;
    const timer = window.setTimeout(() => {
      lastAttemptRef.current = snapshot;
      setAutoSaveError(null);
      void mutateAsync({
        name: templateName,
        data: toScorePayload(form),
        expectedModified: modifiedRef.current,
      })
        .then((saved) => {
          if (initializedTemplateRef.current !== templateName) return;
          const nextForm = toScoreForm(saved);
          modifiedRef.current = saved.modified;
          setSavedForm(nextForm);
          setForm((current) =>
            JSON.stringify(current) === snapshot ? nextForm : current,
          );
          lastAttemptRef.current = null;
        })
        .catch((error: unknown) => {
          const message = normalizeCatalogError(
            error,
            "Không thể tự động lưu. Dữ liệu đang nhập vẫn được giữ lại.",
          );
          setAutoSaveError(message);
          toast.error(message);
        });
    }, 800);
    return () => window.clearTimeout(timer);
  }, [
    canEdit,
    form,
    isCreate,
    isDirty,
    isPending,
    mutateAsync,
    templateName,
    validationMessage,
  ]);

  const detail = detailQuery.data;
  const isLoading = !isCreate && detailQuery.isPending;
  const title = isCreate
    ? "Thêm Score Template"
    : detail?.template_name || "Chi tiết Score Template";

  return (
    <main
      id="main-content"
      className="flex h-full min-h-0 min-w-0 flex-col gap-2 overflow-hidden px-2 pt-4 lg:px-6"
    >
      <AdminPageHeader
        section="Cấu hình điểm tiềm năng"
        title={title}
        description={
          isCreate
            ? "Tạo template trước, sau đó thêm từng rubric ở trang chi tiết."
            : "Chỉnh sửa trực tiếp. Thay đổi hợp lệ được tự động lưu."
        }
        before={
          <Button
            type="button"
            variant="ghost"
            appearance="ghost"
            size="sm"
            className="-ml-2 gap-1.5 px-2 text-xs font-medium text-text-secondary hover:text-primary-500"
            onPress={navigateBack}
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Quay lại danh sách
          </Button>
        }
        details={
          detail ? (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-text-tertiary">
              <StatusBadge
                tone={
                  detail.status === "Active"
                    ? "success"
                    : detail.status === "Inactive"
                      ? "danger"
                      : "gray"
                }
              >
                {statusLabel(detail.status)}
              </StatusBadge>
              <span>Revision {detail.policy_revision ?? "—"}</span>
              {canEdit ? (
                <span
                  role="status"
                  className={
                    autoSaveError ? "text-input-error" : "text-text-tertiary"
                  }
                >
                  {isPending
                    ? "Đang lưu…"
                    : autoSaveError
                      ? autoSaveError
                      : isDirty
                        ? validationMessage || "Chờ tự động lưu…"
                        : "Đã lưu"}
                  {autoSaveError ? (
                    <button
                      type="button"
                      className="ml-2 underline"
                      onClick={() => {
                        lastAttemptRef.current = null;
                        setAutoSaveError(null);
                        setForm((current) => ({ ...current }));
                      }}
                    >
                      Thử lại
                    </button>
                  ) : null}
                </span>
              ) : null}

              <span>
                Cập nhật lần cuối: {formatScoreDateTime(detail.modified)}
              </span>
            </div>
          ) : null
        }
      />

      <div className="mt-3 min-h-0 flex-1 overflow-y-auto pb-8">
        {isLoading ? (
          <section className="flex min-h-80 flex-col overflow-hidden rounded-2xl border border-card-border bg-card-background">
            <LoadingState label="Đang tải Score Template…" />
          </section>
        ) : detailQuery.error ? (
          <section className="flex min-h-80 flex-col overflow-hidden rounded-2xl border border-card-border bg-card-background">
            <ErrorState
              message={normalizeCatalogError(
                detailQuery.error,
                "Không thể tải Score Template.",
              )}
              onRetry={() => void detailQuery.refetch()}
            />
          </section>
        ) : isCreate ? (
          <section className="flex min-h-80 flex-col overflow-hidden rounded-2xl border border-card-border bg-card-background">
            <EmptyState>
              Dialog tạo template đang mở. Sau khi tạo, bạn có thể thêm rubric
              từng bước trong trang chi tiết.
            </EmptyState>
          </section>
        ) : (
          <div className="space-y-5">
            <div className="grid items-stretch gap-5 lg:grid-cols-2">
              <Card className="h-full p-5">
                <CardHeader className="mb-5">
                  <CardTitle>Thông tin template</CardTitle>
                </CardHeader>
                {canEdit ? (
                  <ScoreTemplateIdentityFields
                    form={form}
                    updateForm={updateForm}
                    isDisabled={save.isPending}
                  />
                ) : (
                  <dl className="grid gap-5 sm:grid-cols-2">
                    <EditableDetailField
                      label="Tên template"
                      value={form.template_name}
                    />
                    <EditableDetailField
                      label="Trạng thái"
                      value={statusLabel(form.status)}
                    />
                    <EditableDetailField
                      label="Bắt đầu"
                      value={formatScoreDateTime(form.start_time)}
                    />
                    <EditableDetailField
                      label="Kết thúc"
                      value={formatScoreDateTime(form.end_time)}
                    />
                  </dl>
                )}
              </Card>
              <Card className="h-full p-5">
                <CardHeader className="mb-5">
                  <CardTitle>Trọng số</CardTitle>
                </CardHeader>
                {canEdit ? (
                  <ScoreWeightFields
                    form={form}
                    updateForm={updateForm}
                    isDisabled={save.isPending}
                  />
                ) : (
                  <WeightSummary form={form} />
                )}
              </Card>
              <Card className="p-5 lg:col-span-2">
                <CardHeader className="mb-5">
                  <CardTitle>Rubric</CardTitle>
                  <span className="text-xs text-text-secondary">
                    {form.rules.length} rubric
                  </span>
                </CardHeader>
                <ScoreRulesInlineEditor
                  rules={form.rules}
                  canEdit={canEdit}
                  isDisabled={save.isPending}
                  onChange={(rules) => updateForm({ rules })}
                />
              </Card>
            </div>
          </div>
        )}
      </div>
      <ScoreTemplateCreateDialog
        isOpen={permissions.canCreate && isCreate}
        isSaving={save.isPending}
        templateName={form.template_name}
        status={form.status}
        startTime={form.start_time}
        endTime={form.end_time}
        statusOptions={statusOptions}
        showErrors={showCreateErrors}
        onTemplateNameChange={(template_name) => updateForm({ template_name })}
        onStatusChange={(status) => updateForm({ status })}
        onStartTimeChange={(start_time) => updateForm({ start_time })}
        onEndTimeChange={(end_time) => updateForm({ end_time })}
        onCancel={navigateBack}
        onSubmit={createTemplate}
      />
    </main>
  );
}
