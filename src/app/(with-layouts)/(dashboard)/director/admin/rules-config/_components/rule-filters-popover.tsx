"use client";

import { Filter } from "@tailgrids/icons";
import { Dialog, DialogTrigger } from "react-aria-components";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Popover } from "@/components/tailgrids/core/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import type { CrmRuleFeatureScope, CrmRuleGateOutcome, CrmRuleType } from "@/services/api/rules-config";

const FEATURE_SCOPE_OPTIONS: Array<{ value: CrmRuleFeatureScope; label: string }> = [
  { value: "intent", label: "Intent" },
  { value: "student_360", label: "Student 360" },
  { value: "scoring", label: "Scoring" },
  { value: "nba", label: "NBA" },
  { value: "copilot", label: "Copilot" },
];

const RULE_TYPE_OPTIONS: Array<{ value: CrmRuleType; label: string }> = [
  { value: "GUARDRAIL", label: "GUARDRAIL" },
  { value: "ELIGIBILITY", label: "ELIGIBILITY" },
  { value: "PREREQUISITE", label: "PREREQUISITE" },
  { value: "MODIFIER", label: "MODIFIER" },
  { value: "RESOLUTION", label: "RESOLUTION" },
];

const GATE_OUTCOME_OPTIONS: Array<{ value: CrmRuleGateOutcome; label: string }> = [
  { value: "PASS", label: "PASS" },
  { value: "WAIT", label: "WAIT" },
  { value: "STOP", label: "STOP" },
];

interface RuleFiltersPopoverProps {
  featureScope: CrmRuleFeatureScope | "all";
  onFeatureScopeChange: (value: CrmRuleFeatureScope | "all") => void;
  ruleType: CrmRuleType | "all";
  onRuleTypeChange: (value: CrmRuleType | "all") => void;
  gateOutcome: CrmRuleGateOutcome | "all";
  onGateOutcomeChange: (value: CrmRuleGateOutcome | "all") => void;
}

export function RuleFiltersPopover({
  featureScope,
  onFeatureScopeChange,
  ruleType,
  onRuleTypeChange,
  gateOutcome,
  onGateOutcomeChange,
}: RuleFiltersPopoverProps) {
  const activeCount = [
    featureScope !== "all",
    ruleType !== "all",
    gateOutcome !== "all",
  ].filter(Boolean).length;

  const reset = () => {
    onFeatureScopeChange("all");
    onRuleTypeChange("all");
    onGateOutcomeChange("all");
  };

  return (
    <DialogTrigger>
      <Button
        type="button"
        size="sm"
        appearance={activeCount > 0 ? "fill" : "outline"}
        aria-label="Mở bộ lọc Rule"
      >
        <Filter size={16} aria-hidden="true" />
        Bộ lọc
        {activeCount > 0 ? <Badge color="gray">{activeCount}</Badge> : null}
      </Button>
      <Popover placement="bottom end" className="w-[min(28rem,calc(100vw-2rem))] p-0 shadow-lg">
        <Dialog aria-label="Bộ lọc Rule" className="p-4 outline-none sm:p-5">
          {({ close }) => (
            <div>
              <div className="flex items-start justify-between gap-4 border-b border-card-border pb-3">
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">Bộ lọc nâng cao</h2>
                  <p className="mt-1 text-xs leading-5 text-text-tertiary">
                    Thu hẹp danh sách Rule theo phạm vi, loại và kết quả gate.
                  </p>
                </div>
                <Button type="button" size="xs" appearance="ghost" onPress={reset}>
                  Đặt lại
                </Button>
              </div>

              <div className="grid gap-3 py-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Select
                    value={featureScope}
                    onChange={(value) => onFeatureScopeChange(String(value ?? "all") as CrmRuleFeatureScope | "all")}
                  >
                    <SelectLabel>Phạm vi</SelectLabel>
                    <SelectTrigger size="sm" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem id="all" textValue="Tất cả phạm vi">
                        Tất cả phạm vi
                      </SelectItem>
                      {FEATURE_SCOPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} id={option.value} textValue={option.label}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Select value={ruleType} onChange={(value) => onRuleTypeChange(String(value ?? "all") as CrmRuleType | "all")}>
                    <SelectLabel>Loại Rule</SelectLabel>
                    <SelectTrigger size="sm" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem id="all" textValue="Tất cả loại">
                        Tất cả loại
                      </SelectItem>
                      {RULE_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} id={option.value} textValue={option.label}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Select
                    value={gateOutcome}
                    onChange={(value) => onGateOutcomeChange(String(value ?? "all") as CrmRuleGateOutcome | "all")}
                  >
                    <SelectLabel>Kết quả gate</SelectLabel>
                    <SelectTrigger size="sm" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem id="all" textValue="Tất cả gate">
                        Tất cả gate
                      </SelectItem>
                      {GATE_OUTCOME_OPTIONS.map((option) => (
                        <SelectItem key={option.value} id={option.value} textValue={option.label}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-end border-t border-card-border pt-3">
                <Button type="button" size="sm" onPress={close}>
                  Xong
                </Button>
              </div>
            </div>
          )}
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
