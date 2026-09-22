"use client";

import type { InputHTMLAttributes } from "react";

import { CreateDialogSelect } from "@/components/common/create-dialog-field";
import { Checkbox } from "@/components/tailgrids/core/checkbox";
import type { ScoreRule, ScoreRuleKind } from "@/services/api/admin-catalog";

import { Field, TextInput } from "./admin-catalog-ui";
import {
  createScoreRuleDraft,
  formatScoreRuleEffect,
  getScoreRuleKindMeta,
  getScoreRuleValidationMessage,
  normalizeScoreRuleKind,
  SCORE_RULE_KIND_OPTIONS,
} from "./score-rule-model";
import ScoreSignalPicker from "./score-signal-picker";

const POSITIVE_SIGNAL_CATEGORIES = ["Fit", "Engagement", "Intent"] as const;
const NEGATIVE_SIGNAL_CATEGORIES = ["Negative"] as const;
const SCORE_RULE_KIND_DROPDOWN_OPTIONS = SCORE_RULE_KIND_OPTIONS.map(
  ({ value, label, technicalLabel }) => ({
    id: value,
    label: `${label} (${technicalLabel})`,
  }),
);

interface ScoreRuleFieldsProps {
  rule: ScoreRule;
  onChange: (patch: Partial<ScoreRule>) => void;
  isDisabled?: boolean;
  showErrors?: boolean;
}

interface NumericRuleFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> {
  label: string;
  value?: number;
  onChange: (value: number | undefined) => void;
  hint?: string;
}

function NumericRuleField({
  label,
  value,
  onChange,
  hint,
  ...props
}: NumericRuleFieldProps) {
  return (
    <Field label={label} hint={hint}>
      <TextInput
        {...props}
        type="number"
        value={value === undefined ? "" : value}
        onChange={(event) => {
          const nextValue = event.target.value.trim();
          const parsed = nextValue ? Number(nextValue) : undefined;
          onChange(
            parsed === undefined || Number.isFinite(parsed)
              ? parsed
              : undefined,
          );
        }}
      />
    </Field>
  );
}

export default function ScoreRuleFields({
  rule,
  onChange,
  isDisabled = false,
  showErrors = false,
}: ScoreRuleFieldsProps) {
  const kind = normalizeScoreRuleKind(rule.rule_kind);
  const kindMeta = getScoreRuleKindMeta(kind);
  const allowedSignalCategories =
    kind === "negative"
      ? NEGATIVE_SIGNAL_CATEGORIES
      : POSITIVE_SIGNAL_CATEGORIES;
  const validationMessage = showErrors
    ? getScoreRuleValidationMessage(rule)
    : null;
  const signalError =
    validationMessage && kind !== "time_decay" && !rule.signal?.trim()
      ? validationMessage
      : undefined;

  return (
    <div className="space-y-4">
      <Field
        label="Loại rubric"
        hint="Loại rubric quyết định các trường cấu hình bên dưới."
      >
        <CreateDialogSelect
          label="Loại rubric"
          value={kind}
          options={SCORE_RULE_KIND_DROPDOWN_OPTIONS}
          isDisabled={isDisabled}
          onChange={(value) => {
            const nextKind = value as ScoreRuleKind;
            const defaults = createScoreRuleDraft(nextKind);
            onChange({
              rule_kind: nextKind,
              signal: undefined,
              base_points:
                nextKind === "positive" ? defaults.base_points : undefined,
              max_points:
                nextKind === "positive" ? defaults.max_points : undefined,
              penalty_amount:
                nextKind === "negative" ? defaults.penalty_amount : undefined,
              cooldown_days:
                nextKind === "negative" ? defaults.cooldown_days : undefined,
              max_penalties:
                nextKind === "negative" ? defaults.max_penalties : undefined,
              max_days:
                nextKind === "time_decay" ? defaults.max_days : undefined,
              multiplier:
                nextKind === "time_decay" ? defaults.multiplier : undefined,
              tier_label:
                nextKind === "time_decay" ? defaults.tier_label : undefined,
              is_active: rule.is_active ?? true,
            });
          }}
        />
      </Field>

      {kind !== "time_decay" ? (
        <Field
          label="Tín hiệu"
          hint="Chỉ tín hiệu đang dùng mới được áp dụng vào policy."
          error={signalError}
        >
          <ScoreSignalPicker
            value={rule.signal}
            onChange={(signal) => onChange({ signal })}
            allowedCategories={allowedSignalCategories}
            isDisabled={isDisabled}
          />
        </Field>
      ) : null}

      {kind === "positive" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <NumericRuleField
            label="Điểm cộng cơ bản"
            value={rule.base_points}
            onChange={(base_points) => onChange({ base_points })}
            min={0}
            step="0.01"
            disabled={isDisabled}
            hint="Điểm được cộng khi tín hiệu thỏa điều kiện."
          />
          <NumericRuleField
            label="Điểm cộng tối đa"
            value={rule.max_points}
            onChange={(max_points) => onChange({ max_points })}
            min={0}
            step="0.01"
            disabled={isDisabled}
          />
        </div>
      ) : null}

      {kind === "negative" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <NumericRuleField
            label="Điểm trừ"
            value={rule.penalty_amount}
            onChange={(penalty_amount) => onChange({ penalty_amount })}
            min={0}
            step="0.01"
            disabled={isDisabled}
          />
          <NumericRuleField
            label="Thời gian chờ"
            value={rule.cooldown_days}
            onChange={(cooldown_days) => onChange({ cooldown_days })}
            min={0}
            step={1}
            disabled={isDisabled}
            hint="Số ngày trước khi rule có thể áp dụng lại."
          />
          <NumericRuleField
            label="Số lần trừ tối đa"
            value={rule.max_penalties}
            onChange={(max_penalties) => onChange({ max_penalties })}
            min={0}
            step={1}
            disabled={isDisabled}
          />
        </div>
      ) : null}

      {kind === "time_decay" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <NumericRuleField
            label="Số ngày tối đa"
            value={rule.max_days}
            onChange={(max_days) => onChange({ max_days })}
            min={0}
            step={1}
            disabled={isDisabled}
          />
          <NumericRuleField
            label="Hệ số còn lại"
            value={rule.multiplier}
            onChange={(multiplier) => onChange({ multiplier })}
            min={0}
            step="0.01"
            disabled={isDisabled}
            hint="Ví dụ: 0.8 nghĩa là còn 80% tác động."
          />
          <Field label="Nhãn mức độ" hint="Tên dễ hiểu để nhận diện tier.">
            <TextInput
              value={rule.tier_label ?? ""}
              disabled={isDisabled}
              onChange={(event) => onChange({ tier_label: event.target.value })}
              placeholder="Ví dụ: Cao"
            />
          </Field>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-background-gray-secondary/40 px-3 py-2.5">
        <p className="min-w-0 text-xs text-text-secondary">
          <span className="font-medium text-text-primary">Cách tính: </span>
          {kindMeta.label} · {formatScoreRuleEffect(rule)}
        </p>
        <Checkbox
          size="sm"
          isSelected={rule.is_active ?? true}
          isDisabled={isDisabled}
          onChange={(is_active) => onChange({ is_active })}
          className="shrink-0 text-sm text-text-secondary"
        >
          Đang áp dụng
        </Checkbox>
      </div>
      {validationMessage && !signalError ? (
        <p className="text-xs text-input-error" role="alert">
          {validationMessage}
        </p>
      ) : null}
    </div>
  );
}
