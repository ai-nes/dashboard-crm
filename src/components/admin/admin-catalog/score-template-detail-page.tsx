"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil1, Plus } from "@tailgrids/icons";
import { Pie, PieChart, Cell, Label, Tooltip } from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import type { TooltipContentProps } from "recharts";
import { toast } from "sonner";

import AdminPageHeader from "@/components/common/admin/admin-page-header";
import { CreateDialogSelect } from "@/components/common/create-dialog-field";
import { EditableCard } from "@/components/common/editable-card";
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
  CatalogPagination,
  DateTimePickerField,
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  StatusBadge,
  TextInput,
} from "./admin-catalog-ui";
import ScoreRuleEditDialog from "./score-rule-edit-dialog";
import {
  formatScoreRuleEffect,
  getScoreRuleKindMeta,
  getScoreRuleValidationMessage,
  normalizeScoreRuleKind,
} from "./score-rule-model";
import ScoreTemplateCreateDialog from "./score-template-create-dialog";
import {
  DEFAULT_SCORE_WEIGHT_VALUES,
  SCORE_WEIGHT_DIMENSIONS,
  type ScoreWeightField,
  type ScoreWeightValues,
} from "./score-template-weight-model";

const SCORE_TEMPLATE_LIST_PATH = "/director/admin/catalogs";
const SCORE_RULE_PAGE_SIZE = 5;

type ScoreEditSection = "details" | "weights";

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
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="md:col-span-2 xl:col-span-3">
        <Field
          label="Tên template"
          hint="Tên hiển thị cho đội tuyển sinh khi chọn policy."
        >
          <TextInput
            required
            value={form.template_name}
            disabled={isDisabled}
            onChange={(event) =>
              updateForm({ template_name: event.target.value })
            }
          />
        </Field>
      </div>
      <Field label="Trạng thái" hint="Chỉ template đang dùng mới được áp dụng.">
        <CreateDialogSelect
          label="Trạng thái"
          value={form.status}
          options={statusOptions}
          isDisabled={isDisabled}
          onChange={(value) =>
            updateForm({ status: value as ScoreForm["status"] })
          }
        />
      </Field>
      <div className="xl:col-span-2">
        <Field label="Bắt đầu">
          <DateTimePickerField
            value={form.start_time}
            onChange={(value) => updateForm({ start_time: value })}
            ariaLabel="Thời điểm bắt đầu mẫu chấm điểm"
            disabled={isDisabled}
          />
        </Field>
      </div>
      <div className="xl:col-span-2">
        <Field label="Kết thúc">
          <DateTimePickerField
            value={form.end_time}
            onChange={(value) => updateForm({ end_time: value })}
            ariaLabel="Thời điểm kết thúc mẫu chấm điểm"
            disabled={isDisabled}
          />
        </Field>
      </div>
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
    <div className="grid items-start gap-5 md:grid-cols-[minmax(180px,0.9fr)_minmax(0,1.1fr)]">
      <WeightChart data={data} emptyHint="Nhập tỷ trọng ở các thẻ bên cạnh." />
      <div className="space-y-3">
        {SCORE_WEIGHT_DIMENSIONS.map((dimension) => (
          <div
            key={dimension.id}
            className="rounded-lg border border-card-border bg-background-gray-secondary/20 p-3"
          >
            <Field label={dimension.label} hint={dimension.hint}>
              <div className="relative">
                <TextInput
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={formatWeightInput(
                    parseScoreNumber(form[dimension.field]),
                  )}
                  disabled={isDisabled}
                  aria-label={`${dimension.label} trọng số`}
                  className="pr-10"
                  onChange={(event) =>
                    updateWeight(dimension.field, event.target.value)
                  }
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-text-tertiary">
                  %
                </span>
              </div>
            </Field>
          </div>
        ))}
        <WeightTotalHint data={data} />
      </div>
    </div>
  );
}

function ScoreDateTimeField({
  label,
  value,
  isEditing,
  onChange,
  isDisabled,
}: {
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  isDisabled: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-text-tertiary">{label}</dt>
      {isEditing ? (
        <div className="mt-1.5">
          <DateTimePickerField
            value={value}
            onChange={onChange}
            ariaLabel={label}
            disabled={isDisabled}
          />
        </div>
      ) : (
        <dd className="mt-1 text-sm font-medium text-text-primary">
          {formatScoreDateTime(value)}
        </dd>
      )}
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
  emptyHint = "Nhấn nút chỉnh sửa để nhập tỷ trọng.",
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

function ScoreRulesSummary({
  rules,
  isDisabled,
  onAddRule,
  onEditRule,
}: {
  rules: ScoreRule[];
  isDisabled: boolean;
  onAddRule: () => void;
  onEditRule: (index: number) => void;
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(
    1,
    Math.ceil(rules.length / SCORE_RULE_PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * SCORE_RULE_PAGE_SIZE;
  const visibleRules = rules.slice(pageStart, pageStart + SCORE_RULE_PAGE_SIZE);

  if (rules.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-lg border border-dashed border-card-border bg-background-gray-secondary/20 px-4 py-6 text-center">
        <p className="text-sm font-medium text-text-primary">
          Chưa có rubric nào.
        </p>
        <p className="mt-1 max-w-md text-xs leading-5 text-text-tertiary">
          Tạo từng thành phần điểm riêng để template bắt đầu có cấu hình.
        </p>
        <Button
          type="button"
          size="sm"
          appearance="outline"
          className="mt-4"
          isDisabled={isDisabled}
          onPress={onAddRule}
        >
          <Plus size={15} aria-hidden="true" />
          Thêm rubric
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-tertiary">
          <span>Chọn biểu tượng bút để chỉnh sửa từng rubric.</span>
          <span>Revision/hash do server quản lý.</span>
        </div>
        <Button
          type="button"
          size="sm"
          appearance="outline"
          isDisabled={isDisabled}
          onPress={onAddRule}
        >
          <Plus size={15} aria-hidden="true" />
          Thêm rubric
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-card-border">
        <table className="w-full min-w-[640px] text-left">
          <thead className="bg-background-gray-secondary/60">
            <tr className="border-b border-card-border text-xs text-text-secondary">
              <th className="px-4 py-3 font-semibold">Tín hiệu</th>
              <th className="px-4 py-3 font-semibold">Loại</th>
              <th className="px-4 py-3 font-semibold">Cách tính</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
              <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {visibleRules.map((rule, index) => {
              const ruleIndex = pageStart + index;
              const kind = normalizeScoreRuleKind(rule.rule_kind);
              const kindMeta = getScoreRuleKindMeta(kind);
              const signalLabel =
                kind === "time_decay"
                  ? "Theo thời gian"
                  : rule.signal || "Chưa chọn tín hiệu";
              return (
                <tr key={`score-rule-summary-${ruleIndex}`}>
                  <td className="max-w-[16rem] px-4 py-3">
                    <p
                      className="truncate text-sm font-medium text-text-primary"
                      title={signalLabel}
                    >
                      {signalLabel}
                    </p>
                    {kind === "time_decay" ? (
                      <p className="mt-0.5 text-xs text-text-tertiary">
                        Không cần Signal
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-badge-primary-background px-2 py-1 text-xs font-semibold text-badge-primary-text">
                      {kindMeta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm tabular-nums text-text-secondary">
                    {formatScoreRuleEffect(rule)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      tone={rule.is_active === false ? "gray" : "success"}
                    >
                      {rule.is_active === false ? "Đã tắt" : "Đang dùng"}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      iconOnly
                      size="sm"
                      appearance="ghost"
                      aria-label={`Chỉnh sửa rubric ${signalLabel}`}
                      isDisabled={isDisabled}
                      onPress={() => onEditRule(ruleIndex)}
                    >
                      <Pencil1 size={15} aria-hidden="true" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 ? (
        <CatalogPagination
          page={safePage}
          total={rules.length}
          pageSize={SCORE_RULE_PAGE_SIZE}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}

export default function ScoreTemplateDetailPage({
  templateName,
}: {
  templateName?: string;
}) {
  const router = useRouter();
  const isCreate = !templateName;
  const detailQuery = useScoreTemplateDetailQuery(templateName ?? null);
  const save = useScoreTemplateMutation();
  const initializedTemplateRef = useRef<string | null>(null);
  const savedFormRef = useRef<ScoreForm>(emptyForm);
  const [form, setForm] = useState<ScoreForm>(emptyForm);
  const [editingSection, setEditingSection] = useState<ScoreEditSection | null>(
    null,
  );
  const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null);
  const [showCreateErrors, setShowCreateErrors] = useState(false);

  useEffect(() => {
    if (!templateName || !detailQuery.data) return;
    if (initializedTemplateRef.current === templateName) return;

    const nextForm = toScoreForm(detailQuery.data);
    savedFormRef.current = nextForm;
    setForm(nextForm);
    setEditingSection(null);
    setEditingRuleIndex(null);
    initializedTemplateRef.current = templateName;
  }, [detailQuery.data, templateName]);

  const updateForm: ScoreFormUpdater = (patch) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const navigateBack = () => router.push(SCORE_TEMPLATE_LIST_PATH);

  const createTemplate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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

  const startEditing = (section: ScoreEditSection) => {
    if (save.isPending || !detailQuery.data) return;
    setForm(savedFormRef.current);
    setEditingSection(section);
  };

  const cancelEditing = () => {
    if (save.isPending) return;
    setForm(savedFormRef.current);
    setEditingSection(null);
  };

  const saveRule = async (nextRule: ScoreRule) => {
    if (editingRuleIndex === null || !detailQuery.data || save.isPending) {
      return;
    }

    const nextRules =
      editingRuleIndex === -1
        ? [...form.rules, nextRule]
        : form.rules.map((rule, index) =>
            index === editingRuleIndex ? nextRule : rule,
          );
    const nextForm = { ...form, rules: nextRules };
    const validationMessage = getScoreValidationMessage(nextForm);
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    try {
      const saved = await save.mutateAsync({
        name: templateName,
        data: toScorePayload(nextForm),
        expectedModified: detailQuery.data.modified,
      });
      const savedForm = toScoreForm(saved);
      savedFormRef.current = savedForm;
      setForm(savedForm);
      setEditingRuleIndex(null);
      toast.success(
        editingRuleIndex === -1 ? "Đã thêm rubric." : "Đã cập nhật rubric.",
      );
    } catch (error) {
      toast.error(normalizeCatalogError(error, "Không thể lưu rubric."));
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationMessage = getScoreValidationMessage(form);
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    try {
      const saved = await save.mutateAsync({
        name: templateName,
        data: toScorePayload(form),
        expectedModified: detailQuery.data?.modified,
      });
      const nextForm = toScoreForm(saved);
      savedFormRef.current = nextForm;
      setForm(nextForm);
      setEditingSection(null);
      toast.success("Đã cập nhật Score Template.");
    } catch (error) {
      toast.error(
        normalizeCatalogError(error, "Không thể lưu Score Template."),
      );
    }
  };

  const detail = detailQuery.data;
  const editingRule =
    editingRuleIndex === null || editingRuleIndex < 0
      ? null
      : (form.rules[editingRuleIndex] ?? null);
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
            : "Xem cấu hình điểm tiềm năng và chỉnh sửa từng nhóm thông tin khi cần."
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
          <div className="grid items-stretch gap-5 lg:grid-cols-2">
            <EditableCard
              className="h-full"
              title="Thông tin template"
              editLabel="Chỉnh sửa thông tin template"
              headerContent={
                <StatusBadge
                  tone={
                    form.status === "Active"
                      ? "success"
                      : form.status === "Inactive"
                        ? "danger"
                        : "gray"
                  }
                >
                  {statusLabel(form.status)}
                </StatusBadge>
              }
              isEditing={editingSection === "details"}
              isSaving={save.isPending}
              onEdit={() => startEditing("details")}
              onCancel={cancelEditing}
              onSave={submit}
            >
              {editingSection === "details" ? (
                <ScoreTemplateIdentityFields
                  form={form}
                  updateForm={updateForm}
                  isDisabled={save.isPending}
                />
              ) : (
                <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                  <EditableDetailField
                    label="Tên template"
                    value={form.template_name}
                  />
                  <EditableDetailField
                    label="Trạng thái"
                    value={statusLabel(form.status)}
                  />
                  <ScoreDateTimeField
                    label="Bắt đầu"
                    value={form.start_time}
                    isEditing={false}
                    onChange={() => undefined}
                    isDisabled={false}
                  />
                  <ScoreDateTimeField
                    label="Kết thúc"
                    value={form.end_time}
                    isEditing={false}
                    onChange={() => undefined}
                    isDisabled={false}
                  />
                </dl>
              )}
            </EditableCard>

            <EditableCard
              className="h-full"
              title="Trọng số"
              editLabel="Chỉnh sửa trọng số"
              headerContent={
                <span className="text-xs text-text-tertiary">
                  Tác động đến tổng điểm
                </span>
              }
              isEditing={editingSection === "weights"}
              isSaving={save.isPending}
              onEdit={() => startEditing("weights")}
              onCancel={cancelEditing}
              onSave={submit}
            >
              {editingSection === "weights" ? (
                <>
                  <ScoreWeightFields
                    form={form}
                    updateForm={updateForm}
                    isDisabled={save.isPending}
                  />
                  <p className="mt-4 text-xs leading-5 text-text-tertiary">
                    Tổng điểm cuối cùng được tính từ các trọng số và rubric của
                    template.
                  </p>
                </>
              ) : (
                <WeightSummary form={form} />
              )}
            </EditableCard>

            <Card className="p-5 lg:col-span-2">
              <CardHeader className="mb-5">
                <CardTitle>Rubric</CardTitle>
                <span className="rounded-md bg-background-gray-secondary px-2 py-1 text-xs font-medium tabular-nums text-text-secondary">
                  {form.rules.length} rubric
                </span>
              </CardHeader>
              <ScoreRulesSummary
                rules={form.rules}
                isDisabled={save.isPending}
                onAddRule={() => {
                  if (!save.isPending) setEditingRuleIndex(-1);
                }}
                onEditRule={(index) => {
                  if (!save.isPending) setEditingRuleIndex(index);
                }}
              />
            </Card>
          </div>
        )}
      </div>
      <ScoreRuleEditDialog
        key={editingRuleIndex ?? "closed"}
        rule={editingRule}
        isOpen={editingRuleIndex !== null}
        isSaving={save.isPending}
        onClose={() => setEditingRuleIndex(null)}
        onSave={saveRule}
      />
      <ScoreTemplateCreateDialog
        isOpen={isCreate}
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
