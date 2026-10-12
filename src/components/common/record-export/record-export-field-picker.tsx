"use client";
import { Plus } from "@tailgrids/icons";
import { DropdownField } from "@/components/common/dropdown-field";
import type { RecordExportField } from "@/services/api/record-export/types";

export function RecordExportFieldPicker({
  fields,
  selectedId,
  onSelect,
  label = "Thêm bộ lọc",
  isDisabled = false,
}: {
  fields: RecordExportField[];
  selectedId?: string;
  onSelect: (field: RecordExportField) => void;
  label?: string;
  isDisabled?: boolean;
}) {
  return (
    <DropdownField
      ariaLabel={label}
      options={fields.map((field) => ({
        id: field.id,
        label: field.label,
        searchText: field.group,
        description: field.group,
      }))}
      value={selectedId}
      onChange={(id) => {
        const field = fields.find((field) => field.id === id);
        if (field) onSelect(field);
      }}
      isSearchable
      isDisabled={isDisabled || fields.length === 0}
      searchPlaceholder="Tìm trường dữ liệu…"
      emptyMessage="Không tìm thấy trường dữ liệu phù hợp."
      triggerClassName={
        selectedId
          ? "h-11 min-w-40 flex-1 bg-card-surface-area"
          : "h-9 w-auto bg-card-surface-area font-medium"
      }
      contentClassName="w-[min(24rem,calc(100vw-1.5rem))]"
      renderValue={(option) =>
        selectedId ? (
          (option?.label ?? "Chọn trường dữ liệu")
        ) : (
          <span className="inline-flex items-center gap-2">
            <Plus size={17} aria-hidden="true" />
            {label}
          </span>
        )
      }
    />
  );
}
