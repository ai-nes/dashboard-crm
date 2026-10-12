export type RecordExportFieldType =
  | "text"
  | "enum"
  | "number"
  | "date"
  | "datetime"
  | "boolean"
  | "json";
export interface RecordExportField {
  id: string;
  label: string;
  group: string;
  type: RecordExportFieldType;
  operators: string[];
  options?: { value: string; label: string }[];
  integer?: boolean;
  optionField?: string;
}
export interface RecordExportCatalog {
  fields: RecordExportField[];
  defaultColumnIds: string[];
  maxRows: number;
}
export interface RecordExportCondition {
  field: string;
  operator: string;
  value?: string | number | boolean | string[];
  valueTo?: string | number;
  logic?: "AND" | "OR";
}
export interface RecordExportConditions {
  logic: "AND" | "OR";
  conditions: RecordExportCondition[];
}
export interface RecordExportConfig<Filters extends object = object> {
  columnIds: string[];
  filters: Filters;
  advancedFilters: RecordExportConditions;
}
export interface RecordExportPreview {
  columns: Pick<RecordExportField, "id" | "label" | "type">[];
  rows: Record<string, string | number | boolean | null>[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
}
