"use client";

import type { AcademicYearLine, ScoreRule } from "@/services/api/admin-catalog";
import { Button } from "@/components/tailgrids/core/button";

import { Field, SelectInput, TextInput } from "./admin-catalog-ui";
import ScoreRuleFields from "./score-rule-fields";
import {
  createScoreRuleDraft,
  getScoreRuleKindMeta,
  isScoreRuleComplete,
} from "./score-rule-model";

const LINE_KINDS: AcademicYearLine["line_kind"][] = [
  "tuition",
  "scholarship",
  "quota",
];

function updateAt<T>(items: T[], index: number, value: T): T[] {
  return items.map((item, itemIndex) => (itemIndex === index ? value : item));
}

export function AcademicYearLinesEditor({
  lines,
  onChange,
  showErrors = false,
}: {
  lines: AcademicYearLine[];
  onChange: (lines: AcademicYearLine[]) => void;
  showErrors?: boolean;
}) {
  const addLine = () =>
    onChange([
      ...lines,
      { line_kind: "tuition", major: "", campus: "", amount: undefined },
    ]);

  return (
    <div className="space-y-3 rounded-lg border border-card-border bg-background-gray-secondary/15 p-3 md:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            Các dòng cấu hình
          </h3>
          <p className="mt-1 text-xs text-text-tertiary">
            Chọn loại dòng rồi nhập campus, ngành và giá trị tương ứng.
          </p>
        </div>
        <Button type="button" size="sm" appearance="outline" onPress={addLine}>
          Thêm dòng
        </Button>
      </div>

      {lines.length === 0 ? (
        <p className="rounded-md border border-dashed border-card-border px-3 py-4 text-center text-xs text-text-tertiary">
          Chưa có dòng nào. Thêm ít nhất một dòng để lưu cấu hình.
        </p>
      ) : (
        lines.map((line, index) => {
          const lineError =
            showErrors && (!line.major.trim() || !line.campus.trim());
          return (
            <div
              key={line.name ?? `new-line-${index}`}
              className="grid gap-3 rounded-md border border-card-border bg-card-background p-3 md:grid-cols-2 xl:grid-cols-4"
            >
              <Field label="Loại dòng">
                <SelectInput
                  value={line.line_kind}
                  aria-label={`Loại dòng ${index + 1}`}
                  onChange={(event) =>
                    onChange(
                      updateAt(lines, index, {
                        ...line,
                        line_kind: event.target
                          .value as AcademicYearLine["line_kind"],
                      }),
                    )
                  }
                >
                  {LINE_KINDS.map((kind) => (
                    <option key={kind} value={kind}>
                      {kind === "tuition"
                        ? "Học phí"
                        : kind === "scholarship"
                          ? "Học bổng"
                          : "Chỉ tiêu"}
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <Field
                label="Campus"
                error={
                  lineError && !line.campus.trim() ? "Chọn campus." : undefined
                }
              >
                <TextInput
                  required
                  value={line.campus}
                  aria-invalid={lineError && !line.campus.trim()}
                  onChange={(event) =>
                    onChange(
                      updateAt(lines, index, {
                        ...line,
                        campus: event.target.value,
                      }),
                    )
                  }
                  placeholder="Mã campus"
                />
              </Field>
              <Field
                label="Major"
                error={
                  lineError && !line.major.trim() ? "Chọn ngành." : undefined
                }
              >
                <TextInput
                  required
                  value={line.major}
                  aria-invalid={lineError && !line.major.trim()}
                  onChange={(event) =>
                    onChange(
                      updateAt(lines, index, {
                        ...line,
                        major: event.target.value,
                      }),
                    )
                  }
                  placeholder="Mã ngành"
                />
              </Field>
              {line.line_kind === "tuition" ? (
                <Field label="Amount">
                  <TextInput
                    type="number"
                    min="0"
                    value={line.amount ?? ""}
                    onChange={(event) =>
                      onChange(
                        updateAt(lines, index, {
                          ...line,
                          amount: event.target.value
                            ? Number(event.target.value)
                            : undefined,
                        }),
                      )
                    }
                    placeholder="0"
                  />
                </Field>
              ) : line.line_kind === "scholarship" ? (
                <>
                  <Field label="Tên học bổng">
                    <TextInput
                      value={line.scholarship_name ?? ""}
                      onChange={(event) =>
                        onChange(
                          updateAt(lines, index, {
                            ...line,
                            scholarship_name: event.target.value,
                          }),
                        )
                      }
                    />
                  </Field>
                  <Field label="Tiêu chí">
                    <TextInput
                      value={line.criteria ?? ""}
                      onChange={(event) =>
                        onChange(
                          updateAt(lines, index, {
                            ...line,
                            criteria: event.target.value,
                          }),
                        )
                      }
                    />
                  </Field>
                </>
              ) : (
                <Field label="Quota">
                  <TextInput
                    type="number"
                    min="0"
                    value={line.quota ?? ""}
                    onChange={(event) =>
                      onChange(
                        updateAt(lines, index, {
                          ...line,
                          quota: event.target.value
                            ? Number(event.target.value)
                            : undefined,
                        }),
                      )
                    }
                    placeholder="0"
                  />
                </Field>
              )}
              <Field label="Ghi chú">
                <TextInput
                  value={line.note ?? ""}
                  onChange={(event) =>
                    onChange(
                      updateAt(lines, index, {
                        ...line,
                        note: event.target.value,
                      }),
                    )
                  }
                />
              </Field>
              <div className="flex items-end justify-end md:col-span-2 xl:col-span-4">
                <Button
                  type="button"
                  size="sm"
                  appearance="ghost"
                  variant="danger"
                  onPress={() =>
                    onChange(
                      lines.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                >
                  Xóa dòng
                </Button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export function ScoreRulesEditor({
  rules,
  onChange,
  showErrors = false,
  isDisabled = false,
  showHeader = true,
}: {
  rules: ScoreRule[];
  onChange: (rules: ScoreRule[]) => void;
  showErrors?: boolean;
  isDisabled?: boolean;
  showHeader?: boolean;
}) {
  const addRule = () => {
    if (isDisabled) return;
    onChange([...rules, createScoreRuleDraft()]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-card-border pb-3">
        {showHeader ? (
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              Luật chấm điểm
            </h3>
            <p className="mt-1 text-xs text-text-tertiary">
              Chọn loại tác động, sau đó chỉ nhập các thông tin cần thiết.
            </p>
          </div>
        ) : (
          <p className="text-xs text-text-tertiary">
            Cấu hình chi tiết từng luật của template.
          </p>
        )}
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-background-gray-secondary px-2 py-1 text-xs font-medium tabular-nums text-text-secondary">
            {rules.length} luật
          </span>
          <Button
            type="button"
            size="sm"
            appearance="outline"
            onPress={addRule}
            isDisabled={isDisabled}
          >
            Thêm luật
          </Button>
        </div>
      </div>

      {rules.length === 0 ? (
        <p className="rounded-lg border border-dashed border-card-border bg-background-gray-secondary/20 px-3 py-5 text-center text-xs text-text-tertiary">
          Chưa có luật. Thêm ít nhất một luật để template có policy chấm điểm.
        </p>
      ) : (
        rules.map((rule, index) => {
          const kindMeta = getScoreRuleKindMeta(rule.rule_kind);
          const invalidRule = showErrors && !isScoreRuleComplete(rule);
          return (
            <div
              key={`score-rule-${index}`}
              className="space-y-4 rounded-lg border border-card-border bg-background-gray-secondary/20 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-badge-primary-background px-2 py-1 text-xs font-semibold text-badge-primary-text">
                      {kindMeta.label}
                    </span>
                    <span className="text-[11px] text-text-tertiary">
                      {kindMeta.technicalLabel}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-text-tertiary">
                    {rule.signal || kindMeta.description}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  appearance="ghost"
                  variant="danger"
                  isDisabled={isDisabled}
                  onPress={() =>
                    onChange(
                      rules.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                >
                  Xóa luật
                </Button>
              </div>
              <ScoreRuleFields
                rule={rule}
                onChange={(patch) =>
                  onChange(updateAt(rules, index, { ...rule, ...patch }))
                }
                isDisabled={isDisabled}
                showErrors={showErrors}
              />
              {invalidRule ? (
                <p className="text-xs text-input-error" role="alert">
                  Hoàn thiện luật trước khi lưu.
                </p>
              ) : null}
            </div>
          );
        })
      )}
    </div>
  );
}
