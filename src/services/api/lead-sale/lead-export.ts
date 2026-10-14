import { nestRequest } from "../nest/nest-client";
import { nestDownload } from "../nest/nest-download";
import { downloadWorkbook } from "../record-export/download-workbook";
import type {
  RecordExportCatalog,
  RecordExportConfig,
  RecordExportPreview,
} from "../record-export/types";
export interface LeadExportBaseFilters {
  q?: string;
  status?: string;
  resolution?: string;
  campaign?: string;
  admissionYear?: string;
  order?: "asc" | "desc";
}
export type LeadExportConfig = RecordExportConfig<LeadExportBaseFilters>;
export function getLeadExportFields(
  signal?: AbortSignal,
): Promise<RecordExportCatalog> {
  return nestRequest("/api/v1/leads/export-fields", { signal });
}
export function previewLeadExport(
  config: LeadExportConfig,
  page = 1,
): Promise<RecordExportPreview> {
  return nestRequest("/api/v1/leads/export-preview", {
    method: "POST",
    body: { ...config, page, pageSize: 20 },
  });
}
export function exportFilteredLeads(config: LeadExportConfig): Promise<Blob> {
  return nestDownload("/api/v1/leads/export", { method: "POST", body: config });
}
export function downloadLeadWorkbook(blob: Blob) {
  downloadWorkbook(blob, "danh-sach-lead.xlsx");
}
