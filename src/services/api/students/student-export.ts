import { downloadWorkbook } from "../record-export/download-workbook";
import { nestDownload } from "../nest/nest-download";
import { nestRequest } from "../nest/nest-client";
import type {
  StudentExportCatalog,
  StudentExportConfig,
  StudentExportPreview,
} from "./student-export-types";

export async function exportFilteredStudents(
  request: StudentExportConfig,
  signal?: AbortSignal,
): Promise<Blob> {
  return nestDownload("/api/v1/students/export", {
    method: "POST",
    body: request,
    signal,
  });
}

export function downloadStudentWorkbook(blob: Blob) {
  downloadWorkbook(blob, "ho-so-hoc-sinh.xlsx");
}

export function getStudentExportFields(
  signal?: AbortSignal,
): Promise<StudentExportCatalog> {
  return nestRequest("/api/v1/students/export-fields", { signal });
}
export function previewStudentExport(
  config: StudentExportConfig,
  page = 1,
  signal?: AbortSignal,
): Promise<StudentExportPreview> {
  return nestRequest("/api/v1/students/export-preview", {
    method: "POST",
    body: { ...config, page, pageSize: 20 },
    signal,
  });
}
