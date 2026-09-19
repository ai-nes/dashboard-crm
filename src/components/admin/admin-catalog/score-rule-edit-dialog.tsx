"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Checkbox } from "@/components/tailgrids/core/checkbox";
import type { ScoreRule } from "@/services/api/admin-catalog";

import {
  CatalogEditorDialog,
  Field,
  SelectInput,
  TextInput,
} from "./admin-catalog-ui";
import { SCORE_RULE_KINDS } from "./structured-editors";

interface ScoreRuleEditDialogProps {
  rule: ScoreRule | null;
  isOpen: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (rule: ScoreRule) => Promise<void> | void;
}

function toRuleDraft(rule: ScoreRule | null): ScoreRule {
  return {
    rule_kind: rule?.rule_kind ?? "positive",
    signal: rule?.signal ?? "",
    base_points: rule?.base_points ?? 0,
    max_points: rule?.max_points ?? 0,
    penalty_amount: rule?.penalty_amount ?? 0,
    cooldown_days: rule?.cooldown_days ?? 0,
    max_penalties: rule?.max_penalties ?? 0,
    multiplier: rule?.multiplier ?? 1,
    tier_label: rule?.tier_label ?? "",
    is_active: rule?.is_active ?? true,
  };
}

export default function ScoreRuleEditDialog({
  rule,
  isOpen,
  isSaving = false,
  onClose,
  onSave,
}: ScoreRuleEditDialogProps) {
  const [draft, setDraft] = useState<ScoreRule>(() => toRuleDraft(rule));

  if (!rule) return null;

  const updateDraft = (patch: Partial<ScoreRule>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (draft.rule_kind !== "time_decay" && !draft.signal?.trim()) {
      toast.error("Signal là bắt buộc với rule này.");
      return;
    }
    void onSave({
      ...draft,
      signal: draft.signal?.trim() || undefined,
      tier_label: draft.tier_label?.trim() || undefined,
    });
  };

  return (
    <CatalogEditorDialog
      title={`Chỉnh sửa rule: ${rule.signal || "Chưa đặt signal"}`}
      description="Cập nhật riêng item này; các rule khác không bị thay đổi."
      isOpen={isOpen}
      isSaving={isSaving}
      submitLabel="Lưu rule"
      onOpenChange={(open) => {
        if (!open && !isSaving) onClose();
      }}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Rule kind">
          <SelectInput
            value={draft.rule_kind ?? "positive"}
            disabled={isSaving}
            onChange={(event) =>
              updateDraft({ rule_kind: event.target.value })
            }
          >
            {SCORE_RULE_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field
          label="Signal"
          hint="Tên tín hiệu được dùng khi tính điểm."
        >
          <TextInput
            value={draft.signal ?? ""}
            disabled={isSaving}
            onChange={(event) => updateDraft({ signal: event.target.value })}
            placeholder="Ví dụ: grade_12"
          />
        </Field>
        <Field label="Base points">
          <TextInput
            type="number"
            step="0.01"
            value={draft.base_points ?? 0}
            disabled={isSaving}
            onChange={(event) =>
              updateDraft({ base_points: Number(event.target.value) || 0 })
            }
          />
        </Field>
        <Field label="Max points">
          <TextInput
            type="number"
            step="0.01"
            value={draft.max_points ?? 0}
            disabled={isSaving}
            onChange={(event) =>
              updateDraft({ max_points: Number(event.target.value) || 0 })
            }
          />
        </Field>
        <Field label="Penalty points">
          <TextInput
            type="number"
            step="0.01"
            value={draft.penalty_amount ?? 0}
            disabled={isSaving}
            onChange={(event) =>
              updateDraft({ penalty_amount: Number(event.target.value) || 0 })
            }
          />
        </Field>
        <Field label="Multiplier">
          <TextInput
            type="number"
            min="0"
            step="0.01"
            value={draft.multiplier ?? 1}
            disabled={isSaving}
            onChange={(event) =>
              updateDraft({ multiplier: Number(event.target.value) || 0 })
            }
          />
        </Field>
        <Field label="Cooldown days">
          <TextInput
            type="number"
            min="0"
            value={draft.cooldown_days ?? 0}
            disabled={isSaving}
            onChange={(event) =>
              updateDraft({ cooldown_days: Number(event.target.value) || 0 })
            }
          />
        </Field>
        <Field label="Max penalties">
          <TextInput
            type="number"
            min="0"
            value={draft.max_penalties ?? 0}
            disabled={isSaving}
            onChange={(event) =>
              updateDraft({ max_penalties: Number(event.target.value) || 0 })
            }
          />
        </Field>
        <Field label="Tier label">
          <TextInput
            value={draft.tier_label ?? ""}
            disabled={isSaving}
            onChange={(event) =>
              updateDraft({ tier_label: event.target.value })
            }
            placeholder="Ví dụ: high"
          />
        </Field>
        <div className="flex items-end pb-1">
          <Checkbox
            size="sm"
            isSelected={draft.is_active ?? true}
            isDisabled={isSaving}
            onChange={(isActive) => updateDraft({ is_active: isActive })}
            className="text-sm text-text-secondary"
          >
            Rule đang được sử dụng
          </Checkbox>
        </div>
      </div>
    </CatalogEditorDialog>
  );
}
