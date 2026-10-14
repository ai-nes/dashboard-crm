"use client";
import RecordExportDialog from "@/components/common/record-export/record-export-dialog";
import {
  downloadStudentWorkbook,
  exportFilteredStudents,
  getStudentExportFields,
  previewStudentExport,
} from "@/services/api/students/student-export";
import type {
  StudentExportBaseFilters,
  StudentExportCatalog,
} from "@/services/api/students/student-export-types";
interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  canExport: boolean;
  scopeKey: string;
  initialFilters: StudentExportBaseFilters;
}
function describeFilters(
  filters: StudentExportBaseFilters,
  catalog: StudentExportCatalog,
) {
  return [
    filters.admissionYear ? `Kỳ tuyển sinh ${filters.admissionYear}` : "",
    filters.q ? `Tìm kiếm “${filters.q}”` : "",
    filters.stage
      ? `Trạng thái ${catalog.fields.find((f) => f.id === "status")?.options?.find((o) => o.value === filters.stage)?.label ?? filters.stage}`
      : "",
    filters.provinceId ? "Có lọc tỉnh/TP" : "",
    filters.campaignId ? "Có lọc campaign" : "",
    filters.ownerId ? "Có lọc người phụ trách" : "",
    filters.assignmentStatus
      ? filters.assignmentStatus === "assigned"
        ? "Đã phân công"
        : "Chưa phân công"
      : "",
  ].filter(Boolean);
}
export default function StudentExportDialog(props: Props) {
  return (
    <RecordExportDialog
      {...props}
      cacheKey="student-export-fields"
      title="Xuất Excel học sinh"
      entityLabel="học sinh"
      getFields={getStudentExportFields}
      previewExport={previewStudentExport}
      exportFile={exportFilteredStudents}
      downloadWorkbook={downloadStudentWorkbook}
      describeFilters={describeFilters}
      clearFilters={(filters) => ({ order: filters.order })}
    />
  );
}
