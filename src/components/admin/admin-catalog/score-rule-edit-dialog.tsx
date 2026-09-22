"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import type { ScoreRule } from "@/services/api/admin-catalog";

import { CatalogEditorDialog } from "./admin-catalog-ui";
import ScoreRuleFields from "./score-rule-fields";
import {
  createScoreRuleDraft,
  getScoreRuleKindMeta,
  getScoreRuleValidationMessage,
  normalizeScoreRuleKind,
} from "./score-rule-model";

interface ScoreRuleEditDialogProps {
  rule: ScoreRule | null;
  isOpen: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (rule: ScoreRule) => Promise<void> | void;
}

function toRuleDraft(rule: ScoreRule | null): ScoreRule {
  return {
    ...createScoreRuleDraft(normalizeScoreRuleKind(rule?.rule_kind)),
    ...(rule ?? {}),
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
  const [showErrors, setShowErrors] = useState(false);

  if (!isOpen) return null;

  const updateDraft = (patch: Partial<ScoreRule>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowErrors(true);
    const validationMessage = getScoreRuleValidationMessage(draft);
    if (validationMessage) {
      toast.error(validationMessage);
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
      title={
        rule
          ? `Chỉnh sửa rubric: ${rule.signal || getScoreRuleKindMeta(rule.rule_kind).label}`
          : "Thêm rubric"
      }
      description="Chọn loại rubric và chỉ cấu hình các trường liên quan."
      isOpen={isOpen}
      isSaving={isSaving}
      submitLabel={rule ? "Lưu rubric" : "Thêm rubric"}
      onOpenChange={(open) => {
        if (!open && !isSaving) onClose();
      }}
      onSubmit={handleSubmit}
    >
      <ScoreRuleFields
        rule={draft}
        onChange={updateDraft}
        isDisabled={isSaving}
        showErrors={showErrors}
      />
    </CatalogEditorDialog>
  );
}
