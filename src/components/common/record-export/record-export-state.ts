import type {
  RecordExportConfig,
  RecordExportConditions,
  RecordExportField,
} from "@/services/api/record-export/types";

export const EXPORT_OPERATOR_LABELS: Record<string, string> = {
  in: "Là một trong",
  not_in: "Không thuộc",
  contains: "Chứa",
  not_contains: "Không chứa",
  eq: "Bằng",
  neq: "Khác",
  gt: "Lớn hơn / sau",
  gte: "Từ",
  lt: "Nhỏ hơn / trước",
  lte: "Đến",
  between: "Trong khoảng",
  empty: "Trống",
  not_empty: "Không trống",
};
export function toggleExportColumn(
  columns: string[],
  id: string,
  selected: boolean,
): string[] {
  return selected
    ? columns.includes(id)
      ? columns
      : [...columns, id]
    : columns.filter((column) => column !== id);
}
export function exportConfigKey(config: RecordExportConfig): string {
  return JSON.stringify(config);
}
export function hasCurrentPreview(
  config: RecordExportConfig,
  previewKey: string | undefined,
): boolean {
  return previewKey === exportConfigKey(config);
}
export function validateExportDraft(
  fields: RecordExportField[],
  columns: string[],
  advanced: RecordExportConditions,
): string | null {
  if (
    !columns.length ||
    columns.some((id) => !fields.some((field) => field.id === id))
  )
    return "Vui lòng chọn ít nhất một cột được phép xuất.";
  for (const condition of advanced.conditions) {
    const field = fields.find((field) => field.id === condition.field);
    if (!field || !field.operators.includes(condition.operator))
      return "Vui lòng chọn field và phép lọc hợp lệ.";
    if (["empty", "not_empty"].includes(condition.operator)) continue;
    if (["in", "not_in"].includes(condition.operator)) {
      if (
        (field.type !== "enum" && !field.optionField) ||
        !Array.isArray(condition.value) ||
        !condition.value.length ||
        condition.value.length > 100 ||
        condition.value.some(
          (value) =>
            !value.trim() ||
            (field.optionField
              ? value.length > 191
              : !field.options?.some((option) => option.value === value)),
        )
      )
        return `Vui lòng chọn giá trị hợp lệ cho “${field.label}”.`;
      continue;
    }
    if (Array.isArray(condition.value))
      return `Giá trị “${field.label}” không hợp lệ.`;
    const values =
      condition.operator === "between"
        ? [condition.value, condition.valueTo]
        : [condition.value];
    for (const value of values) {
      if (value === undefined || value === "")
        return `Vui lòng nhập giá trị cho “${field.label}”.`;
      if (field.type === "number" && !Number.isFinite(Number(value)))
        return `“${field.label}” cần giá trị số.`;
      if (
        (field.type === "date" || field.type === "datetime") &&
        (typeof value !== "string" ||
          !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
          !Number.isFinite(new Date(value).getTime()) ||
          new Date(value).toISOString().slice(0, 10) !== value)
      )
        return `Ngày của “${field.label}” không hợp lệ.`;
      if (
        field.integer &&
        (!Number.isInteger(Number(value)) ||
          Number(value) < -2147483648 ||
          Number(value) > 2147483647)
      )
        return `“${field.label}” cần giá trị số nguyên hợp lệ.`;
      if (field.type === "boolean" && typeof value !== "boolean")
        return `Vui lòng chọn Có hoặc Không cho “${field.label}”.`;
      if (
        field.options &&
        !field.options.some((option) => option.value === value)
      )
        return `Giá trị “${field.label}” không hợp lệ.`;
    }
    if (
      condition.operator === "between" &&
      (field.type === "number"
        ? Number(condition.value) > Number(condition.valueTo)
        : String(condition.value) > String(condition.valueTo))
    )
      return `Khoảng lọc “${field.label}” có giá trị bắt đầu lớn hơn kết thúc.`;
  }
  return null;
}
