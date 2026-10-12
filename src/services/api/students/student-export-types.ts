import type { RecordExportConfig } from "../record-export/types";
export type {
  RecordExportFieldType as StudentExportFieldType,
  RecordExportField as StudentExportField,
  RecordExportCatalog as StudentExportCatalog,
  RecordExportCondition as StudentExportCondition,
  RecordExportConditions as StudentExportConditions,
  RecordExportPreview as StudentExportPreview,
} from "../record-export/types";
export interface StudentExportBaseFilters {
  q?: string;
  stage?: string;
  admissionYear?: string;
  provinceId?: string;
  ownerId?: string;
  campaignId?: string;
  assignmentStatus?: "assigned" | "unassigned";
  order?: "asc" | "desc";
}
export type StudentExportConfig = RecordExportConfig<StudentExportBaseFilters>;
