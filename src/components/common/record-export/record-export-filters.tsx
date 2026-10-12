"use client";
import { Close } from "@tailgrids/icons";
import { Button } from "@/components/tailgrids/core/button";
import { SegmentFilterLogicSelect } from "@/components/segments/segment-filter-logic-select";
import type {
  RecordExportCondition,
  RecordExportConditions,
  RecordExportField,
} from "@/services/api/record-export/types";
import { EXPORT_OPERATOR_LABELS } from "./record-export-state";
import { RecordExportSelect } from "./record-export-select";
import { RecordExportFieldPicker } from "./record-export-field-picker";
import { RecordExportConditionValue } from "./record-export-condition-value";

export function RecordExportFilters({
  fields,
  value,
  onChange,
}: {
  fields: RecordExportField[];
  value: RecordExportConditions;
  onChange: (value: RecordExportConditions) => void;
}) {
  const update = (index: number, condition: RecordExportCondition) =>
    onChange({
      ...value,
      conditions: value.conditions.map((current, i) =>
        i === index ? condition : current,
      ),
    });
  const add = (field: RecordExportField) => {
    if (value.conditions.length >= 50) return;
    onChange({
      ...value,
      conditions: [
        ...value.conditions,
        { field: field.id, operator: field.operators[0] },
      ],
    });
  };
  const setLogic = (logic: "AND" | "OR") => onChange({ ...value, logic });
  if (value.conditions.length === 0)
    return (
      <section
        aria-label="Bộ lọc nâng cao"
        className="flex min-h-48 flex-col items-center justify-center gap-4 px-4 py-8 text-center"
      >
        <div className="space-y-2">
          <p className="text-base font-medium text-text-primary">
            Chưa có bộ lọc nâng cao
          </p>
          <p className="text-sm text-text-tertiary">
            Thêm bộ lọc để chọn các hồ sơ cần xuất.
          </p>
        </div>
        <RecordExportFieldPicker fields={fields} onSelect={add} />
      </section>
    );
  return (
    <section
      aria-label="Bộ lọc nâng cao"
      className="space-y-3 rounded-2xl border border-card-border bg-card-surface-area p-3 sm:p-4"
    >
      <header className="flex items-center justify-between gap-3 px-1 pb-1">
        <h3 className="font-semibold text-text-primary">Điều kiện lọc</h3>
        <span className="text-xs text-text-tertiary">
          {value.conditions.length}/50 điều kiện
        </span>
      </header>
      <div className="space-y-2">
        {value.conditions.map((condition, index) => {
          const field = fields.find((field) => field.id === condition.field);
          return (
            <div key={index} className="space-y-2">
              {index > 0 && (
                <SegmentFilterLogicSelect
                  value={value.logic}
                  onChange={setLogic}
                  ariaLabel={`Toán tử trước điều kiện ${index + 1}`}
                />
              )}
              <div className="flex flex-wrap items-center gap-2 rounded-lg bg-background-gray-secondary p-3">
                <div className="min-w-40 flex-1">
                  <RecordExportFieldPicker
                    fields={fields}
                    selectedId={condition.field}
                    label={`Trường điều kiện ${index + 1}`}
                    onSelect={(next) =>
                      update(index, {
                        field: next.id,
                        operator: next.operators[0],
                      })
                    }
                  />
                </div>
                <div className="min-w-40 flex-1">
                  <RecordExportSelect
                    label={`Phép lọc điều kiện ${index + 1}`}
                    value={condition.operator}
                    options={(field?.operators ?? []).map((operator) => ({
                      value: operator,
                      label: EXPORT_OPERATOR_LABELS[operator] ?? operator,
                    }))}
                    triggerClassName="h-11 bg-card-surface-area"
                    onChange={(operator) =>
                      update(index, { field: condition.field, operator })
                    }
                  />
                </div>
                <div className="min-w-40 flex-1">
                  <RecordExportConditionValue
                    field={field}
                    condition={condition}
                    index={index}
                    onChange={(condition) => update(index, condition)}
                  />
                </div>
                <Button
                  variant="primary"
                  appearance="ghost"
                  iconOnly
                  size="sm"
                  aria-label={`Xóa điều kiện ${index + 1}`}
                  className="self-end text-text-secondary hover:bg-card-surface-area hover:text-text-primary sm:self-auto"
                  onPress={() =>
                    onChange({
                      ...value,
                      conditions: value.conditions.filter(
                        (_, i) => i !== index,
                      ),
                    })
                  }
                >
                  <Close size={18} aria-hidden="true" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-lg bg-background-gray-secondary p-3">
        <SegmentFilterLogicSelect
          value={value.logic}
          onChange={setLogic}
          ariaLabel="Toán tử khi thêm bộ lọc"
        />
        <RecordExportFieldPicker
          fields={fields}
          onSelect={add}
          isDisabled={value.conditions.length >= 50}
        />
      </div>
      <p className="px-1 text-xs text-text-tertiary">
        Các điều kiện được kết hợp với bộ lọc danh sách và phạm vi dữ liệu bạn
        được xem.
      </p>
    </section>
  );
}
