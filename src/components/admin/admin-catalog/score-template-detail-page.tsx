"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil1 } from "@tailgrids/icons";
import { Pie, PieChart, Cell, Label, Tooltip } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import type { TooltipContentProps } from "recharts";
import { toast } from "sonner";

import AdminPageHeader from "@/components/common/admin/admin-page-header";
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
  DateTimePickerField,
  ErrorState,
  Field,
  LoadingState,
  SelectInput,
  StatusBadge,
  TextInput,
} from "./admin-catalog-ui";
import ScoreRuleEditDialog from "./score-rule-edit-dialog";
import { ScoreRulesEditor } from "./structured-editors";

const SCORE_TEMPLATE_LIST_PATH = "/director/admin/catalogs";

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

const statusOptions = [
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
    fit_weight: form.fit_weight ? Number(form.fit_weight) : undefined,
    engagement_weight: form.engagement_weight
      ? Number(form.engagement_weight)
      : undefined,
    intent_weight: form.intent_weight
      ? Number(form.intent_weight)
      : undefined,
    rules: form.rules,
  };
}

function getScoreValidationMessage(form: ScoreForm): string | null {
  if (!form.template_name.trim()) return "Tên template không được để trống.";
  if (form.rules.length === 0) {
    return "Thêm ít nhất một rule cho template.";
  }
  if (
    form.rules.some(
      (rule) => rule.rule_kind !== "time_decay" && !rule.signal?.trim(),
    )
  ) {
    return "Bổ sung Signal cho các rule đang thiếu.";
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

function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("px-5 py-6 sm:px-8", className)}>
      <div className="mb-5 max-w-2xl">
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        <p className="mt-1 text-sm leading-5 text-text-secondary">
          {description}
        </p>
      </div>
      {children}
    </section>
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
        <SelectInput
          value={form.status}
          disabled={isDisabled}
          onChange={(event) =>
            updateForm({
              status: event.target.value as ScoreForm["status"],
            })
          }
        >
          <option value="Draft">Nháp</option>
          <option value="Active">Đang dùng</option>
          <option value="Inactive">Ngừng dùng</option>
        </SelectInput>
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
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Field label="Fit weight" hint="Mức độ phù hợp với hồ sơ.">
        <TextInput
          type="number"
          step="0.01"
          value={form.fit_weight}
          disabled={isDisabled}
          onChange={(event) => updateForm({ fit_weight: event.target.value })}
        />
      </Field>
      <Field label="Engagement weight" hint="Mức độ tương tác của lead.">
        <TextInput
          type="number"
          step="0.01"
          value={form.engagement_weight}
          disabled={isDisabled}
          onChange={(event) =>
            updateForm({ engagement_weight: event.target.value })
          }
        />
      </Field>
      <Field label="Intent weight" hint="Mức độ thể hiện ý định đăng ký.">
        <TextInput
          type="number"
          step="0.01"
          value={form.intent_weight}
          disabled={isDisabled}
          onChange={(event) => updateForm({ intent_weight: event.target.value })}
        />
      </Field>
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

function WeightSummary({ form }: { form: ScoreForm }) {
  const items = [
    {
      id: "fit",
      label: "Fit",
      description: "Độ phù hợp",
      value: parseScoreNumber(form.fit_weight),
      color: "var(--primary-500)",
    },
    {
      id: "engagement",
      label: "Engagement",
      description: "Tương tác",
      value: parseScoreNumber(form.engagement_weight),
      color: "var(--info-500)",
    },
    {
      id: "intent",
      label: "Intent",
      description: "Ý định đăng ký",
      value: parseScoreNumber(form.intent_weight),
      color: "var(--success-500)",
    },
  ];
  const total = items.reduce((sum, item) => sum + Math.max(item.value ?? 0, 0), 0);
  const chartData = items.map((item) => ({
    ...item,
    chartValue: Math.max(item.value ?? 0, 0),
    percentage: total > 0 ? (Math.max(item.value ?? 0, 0) / total) * 100 : 0,
  }));
  const hasWeights = total > 0;

  return (
    <div className="grid items-center gap-5 md:grid-cols-[minmax(180px,0.9fr)_minmax(0,1.1fr)]">
      <div
        className="min-w-0"
        aria-label="Biểu đồ tỷ trọng Fit, Engagement và Intent"
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
                            {formatScoreNumber(total)}%
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
              <p className="mt-1 text-xs text-text-tertiary">
                Nhấn nút chỉnh sửa để nhập tỷ trọng.
              </p>
            </div>
          </div>
        )}
      </div>

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
                {formatScoreNumber(item.value)}
              </dd>
              <dd className="mt-0.5 text-xs font-medium tabular-nums text-text-tertiary">
                {hasWeights ? `${formatScoreNumber(item.percentage)}%` : "—"}
              </dd>
            </div>
          </div>
        ))}
        <p className="pt-1 text-xs leading-5 text-text-tertiary">
          Biểu đồ hiển thị tỷ lệ tương đối giữa 3 nhóm trọng số; tổng hợp lệ là
          100%.
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
  onEditRule,
}: {
  rules: ScoreRule[];
  onEditRule: (index: number) => void;
}) {
  if (rules.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-card-border bg-background-gray-secondary/20 px-3 py-5 text-center text-xs text-text-tertiary">
        Chưa có rule chấm điểm.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-tertiary">
        <span>Nhấn biểu tượng bút để chỉnh sửa riêng từng rule.</span>
        <span>Server quản lý policy revision/hash.</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rules.map((rule, index) => (
          <article
            key={`score-rule-summary-${index}`}
            className="rounded-xl border border-card-border bg-background-gray-secondary/20 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-badge-primary-background px-2 py-1 text-xs font-semibold text-badge-primary-text">
                  {rule.rule_kind || "positive"}
                </span>
                <span className="text-xs text-text-tertiary">
                  {rule.is_active === false ? "Tắt" : "Đang dùng"}
                </span>
              </div>
              <Button
                type="button"
                iconOnly
                size="sm"
                appearance="ghost"
                variant="ghost"
                aria-label={`Chỉnh sửa rule ${rule.signal || index + 1}`}
                onPress={() => onEditRule(index)}
              >
                <Pencil1 size={15} aria-hidden="true" />
              </Button>
            </div>
            <p
              className="mt-3 truncate text-sm font-semibold text-text-primary"
              title={rule.signal || "Chưa có signal"}
            >
              {rule.signal || "Chưa có signal"}
            </p>
            <ScoreRuleChart rule={rule} />
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
              <RuleMetric label="Penalty" value={rule.penalty_amount} />
              <RuleMetric label="Multiplier" value={rule.multiplier} />
              <RuleMetric label="Cooldown" value={rule.cooldown_days} />
              <RuleMetric label="Max penalties" value={rule.max_penalties} />
              <RuleTextMetric label="Tier" value={rule.tier_label} />
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}

function ScoreRuleChart({ rule }: { rule: ScoreRule }) {
  const baseValue = Math.max(rule.base_points ?? 0, 0);
  const maxValue = Math.max(rule.max_points ?? 0, 0);
  const chartMax = Math.max(baseValue, maxValue, 1);
  const maxWidth = Math.min(100, (maxValue / chartMax) * 100);
  const baseWidth = Math.min(100, (baseValue / chartMax) * 100);

  return (
    <div className="mt-4 rounded-lg border border-card-border/70 bg-card-background/70 p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
          Mức điểm
        </span>
        <span className="text-xs font-semibold tabular-nums text-text-primary">
          {formatScoreNumber(rule.base_points)} / {formatScoreNumber(rule.max_points)}
        </span>
      </div>
      <div
        className="relative mt-2 h-3 overflow-hidden rounded-full bg-background-gray-secondary"
        role="img"
        aria-label={`Base ${formatScoreNumber(rule.base_points)} trên tối đa ${formatScoreNumber(rule.max_points)}`}
      >
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-primary-200"
          style={{ width: `${maxWidth}%` }}
          aria-hidden="true"
        />
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-primary-500"
          style={{ width: `${baseWidth}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-tertiary">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-primary-500" aria-hidden="true" />
          Base
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-primary-200" aria-hidden="true" />
          Max
        </span>
        {rule.penalty_amount !== undefined ? (
          <span className="font-medium text-error-500">
            Penalty −{formatScoreNumber(rule.penalty_amount)}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function RuleMetric({ label, value }: { label: string; value?: number }) {
  return (
    <div>
      <dt className="text-[11px] text-text-tertiary">{label}</dt>
      <dd className="mt-1 text-sm font-medium tabular-nums text-text-primary">
        {formatScoreNumber(value)}
      </dd>
    </div>
  );
}

function RuleTextMetric({ label, value }: { label: string; value?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] text-text-tertiary">{label}</dt>
      <dd
        className="mt-1 truncate text-sm font-medium text-text-primary"
        title={value || "Chưa thiết lập"}
      >
        {value || "Chưa thiết lập"}
      </dd>
    </div>
  );
}

function CreateScoreTemplateForm({
  form,
  updateForm,
  showRuleErrors,
  isSaving,
  onCancel,
  onSubmit,
}: {
  form: ScoreForm;
  updateForm: ScoreFormUpdater;
  showRuleErrors: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-card-border bg-card-background">
      <form onSubmit={onSubmit}>
        <div className="divide-y divide-card-border">
          <FormSection
            title="Thông tin template"
            description="Đặt tên, trạng thái và khoảng thời gian áp dụng cho policy mới."
          >
            <ScoreTemplateIdentityFields
              form={form}
              updateForm={updateForm}
              isDisabled={isSaving}
            />
          </FormSection>
          <FormSection
            title="Trọng số"
            description="Điều chỉnh mức ảnh hưởng của từng nhóm tín hiệu trong tổng điểm."
          >
            <ScoreWeightFields
              form={form}
              updateForm={updateForm}
              isDisabled={isSaving}
            />
          </FormSection>
          <section className="px-5 py-6 sm:px-8">
            <ScoreRulesEditor
              rules={form.rules}
              onChange={(rules) => updateForm({ rules })}
              showErrors={showRuleErrors}
              isDisabled={isSaving}
            />
            {showRuleErrors && form.rules.length === 0 ? (
              <p className="mt-3 text-xs text-input-error" role="alert">
                Thêm ít nhất một rule cho template.
              </p>
            ) : null}
          </section>
        </div>
        <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-card-border bg-card-background px-5 py-3 sm:px-8">
          <Button
            type="button"
            appearance="outline"
            onPress={onCancel}
            isDisabled={isSaving}
          >
            Hủy
          </Button>
          <Button type="submit" isDisabled={isSaving}>
            {isSaving ? "Đang lưu…" : "Thêm mẫu chấm điểm"}
          </Button>
        </footer>
      </form>
    </section>
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
  const [editingSection, setEditingSection] =
    useState<ScoreEditSection | null>(isCreate ? "details" : null);
  const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null);
  const [showRuleErrors, setShowRuleErrors] = useState(false);

  useEffect(() => {
    if (!templateName || !detailQuery.data) return;
    if (initializedTemplateRef.current === templateName) return;

    const nextForm = toScoreForm(detailQuery.data);
    savedFormRef.current = nextForm;
    setForm(nextForm);
    setEditingSection(null);
    setEditingRuleIndex(null);
    setShowRuleErrors(false);
    initializedTemplateRef.current = templateName;
  }, [detailQuery.data, templateName]);

  const updateForm: ScoreFormUpdater = (patch) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const navigateBack = () => router.push(SCORE_TEMPLATE_LIST_PATH);

  const startEditing = (section: ScoreEditSection) => {
    if (save.isPending || !detailQuery.data) return;
    setForm(savedFormRef.current);
    setShowRuleErrors(false);
    setEditingSection(section);
  };

  const cancelEditing = () => {
    if (save.isPending) return;
    setForm(savedFormRef.current);
    setShowRuleErrors(false);
    setEditingSection(null);
  };

  const saveRule = async (nextRule: ScoreRule) => {
    if (editingRuleIndex === null || !detailQuery.data || save.isPending) {
      return;
    }

    const nextRules = form.rules.map((rule, index) =>
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
      toast.success("Đã cập nhật rule.");
    } catch (error) {
      toast.error(
        normalizeCatalogError(error, "Không thể cập nhật rule."),
      );
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowRuleErrors(true);
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
      setShowRuleErrors(false);
      setEditingSection(null);
      toast.success(isCreate ? "Đã tạo Score Template." : "Đã cập nhật Score Template.");

      if (isCreate && saved.name) {
        router.replace(
          `${SCORE_TEMPLATE_LIST_PATH}/${encodeURIComponent(saved.name)}`,
        );
      }
    } catch (error) {
      toast.error(
        normalizeCatalogError(error, "Không thể lưu Score Template."),
      );
    }
  };

  const detail = detailQuery.data;
  const editingRule =
    editingRuleIndex === null ? null : (form.rules[editingRuleIndex] ?? null);
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
            ? "Thiết lập mẫu và luật chấm điểm cho lead."
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
          <CreateScoreTemplateForm
            form={form}
            updateForm={updateForm}
            showRuleErrors={showRuleErrors}
            isSaving={save.isPending}
            onCancel={navigateBack}
            onSubmit={submit}
          />
        ) : (
          <div className="grid items-start gap-5 lg:grid-cols-2">
            <EditableCard
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
                    Tổng điểm cuối cùng được tính từ các trọng số và rule của
                    template.
                  </p>
                </>
              ) : (
                <WeightSummary form={form} />
              )}
            </EditableCard>

            <Card className="p-5 lg:col-span-2">
              <CardHeader className="mb-5">
                <CardTitle>Luật chấm điểm</CardTitle>
                <span className="rounded-md bg-background-gray-secondary px-2 py-1 text-xs font-medium tabular-nums text-text-secondary">
                  {form.rules.length} {form.rules.length === 1 ? "rule" : "rules"}
                </span>
              </CardHeader>
              <ScoreRulesSummary
                rules={form.rules}
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
        isOpen={editingRuleIndex !== null && Boolean(editingRule)}
        isSaving={save.isPending}
        onClose={() => setEditingRuleIndex(null)}
        onSave={saveRule}
      />
    </main>
  );
}
