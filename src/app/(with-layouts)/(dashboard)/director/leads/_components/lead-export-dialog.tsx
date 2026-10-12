"use client";
import RecordExportDialog from "@/components/common/record-export/record-export-dialog";
import {
  downloadLeadWorkbook,
  exportFilteredLeads,
  getLeadExportFields,
  previewLeadExport,
  type LeadExportBaseFilters,
} from "@/services/api/lead-sale/lead-export";
import type { RecordExportCatalog } from "@/services/api/record-export/types";
interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  canExport: boolean;
  scopeKey: string;
  initialFilters: LeadExportBaseFilters;
}
function describeFilters(
  filters: LeadExportBaseFilters,
  catalog: RecordExportCatalog,
) {
  const label = (id: string, value: string) =>
    catalog.fields
      .find((f) => f.id === id)
      ?.options?.find((o) => o.value === value)?.label ?? value;
  return [
    filters.admissionYear ? `Kỳ tuyển sinh ${filters.admissionYear}` : "",
    filters.q ? `Tìm kiếm “${filters.q}”` : "",
    filters.status ? `Tình trạng ${label("status", filters.status)}` : "",
    filters.resolution
      ? `Kết quả ${label("resolution", filters.resolution)}`
      : "",
    filters.campaign ? `Chiến dịch ${filters.campaign}` : "",
  ].filter(Boolean);
}
export default function LeadExportDialog(props: Props) {
  return (
    <RecordExportDialog
      {...props}
      cacheKey="lead-export-fields"
      title="Xuất Excel Lead"
      entityLabel="Lead"
      getFields={getLeadExportFields}
      previewExport={previewLeadExport}
      exportFile={exportFilteredLeads}
      downloadWorkbook={downloadLeadWorkbook}
      describeFilters={describeFilters}
      clearFilters={(filters) => ({ order: filters.order })}
    />
  );
}
