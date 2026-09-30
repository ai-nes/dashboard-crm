"use client";

import { DropdownField } from "@/components/common/dropdown-field";
import type { ScoreRule, ScoreRuleKind } from "@/services/api/admin-catalog";
import ScoreSignalPicker from "./score-signal-picker";
import {
  createScoreRuleDraft,
  getScoreRuleValidationMessage,
  normalizeScoreRuleKind,
  SCORE_RULE_KIND_OPTIONS,
} from "./score-rule-model";

const inputClass =
  "h-8 w-14 rounded-md border border-transparent bg-transparent px-1 text-center text-sm font-medium tabular-nums text-text-primary outline-none hover:border-card-border focus:border-primary-500 focus:bg-card-background focus:ring-2 focus:ring-primary-500/15 disabled:opacity-60";
const positiveCategories = ["Fit", "Engagement", "Intent"];
const negativeCategories = ["Negative"];
const options = SCORE_RULE_KIND_OPTIONS.map(({ value, label }) => ({
  id: value,
  label,
}));

export default function ScoreRuleInlineRow({
  rule,
  isDisabled,
  onChange,
}: {
  rule: ScoreRule;
  isDisabled: boolean;
  onChange: (patch: Partial<ScoreRule>) => void;
}) {
  const kind = normalizeScoreRuleKind(rule.rule_kind);
  const error = getScoreRuleValidationMessage(rule);
  const fields: {
    field: keyof ScoreRule;
    label: string;
    prefix: string;
    suffix: string;
    step: number;
  }[] =
    kind === "positive"
      ? [
          {
            field: "base_points",
            label: "Điểm cộng",
            prefix: "+",
            suffix: "điểm",
            step: 0.01,
          },
          {
            field: "max_points",
            label: "Điểm tối đa",
            prefix: "· tối đa",
            suffix: "",
            step: 0.01,
          },
        ]
      : kind === "negative"
        ? [
            {
              field: "penalty_amount",
              label: "Điểm trừ",
              prefix: "−",
              suffix: "điểm",
              step: 0.01,
            },
            {
              field: "cooldown_days",
              label: "Thời gian chờ",
              prefix: "· chờ",
              suffix: "ngày",
              step: 1,
            },
            {
              field: "max_penalties",
              label: "Số lần trừ tối đa",
              prefix: "· tối đa",
              suffix: "lần",
              step: 1,
            },
          ]
        : [
            {
              field: "multiplier",
              label: "Hệ số còn lại",
              prefix: "×",
              suffix: "",
              step: 0.01,
            },
            {
              field: "max_days",
              label: "Số ngày tối đa",
              prefix: "· sau",
              suffix: "ngày",
              step: 1,
            },
          ];

  return (
    <tr className="border-t border-card-border hover:bg-background-gray-secondary/20">
      <td className="px-3 py-2.5">
        {kind === "time_decay" ? (
          <input
            aria-label="Nhãn mức độ"
            placeholder="Theo thời gian"
            value={rule.tier_label ?? ""}
            disabled={isDisabled}
            className={`${inputClass} w-full text-left`}
            onChange={(event) => onChange({ tier_label: event.target.value })}
          />
        ) : (
          <div className="[&_input]:bg-transparent [&_input]:text-sm [&_button]:shadow-none [&_[data-slot=input-group]]:border-transparent">
            <ScoreSignalPicker
              value={rule.signal}
              onChange={(signal) => onChange({ signal })}
              isDisabled={isDisabled}
              allowedCategories={
                kind === "negative" ? negativeCategories : positiveCategories
              }
              quiet
            />
          </div>
        )}
      </td>
      <td className="px-3 py-2.5">
        <DropdownField
          ariaLabel="Loại rubric"
          value={kind}
          options={options}
          isDisabled={isDisabled}
          triggerClassName="h-7 border-transparent bg-badge-primary-background px-2 text-xs text-badge-primary-text shadow-none hover:border-card-border"
          onChange={(value) => {
            if (!value || value === kind) return;
            onChange({
              signal: undefined,
              base_points: undefined,
              max_points: undefined,
              penalty_amount: undefined,
              cooldown_days: undefined,
              max_penalties: undefined,
              max_days: undefined,
              multiplier: undefined,
              tier_label: undefined,
              ...createScoreRuleDraft(value as ScoreRuleKind),
              is_active: rule.is_active ?? true,
            });
          }}
        />
      </td>
      <td className="px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-x-1 text-sm text-text-secondary">
          {fields.map(({ field, label, prefix, suffix, step }) => (
            <label key={field} className="inline-flex items-center gap-0.5">
              <span>{prefix}</span>
              <input
                type="number"
                aria-label={label}
                min={0}
                step={step}
                value={
                  typeof rule[field] === "number" ? (rule[field] as number) : ""
                }
                disabled={isDisabled}
                className={inputClass}
                onChange={(event) =>
                  onChange({
                    [field]:
                      event.target.value === ""
                        ? undefined
                        : Number(event.target.value),
                  })
                }
              />
              <span>{suffix}</span>
            </label>
          ))}
        </div>
        {error ? (
          <p className="mt-1 text-xs text-input-error" role="alert">
            {error}
          </p>
        ) : null}
      </td>
      <td className="px-3 py-2.5">
        <DropdownField
          ariaLabel="Trạng thái rubric"
          value={rule.is_active === false ? "off" : "on"}
          options={[
            { id: "on", label: "Đang dùng" },
            { id: "off", label: "Đã tắt" },
          ]}
          isDisabled={isDisabled}
          triggerClassName={`h-7 border-transparent px-2 text-xs shadow-none hover:border-card-border ${rule.is_active === false ? "bg-background-gray-secondary text-text-secondary" : "bg-badge-success-background text-badge-success-text"}`}
          onChange={(value) => onChange({ is_active: value === "on" })}
        />
      </td>
    </tr>
  );
}
